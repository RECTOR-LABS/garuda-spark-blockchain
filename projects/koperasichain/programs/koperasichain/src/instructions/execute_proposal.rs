use anchor_lang::prelude::*;
use crate::state::{Cooperative, Proposal, ProposalStatus};
use crate::errors::ErrorCode;

/// Execute a passed proposal (admin-only)
pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let clock = Clock::get()?;

    // Validate proposal has passed
    require!(proposal.status == ProposalStatus::Passed, ErrorCode::ProposalNotPassed);

    // Validate voting period has ended (can't execute during voting)
    require!(clock.unix_timestamp > proposal.ends_at, ErrorCode::VotingPeriodNotEnded);

    // Change status to Executed
    proposal.status = ProposalStatus::Executed;

    msg!("Proposal executed: {}", proposal.title);
    msg!("Proposal type: {:?}", proposal.proposal_type);

    // TODO (Future): Implement cross-program invocation for:
    // - FundAllocation: Transfer funds from treasury
    // - MemberRemoval: Deactivate member account
    // For MVP: Just mark as executed

    Ok(())
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,

    pub cooperative: Account<'info, Cooperative>,

    /// Only the cooperative authority (admin) can execute proposals
    #[account(
        constraint = authority.key() == cooperative.authority @ ErrorCode::Unauthorized
    )]
    pub authority: Signer<'info>,
}
