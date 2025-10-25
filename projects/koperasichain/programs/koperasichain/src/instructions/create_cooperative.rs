use anchor_lang::prelude::*;
use crate::state::Cooperative;
use crate::errors::ErrorCode;

/// Create a new cooperative with governance rules
pub fn create_cooperative(
    ctx: Context<CreateCooperative>,
    name: String,
    description: String,
    voting_period_days: u8,
    quorum_percentage: u8,
) -> Result<()> {
    // Input validation
    require!(name.len() > 0 && name.len() <= 50, ErrorCode::InvalidName);
    require!(description.len() <= 200, ErrorCode::InvalidDescription);
    require!(voting_period_days >= 1 && voting_period_days <= 30, ErrorCode::InvalidVotingPeriod);
    require!(quorum_percentage > 0 && quorum_percentage <= 100, ErrorCode::InvalidQuorum);

    let cooperative = &mut ctx.accounts.cooperative;
    let clock = Clock::get()?;

    // Initialize cooperative state
    cooperative.authority = ctx.accounts.authority.key();
    cooperative.name = name;
    cooperative.description = description;
    cooperative.member_count = 1; // Creator is first member
    cooperative.voting_period_days = voting_period_days;
    cooperative.quorum_percentage = quorum_percentage;
    cooperative.created_at = clock.unix_timestamp;
    cooperative.bump = ctx.bumps.cooperative;

    msg!("Cooperative created: {}", cooperative.name);
    msg!("Authority: {}", cooperative.authority);
    msg!("Created at: {}", cooperative.created_at);

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCooperative<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Cooperative::INIT_SPACE,
        seeds = [b"cooperative", authority.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub cooperative: Account<'info, Cooperative>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
