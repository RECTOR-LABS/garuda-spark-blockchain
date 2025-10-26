use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::state::{Treasury, Cooperative, Member};
use crate::errors::ErrorCode;

/// Deposit SOL into the cooperative treasury
pub fn deposit_funds(
    ctx: Context<DepositFunds>,
    amount: u64,
) -> Result<()> {
    // Validate deposit amount
    require!(amount > 0, ErrorCode::InvalidDepositAmount);

    let clock = Clock::get()?;

    // If treasury is newly initialized, set up initial state
    {
        let treasury = &mut ctx.accounts.treasury;
        if treasury.balance == 0 && treasury.deposit_count == 0 {
            treasury.cooperative = ctx.accounts.cooperative.key();
            treasury.balance = 0;
            treasury.allocated_amount = 0;
            treasury.total_distributed = 0;
            treasury.last_deposit_at = 0;
            treasury.last_withdrawal_at = 0;
            treasury.last_distribution_at = 0;
            treasury.deposit_count = 0;
            treasury.withdrawal_count = 0;
            treasury.distribution_count = 0;
            treasury.bump = ctx.bumps.treasury;
        }
    }

    // Transfer SOL from depositor to treasury PDA
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.depositor.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        },
    );
    transfer(cpi_context, amount)?;

    // Update treasury state
    let treasury = &mut ctx.accounts.treasury;
    treasury.balance = treasury.balance.checked_add(amount)
        .ok_or(ErrorCode::MemberCountOverflow)?; // Reusing overflow error
    treasury.last_deposit_at = clock.unix_timestamp;
    treasury.deposit_count = treasury.deposit_count.checked_add(1)
        .ok_or(ErrorCode::MemberCountOverflow)?;

    msg!("Deposited {} lamports to treasury", amount);
    msg!("New balance: {} lamports", treasury.balance);
    msg!("Total deposits: {}", treasury.deposit_count);

    Ok(())
}

#[derive(Accounts)]
pub struct DepositFunds<'info> {
    #[account(
        init_if_needed,
        payer = depositor,
        space = 8 + Treasury::INIT_SPACE,
        seeds = [b"treasury", cooperative.key().as_ref()],
        bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account()]
    pub cooperative: Account<'info, Cooperative>,

    /// The member depositing funds (must be a member of the cooperative)
    #[account(
        seeds = [b"member", cooperative.key().as_ref(), depositor.key().as_ref()],
        bump = member.bump,
        constraint = member.is_active @ ErrorCode::MemberNotActive
    )]
    pub member: Account<'info, Member>,

    #[account(mut)]
    pub depositor: Signer<'info>,

    pub system_program: Program<'info, System>,
}
