use anchor_lang::prelude::*;

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
