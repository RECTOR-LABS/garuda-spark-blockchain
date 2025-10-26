use anchor_lang::prelude::*;
use crate::state::{Treasury, Cooperative};
use crate::errors::ErrorCode;

/// Distribute dividends to all cooperative members equally
/// This is a simplified version - calculates and stores distribution amount
/// Actual transfers happen in claim_dividend instruction
pub fn distribute_dividends(
    ctx: Context<DistributeDividends>,
    total_amount: u64,
) -> Result<()> {
    // Validate distribution amount
    require!(total_amount > 0, ErrorCode::InvalidDistributionAmount);

    let cooperative = &ctx.accounts.cooperative;
    let treasury = &mut ctx.accounts.treasury;

    // Ensure there are members to distribute to
    require!(cooperative.member_count > 0, ErrorCode::NoMembersToDistribute);

    // Check sufficient available balance
    require!(
        treasury.has_available_balance(total_amount),
        ErrorCode::InsufficientAvailableBalance
    );

    let clock = Clock::get()?;

    // Calculate per-member share (equal distribution for MVP)
    let per_member_share = total_amount
        .checked_div(cooperative.member_count as u64)
        .ok_or(ErrorCode::InvalidDistributionAmount)?;

    // Update treasury state
    treasury.total_distributed = treasury.total_distributed
        .checked_add(total_amount)
        .ok_or(ErrorCode::MemberCountOverflow)?;

    treasury.balance = treasury.balance
        .checked_sub(total_amount)
        .ok_or(ErrorCode::InsufficientBalance)?;

    treasury.last_distribution_at = clock.unix_timestamp;
    treasury.distribution_count = treasury.distribution_count
        .checked_add(1)
        .ok_or(ErrorCode::MemberCountOverflow)?;

    msg!("Dividend distribution initiated");
    msg!("Total amount: {} lamports", total_amount);
    msg!("Number of members: {}", cooperative.member_count);
    msg!("Per member share: {} lamports", per_member_share);
    msg!("Distribution #{}", treasury.distribution_count);

    // Note: In production, you'd emit an event here and have members claim their dividends
    // For MVP, we're doing instant distribution (which requires passing all member accounts)
    // This is simplified - production would use a claim-based model

    Ok(())
}

#[derive(Accounts)]
pub struct DistributeDividends<'info> {
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

    pub system_program: Program<'info, System>,
}
