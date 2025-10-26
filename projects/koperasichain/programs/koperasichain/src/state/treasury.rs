use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Treasury {
    /// The cooperative this treasury belongs to
    pub cooperative: Pubkey,

    /// Total balance in lamports (SOL)
    pub balance: u64,

    /// Total amount allocated (for proposals)
    pub allocated_amount: u64,

    /// Total amount distributed as dividends
    pub total_distributed: u64,

    /// Last deposit timestamp
    pub last_deposit_at: i64,

    /// Last withdrawal timestamp
    pub last_withdrawal_at: i64,

    /// Last dividend distribution timestamp
    pub last_distribution_at: i64,

    /// Total number of deposits
    pub deposit_count: u32,

    /// Total number of withdrawals
    pub withdrawal_count: u32,

    /// Total number of dividend distributions
    pub distribution_count: u32,

    /// PDA bump seed
    pub bump: u8,
}

impl Treasury {
    /// Calculate available balance (total - allocated)
    pub fn available_balance(&self) -> u64 {
        self.balance.saturating_sub(self.allocated_amount)
    }

    /// Check if there's enough available balance
    pub fn has_available_balance(&self, amount: u64) -> bool {
        self.available_balance() >= amount
    }
}
