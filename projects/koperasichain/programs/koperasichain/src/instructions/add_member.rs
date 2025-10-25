use anchor_lang::prelude::*;
use crate::state::{Cooperative, Member};
use crate::errors::ErrorCode;

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
