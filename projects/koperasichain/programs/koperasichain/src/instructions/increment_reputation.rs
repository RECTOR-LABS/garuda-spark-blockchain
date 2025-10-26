use anchor_lang::prelude::*;
use crate::state::{Cooperative, Member};

/// Increment a member's reputation score
/// Can be called after voting, creating proposals, or other participation
pub fn increment_reputation(
    ctx: Context<IncrementReputation>,
    points: u32,
) -> Result<()> {
    let member = &mut ctx.accounts.member;

    // Add reputation points with overflow check
    member.reputation_score = member.reputation_score.saturating_add(points);

    msg!("Reputation increased");
    msg!("Member: {}", member.wallet);
    msg!("Points added: {}", points);
    msg!("New reputation score: {}", member.reputation_score);

    Ok(())
}

#[derive(Accounts)]
pub struct IncrementReputation<'info> {
    #[account(
        mut,
        seeds = [b"member", cooperative.key().as_ref(), member.wallet.as_ref()],
        bump = member.bump,
    )]
    pub member: Account<'info, Member>,

    #[account()]
    pub cooperative: Account<'info, Cooperative>,
}
