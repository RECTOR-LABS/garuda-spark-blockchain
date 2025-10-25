use anchor_lang::prelude::*;

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
