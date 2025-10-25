use anchor_lang::prelude::*;

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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, InitSpace)]
pub enum VoteChoice {
    Yes,
    No,
    Abstain,
}
