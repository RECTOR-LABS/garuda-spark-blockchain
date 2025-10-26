use anchor_lang::prelude::*;
use crate::state::{Treasury, Cooperative};
use crate::errors::ErrorCode;

/// Withdraw funds from treasury (admin only, requires proposal approval in production)
pub fn withdraw_funds(
    ctx: Context<WithdrawFunds>,
    amount: u64,
) -> Result<()> {
    // Validate withdrawal amount
    require!(amount > 0, ErrorCode::InvalidWithdrawalAmount);

    let treasury = &mut ctx.accounts.treasury;

    // Check sufficient available balance (respects allocated amounts)
    require!(
        treasury.has_available_balance(amount),
        ErrorCode::InsufficientAvailableBalance
    );

    let clock = Clock::get()?;

    // Transfer SOL from treasury PDA to recipient
    let cooperative_key = ctx.accounts.cooperative.key();
    let seeds = &[
        b"treasury",
        cooperative_key.as_ref(),
        &[treasury.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: treasury.to_account_info(),
            to: ctx.accounts.recipient.to_account_info(),
        },
        signer_seeds,
    );
    anchor_lang::system_program::transfer(cpi_context, amount)?;

    // Update treasury state
    treasury.balance = treasury.balance
        .checked_sub(amount)
        .ok_or(ErrorCode::InsufficientBalance)?;

    treasury.last_withdrawal_at = clock.unix_timestamp;
    treasury.withdrawal_count = treasury.withdrawal_count
        .checked_add(1)
        .ok_or(ErrorCode::MemberCountOverflow)?;

    msg!("Withdrawn {} lamports from treasury", amount);
    msg!("New balance: {} lamports", treasury.balance);
    msg!("Recipient: {}", ctx.accounts.recipient.key());

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(
        mut,
        seeds = [b"treasury", cooperative.key().as_ref()],
        bump = treasury.bump,
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        constraint = cooperative.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub cooperative: Account<'info, Cooperative>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Recipient can be any account
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
