use anchor_lang::prelude::*;
use crate::state::{Cooperative, Member, Proposal, ProposalStatus, Vote, VoteChoice};
use crate::errors::ErrorCode;

/// Cast a vote on a proposal
pub fn cast_vote(
    ctx: Context<CastVote>,
    vote_choice: VoteChoice,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let vote = &mut ctx.accounts.vote;
    let clock = Clock::get()?;

    // Validate proposal is still active
    require!(proposal.status == ProposalStatus::Active, ErrorCode::ProposalNotActive);

    // Validate voting period hasn't ended
    require!(clock.unix_timestamp <= proposal.ends_at, ErrorCode::VotingPeriodEnded);

    // Validate voter is an active member
    let member = &ctx.accounts.member;
    require!(member.is_active, ErrorCode::MemberNotActive);

    // Initialize vote
    vote.proposal = proposal.key();
    vote.voter = ctx.accounts.voter.key();
    vote.vote_choice = vote_choice;
    vote.voted_at = clock.unix_timestamp;
    vote.bump = ctx.bumps.vote;

    // Update vote tallies
    match vote_choice {
        VoteChoice::Yes => {
            proposal.yes_votes = proposal.yes_votes.checked_add(1)
                .ok_or(ErrorCode::VoteCountOverflow)?;
        },
        VoteChoice::No => {
            proposal.no_votes = proposal.no_votes.checked_add(1)
                .ok_or(ErrorCode::VoteCountOverflow)?;
        },
        VoteChoice::Abstain => {
            proposal.abstain_votes = proposal.abstain_votes.checked_add(1)
                .ok_or(ErrorCode::VoteCountOverflow)?;
        },
    }

    msg!("Vote cast: {:?}", vote_choice);
    msg!("Current tally - Yes: {}, No: {}, Abstain: {}",
        proposal.yes_votes, proposal.no_votes, proposal.abstain_votes);

    // Check if quorum is reached
    let cooperative = &ctx.accounts.cooperative;
    let total_votes = proposal.yes_votes + proposal.no_votes + proposal.abstain_votes;
    let vote_percentage = (total_votes * 100) / cooperative.member_count;

    if vote_percentage >= cooperative.quorum_percentage as u32 {
        // Determine outcome
        if proposal.yes_votes > proposal.no_votes {
            proposal.status = ProposalStatus::Passed;
            msg!("Proposal PASSED with quorum!");
        } else {
            proposal.status = ProposalStatus::Failed;
            msg!("Proposal FAILED");
        }
    }

    // Increment voter's reputation (gamification)
    let member = &mut ctx.accounts.member;
    member.reputation_score = member.reputation_score.saturating_add(10); // 10 points per vote
    msg!("Voter reputation increased to: {}", member.reputation_score);

    Ok(())
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,

    pub cooperative: Account<'info, Cooperative>,

    /// The member account of the voter (ensures they're a member)
    #[account(
        constraint = member.cooperative == cooperative.key() @ ErrorCode::NotAMember,
        constraint = member.wallet == voter.key() @ ErrorCode::NotAMember,
        constraint = member.is_active @ ErrorCode::MemberNotActive
    )]
    pub member: Account<'info, Member>,

    #[account(
        init,
        payer = voter,
        space = 8 + Vote::INIT_SPACE,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote: Account<'info, Vote>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}
