use anchor_lang::prelude::*;

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
