use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("RECs4kXKatsFrGWckRqBujXL2Qs9FLDeFcF9PYCZ3Za");

#[program]
pub mod koperasichain {
    use super::*;

    pub fn create_cooperative(
        ctx: Context<CreateCooperative>,
        name: String,
        description: String,
        voting_period_days: u8,
        quorum_percentage: u8,
    ) -> Result<()> {
        instructions::create_cooperative::create_cooperative(
            ctx,
            name,
            description,
            voting_period_days,
            quorum_percentage,
        )
    }

    pub fn add_member(ctx: Context<AddMember>) -> Result<()> {
        instructions::add_member::add_member(ctx)
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        proposal_type: ProposalType,
    ) -> Result<()> {
        instructions::create_proposal::create_proposal(ctx, title, description, proposal_type)
    }

    pub fn cast_vote(ctx: Context<CastVote>, vote_choice: VoteChoice) -> Result<()> {
        instructions::cast_vote::cast_vote(ctx, vote_choice)
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        instructions::execute_proposal::execute_proposal(ctx)
    }

    pub fn deposit_funds(ctx: Context<DepositFunds>, amount: u64) -> Result<()> {
        instructions::deposit_funds::deposit_funds(ctx, amount)
    }

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>, amount: u64) -> Result<()> {
        instructions::withdraw_funds::withdraw_funds(ctx, amount)
    }

    pub fn distribute_dividends(ctx: Context<DistributeDividends>, total_amount: u64) -> Result<()> {
        instructions::distribute_dividends::distribute_dividends(ctx, total_amount)
    }

    pub fn update_member_role(ctx: Context<UpdateMemberRole>, new_role: state::MemberRole) -> Result<()> {
        instructions::update_member_role::update_member_role(ctx, new_role)
    }

    pub fn increment_reputation(ctx: Context<IncrementReputation>, points: u32) -> Result<()> {
        instructions::increment_reputation::increment_reputation(ctx, points)
    }
}
