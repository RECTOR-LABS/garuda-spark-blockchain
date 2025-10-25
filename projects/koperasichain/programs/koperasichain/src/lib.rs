use anchor_lang::prelude::*;

declare_id!("4GVcmbRKrGWLR1fSttYYtgCmbbLSViLcYUpHvq4cwWZQ");

#[program]
pub mod koperasichain {
    use super::*;

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

    /// Add a member to an existing cooperative
    pub fn add_member(
        ctx: Context<AddMember>,
    ) -> Result<()> {
        let cooperative = &mut ctx.accounts.cooperative;
        let member = &mut ctx.accounts.member;
        let clock = Clock::get()?;

        // Initialize member account
        member.cooperative = cooperative.key();
        member.wallet = ctx.accounts.member_wallet.key();
        member.joined_at = clock.unix_timestamp;
        member.is_active = true;
        member.bump = ctx.bumps.member;

        // Increment member count in cooperative
        cooperative.member_count = cooperative.member_count.checked_add(1)
            .ok_or(ErrorCode::MemberCountOverflow)?;

        msg!("Member added to cooperative: {}", cooperative.name);
        msg!("Member wallet: {}", member.wallet);
        msg!("Total members: {}", cooperative.member_count);

        Ok(())
    }

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

        Ok(())
    }
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

#[derive(Accounts)]
pub struct AddMember<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub cooperative: Account<'info, Cooperative>,

    #[account(
        init,
        payer = authority,
        space = 8 + Member::INIT_SPACE,
        seeds = [b"member", cooperative.key().as_ref(), member_wallet.key().as_ref()],
        bump
    )]
    pub member: Account<'info, Member>,

    /// CHECK: This is the wallet address of the member being added
    pub member_wallet: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
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

#[account]
#[derive(InitSpace)]
pub struct Cooperative {
    /// Authority (creator/admin) of the cooperative
    pub authority: Pubkey,

    /// Name of the cooperative (max 50 chars)
    #[max_len(50)]
    pub name: String,

    /// Description (max 200 chars)
    #[max_len(200)]
    pub description: String,

    /// Number of members in the cooperative
    pub member_count: u32,

    /// Voting period in days (1-30)
    pub voting_period_days: u8,

    /// Minimum percentage of members required to vote (1-100)
    pub quorum_percentage: u8,

    /// Unix timestamp when cooperative was created
    pub created_at: i64,

    /// PDA bump seed
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Member {
    /// The cooperative this member belongs to
    pub cooperative: Pubkey,

    /// Member's wallet address
    pub wallet: Pubkey,

    /// Unix timestamp when member joined
    pub joined_at: i64,

    /// Whether the member is currently active
    pub is_active: bool,

    /// PDA bump seed
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    /// The cooperative this proposal belongs to
    pub cooperative: Pubkey,

    /// Wallet that created the proposal
    pub proposer: Pubkey,

    /// Title of the proposal (max 100 chars)
    #[max_len(100)]
    pub title: String,

    /// Description (max 500 chars)
    #[max_len(500)]
    pub description: String,

    /// Type of proposal
    pub proposal_type: ProposalType,

    /// Number of yes votes
    pub yes_votes: u32,

    /// Number of no votes
    pub no_votes: u32,

    /// Number of abstain votes
    pub abstain_votes: u32,

    /// Current status of the proposal
    pub status: ProposalStatus,

    /// Unix timestamp when proposal was created
    pub created_at: i64,

    /// Unix timestamp when voting period ends
    pub ends_at: i64,

    /// PDA bump seed
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Vote {
    /// The proposal being voted on
    pub proposal: Pubkey,

    /// Wallet of the voter
    pub voter: Pubkey,

    /// The vote choice
    pub vote_choice: VoteChoice,

    /// Unix timestamp when vote was cast
    pub voted_at: i64,

    /// PDA bump seed
    pub bump: u8,
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ProposalType {
    TextProposal,
    FundAllocation,
    MemberRemoval,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ProposalStatus {
    Active,
    Passed,
    Failed,
    Executed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, InitSpace)]
pub enum VoteChoice {
    Yes,
    No,
    Abstain,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Cooperative name must be 1-50 characters")]
    InvalidName,

    #[msg("Description must be 200 characters or less")]
    InvalidDescription,

    #[msg("Voting period must be between 1 and 30 days")]
    InvalidVotingPeriod,

    #[msg("Quorum percentage must be between 1 and 100")]
    InvalidQuorum,

    #[msg("Only the cooperative authority can perform this action")]
    Unauthorized,

    #[msg("Member count overflow")]
    MemberCountOverflow,

    #[msg("Proposal title must be 1-100 characters")]
    InvalidProposalTitle,

    #[msg("Proposal description must be 1-500 characters")]
    InvalidProposalDescription,

    #[msg("Proposal is not active")]
    ProposalNotActive,

    #[msg("Voting period has ended")]
    VotingPeriodEnded,

    #[msg("Member is not active")]
    MemberNotActive,

    #[msg("Not a member of this cooperative")]
    NotAMember,

    #[msg("Vote count overflow")]
    VoteCountOverflow,
}
