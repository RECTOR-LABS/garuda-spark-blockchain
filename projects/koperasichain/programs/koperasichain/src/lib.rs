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
}
