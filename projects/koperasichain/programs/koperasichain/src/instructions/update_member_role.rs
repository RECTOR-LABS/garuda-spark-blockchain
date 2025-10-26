use anchor_lang::prelude::*;
use crate::state::{Cooperative, Member, MemberRole};
use crate::errors::ErrorCode;

/// Update a member's role (Admin, Member, Moderator)
/// Only admins can update member roles
pub fn update_member_role(
    ctx: Context<UpdateMemberRole>,
    new_role: MemberRole,
) -> Result<()> {
    let member = &mut ctx.accounts.member;
    let updater = &ctx.accounts.updater_member;

    // Verify updater is an admin
    require!(
        updater.role == MemberRole::Admin,
        ErrorCode::Unauthorized
    );

    // Prevent self-demotion if you're the last admin
    if member.wallet == updater.wallet &&
       updater.role == MemberRole::Admin &&
       new_role != MemberRole::Admin {
        // TODO: Add check to prevent last admin from demoting themselves
        // For MVP, we allow it (cooperative authority can always add new admins)
    }

    let old_role = member.role.clone();
    member.role = new_role.clone();

    msg!("Member role updated");
    msg!("Member: {}", member.wallet);
    msg!("Old role: {:?}", old_role);
    msg!("New role: {:?}", member.role);

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateMemberRole<'info> {
    #[account(
        mut,
        seeds = [b"member", cooperative.key().as_ref(), member.wallet.as_ref()],
        bump = member.bump,
    )]
    pub member: Account<'info, Member>,

    #[account(
        seeds = [b"member", cooperative.key().as_ref(), updater.key().as_ref()],
        bump = updater_member.bump,
    )]
    pub updater_member: Account<'info, Member>,

    #[account()]
    pub cooperative: Account<'info, Cooperative>,

    #[account(mut)]
    pub updater: Signer<'info>,

    pub system_program: Program<'info, System>,
}
