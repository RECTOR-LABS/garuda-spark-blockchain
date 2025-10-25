use anchor_lang::prelude::*;
use crate::state::{Cooperative, Member, Proposal, ProposalType, ProposalStatus};
use crate::errors::ErrorCode;

/// Create a proposal for members to vote on
pub fn create_proposal(
    ctx: Context<CreateProposal>,
    title: String,
    description: String,
    proposal_type: ProposalType,
) -> Result<()> {
    // Input validation
    require!(title.len() > 0 && title.len() <= 100, ErrorCode::InvalidProposalTitle);
    require!(description.len() > 0 && description.len() <= 500, ErrorCode::InvalidProposalDescription);

    let proposal = &mut ctx.accounts.proposal;
    let cooperative = &ctx.accounts.cooperative;
    let clock = Clock::get()?;

    // Calculate end time based on cooperative's voting period
    let voting_period_seconds = (cooperative.voting_period_days as i64) * 24 * 60 * 60;
    let ends_at = clock.unix_timestamp + voting_period_seconds;

    // Initialize proposal
    proposal.cooperative = cooperative.key();
    proposal.proposer = ctx.accounts.proposer.key();
    proposal.title = title;
    proposal.description = description;
    proposal.proposal_type = proposal_type;
    proposal.yes_votes = 0;
    proposal.no_votes = 0;
    proposal.abstain_votes = 0;
    proposal.status = ProposalStatus::Active;
    proposal.created_at = clock.unix_timestamp;
    proposal.ends_at = ends_at;
    proposal.bump = ctx.bumps.proposal;

    msg!("Proposal created: {}", proposal.title);
    msg!("Voting ends at: {}", ends_at);

    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", cooperative.key().as_ref(), title.as_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub cooperative: Account<'info, Cooperative>,

    /// The member account of the proposer (ensures they're a member)
    #[account(
        constraint = member.cooperative == cooperative.key() @ ErrorCode::NotAMember,
        constraint = member.wallet == proposer.key() @ ErrorCode::NotAMember,
        constraint = member.is_active @ ErrorCode::MemberNotActive
    )]
    pub member: Account<'info, Member>,

    #[account(mut)]
    pub proposer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
