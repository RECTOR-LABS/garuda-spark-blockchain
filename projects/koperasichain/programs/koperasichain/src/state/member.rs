use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, InitSpace)]
pub enum MemberRole {
    /// Regular member (can vote, create proposals, deposit)
    Member,
    /// Administrator (all permissions + manage members, execute proposals)
    Admin,
    /// Moderator (can manage proposals, moderate discussions)
    Moderator,
}

impl Default for MemberRole {
    fn default() -> Self {
        MemberRole::Member
    }
}

#[account]
#[derive(InitSpace)]
pub struct Member {
    /// The cooperative this member belongs to
    pub cooperative: Pubkey,

    /// Member's wallet address
    pub wallet: Pubkey,

    /// Member's role (Admin, Member, Moderator)
    pub role: MemberRole,

    /// Reputation score (increases with participation)
    pub reputation_score: u32,

    /// Unix timestamp when member joined
    pub joined_at: i64,

    /// Whether the member is currently active
    pub is_active: bool,

    /// PDA bump seed
    pub bump: u8,
}
