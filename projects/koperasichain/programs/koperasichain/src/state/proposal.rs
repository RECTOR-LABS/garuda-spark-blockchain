use anchor_lang::prelude::*;

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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Debug)]
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
