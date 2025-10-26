# Epic 2 Testing Guide - KoperasiChain
**Date:** October 25, 2025
**Status:** Ready for Manual Testing
**Dev Server:** http://localhost:3001

---

## 🎯 Testing Objectives

Verify that the complete **proposal creation → voting → execution** lifecycle works flawlessly from the user's perspective.

---

## 📋 Prerequisites

### Required Tools:
- ✅ Dev server running on localhost:3001
- ✅ Phantom or Solflare wallet installed (browser extension)
- ✅ Devnet SOL in your wallet (use https://faucet.solana.com)
- ✅ At least 2 wallet addresses for testing (authority + member)

### Program Details:
- **Program ID:** `RECs4kXKatsFrGWckRqBujXL2Qs9FLDeFcF9PYCZ3Za`
- **Network:** Solana Devnet
- **Explorer:** https://explorer.solana.com/?cluster=devnet

---

## 🧪 Test Flow 1: Complete Proposal Lifecycle (Happy Path)

### Step 1: Create Cooperative (Admin/Authority)
1. Open http://localhost:3001
2. Click "Connect Wallet" → Select Phantom/Solflare
3. Ensure you're on **Devnet** in your wallet
4. Fill out cooperative creation form:
   - Name: "Test Batik Coop" (or any name)
   - Description: "Testing voting system"
   - Voting Period: 7 days (default)
   - Quorum: 60% (default)
5. Click "Create Cooperative"
6. Approve transaction in wallet
7. **VERIFY:**
   - ✅ Success message appears
   - ✅ Solana Explorer link is clickable
   - ✅ Redirected to dashboard
   - ✅ Cooperative name displays correctly
   - ✅ Member count shows "1" (yourself)

### Step 2: Generate Invite Link
1. On dashboard, locate "Invite Members" section
2. Click "Copy Invite Link" button
3. **VERIFY:**
   - ✅ "Link Copied!" message appears
   - ✅ Link contains cooperative PDA address
4. Save this link for Step 3

### Step 3: Add Member (Use Second Wallet)
1. **Switch to a different wallet** (Wallet #2)
   - Use Phantom's "Create New Account" or
   - Use a different browser with another wallet
2. Ensure Wallet #2 has Devnet SOL
3. Paste the invite link from Step 2
4. Click "Join Cooperative"
5. Approve transaction
6. **VERIFY:**
   - ✅ Success message appears
   - ✅ Redirected to cooperative dashboard
   - ✅ You're listed as a member
   - ✅ Member count increased to "2"

### Step 4: Create Proposal (Any Member)
1. From dashboard, click "Proposals" tab
2. Click "Create Proposal" button
3. Fill out form:
   - Title: "Purchase New Batik Equipment"
   - Description: "Allocate 10 SOL to purchase new batik printing equipment for the cooperative"
   - Type: Select "Fund Allocation"
4. Click "Create Proposal"
5. Approve transaction
6. **VERIFY:**
   - ✅ Success message with proposal address
   - ✅ Redirected to proposals list
   - ✅ New proposal appears with "Active" status
   - ✅ Vote tally shows 0 Yes, 0 No, 0 Abstain

### Step 5: Vote on Proposal (Member)
1. Click on the proposal you just created
2. Scroll to "Cast Your Vote" section
3. **VERIFY UI displays:**
   - ✅ Countdown timer shows time remaining (e.g., "6d 23h 59m remaining")
   - ✅ Quorum progress bar (0% initially)
   - ✅ Three vote buttons: Yes, No, Abstain
   - ✅ All buttons have icons and descriptions
4. Click "Vote Yes"
5. Approve transaction
6. **VERIFY:**
   - ✅ Success message appears with transaction link
   - ✅ Vote tallies update (1 Yes vote)
   - ✅ "You've Already Voted" message appears
   - ✅ Vote buttons are no longer shown
   - ✅ Your vote choice is displayed

### Step 6: Vote from Second Wallet (Reach Quorum)
1. **Switch back to Wallet #2** (the member)
2. Navigate to the same proposal
3. Click "Vote Yes"
4. Approve transaction
5. **VERIFY:**
   - ✅ Vote tally updates (2 Yes, 0 No)
   - ✅ Quorum percentage updates (100% - 2/2 members voted)
   - ✅ Proposal status changes to "Passed" (2 Yes > 0 No)
   - ✅ Status badge turns green

### Step 7: Execute Proposal (Admin Only)
**⚠️ IMPORTANT:** This requires voting period to end. For testing, you have 2 options:

**Option A: Wait for Voting Period to End** (7 days)
- Not practical for immediate testing

**Option B: Test Execute Button Logic**
1. Switch back to **Admin wallet** (Wallet #1)
2. Navigate to the passed proposal
3. **VERIFY UI shows:**
   - ✅ "Proposal Passed!" section visible
   - ✅ "Execute Proposal" button visible (admin only)
   - ✅ Purple-themed styling
4. Try clicking "Execute Proposal"
5. **EXPECTED:** Error message: "Cannot execute proposal before voting period ends"
6. This confirms:
   - ✅ Admin-only access works
   - ✅ Time validation works
   - ✅ UI is correct

**Testing Actual Execution:**
- To test execution, create a cooperative with `voting_period_days: 0` (would require smart contract change)
- OR wait 7 days for this proposal
- For MVP purposes, verifying the UI and error handling is sufficient

---

## 🧪 Test Flow 2: Edge Cases & Validations

### Test 2.1: Duplicate Vote Prevention
1. After voting on a proposal, refresh the page
2. Navigate back to the same proposal
3. **VERIFY:**
   - ✅ "You've Already Voted" message displays
   - ✅ Vote buttons are hidden
   - ✅ Your previous vote choice is shown

### Test 2.2: Non-Member Cannot Vote
1. Use a **third wallet** (Wallet #3) that has NOT joined the cooperative
2. Connect wallet to app
3. Navigate to an active proposal
4. **VERIFY:**
   - ✅ "Members Only" warning displays
   - ✅ No vote buttons are shown
   - ✅ Message: "Only active cooperative members can vote"

### Test 2.3: Non-Member Cannot Create Proposal
1. With Wallet #3 (non-member) still connected
2. Try to navigate to `/dashboard/[address]/proposals/create`
3. **VERIFY:**
   - ✅ "Members Only" warning displays
   - ✅ Form is not accessible
   - ✅ Redirected or blocked from creating

### Test 2.4: Proposal Form Validation
1. Navigate to Create Proposal page (as a member)
2. Try submitting with:
   - Empty title → Should show validation error
   - Title > 100 chars → Character counter prevents input
   - Empty description → Should show validation error
   - Description > 500 chars → Character counter prevents input
3. **VERIFY:**
   - ✅ Character counters work (e.g., "75/100")
   - ✅ Required field validation works
   - ✅ "Create Proposal" button is disabled when invalid

### Test 2.5: Voting After Period Ends
1. Find a proposal where voting period has ended
2. **VERIFY:**
   - ✅ "Voting Has Ended" message displays
   - ✅ No vote buttons shown
   - ✅ Final vote tallies are visible
   - ✅ Countdown timer shows "Voting ended"

### Test 2.6: Non-Admin Cannot Execute
1. Switch to **Member wallet** (Wallet #2, NOT admin)
2. Navigate to a passed proposal
3. **VERIFY:**
   - ✅ "Execute Proposal" button is NOT visible
   - ✅ Only admin (Wallet #1) sees the execute button

---

## 🧪 Test Flow 3: UI/UX Testing

### Test 3.1: Mobile Responsiveness
1. Open Chrome DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select "iPhone 14 Pro" or "Samsung Galaxy S20"
4. Navigate through all pages:
   - Home page
   - Dashboard
   - Proposals list
   - Proposal detail
   - Create proposal
5. **VERIFY:**
   - ✅ All elements are visible (no overflow)
   - ✅ Vote buttons are large enough for touch
   - ✅ Text is readable (not too small)
   - ✅ Navigation works on mobile
   - ✅ Forms are usable on small screens

### Test 3.2: Loading States
1. Disconnect from internet briefly
2. Navigate to proposals page
3. **VERIFY:**
   - ✅ Loading spinner appears
   - ✅ "Loading proposals..." text shows
4. Reconnect internet
5. **VERIFY:**
   - ✅ Data loads after reconnection
   - ✅ Loading state disappears

### Test 3.3: Countdown Timer Accuracy
1. Navigate to an active proposal
2. Watch the countdown timer for 60 seconds
3. **VERIFY:**
   - ✅ Timer updates every second
   - ✅ Countdown is accurate (decreases properly)
   - ✅ Format changes appropriately:
     - Days: "5d 12h 30m remaining"
     - Hours: "12h 30m 45s remaining"
     - Minutes: "30m 45s remaining"
     - Seconds: "45s remaining"

### Test 3.4: Solana Explorer Links
1. Complete any transaction (create coop, vote, etc.)
2. Click "View on Solana Explorer" link
3. **VERIFY:**
   - ✅ Link opens in new tab
   - ✅ Correct network (Devnet)
   - ✅ Transaction details are visible
   - ✅ Transaction status is "Success"

---

## 🐛 Common Issues & Troubleshooting

### Issue 1: "Insufficient Funds"
**Cause:** Not enough Devnet SOL
**Solution:** Visit https://faucet.solana.com and request airdrop

### Issue 2: "Account Not Found"
**Cause:** Wrong network (Mainnet instead of Devnet)
**Solution:** Switch wallet to Devnet:
- Phantom: Settings → Developer Settings → Testnet Mode → Enable
- Solflare: Top right network selector → Devnet

### Issue 3: Transactions Failing
**Cause:** Devnet congestion or outdated blockhash
**Solution:** Wait 30 seconds and retry

### Issue 4: "Already In Use" Error
**Cause:** Trying to create cooperative/proposal with same name
**Solution:** Use a unique name each time

### Issue 5: Execute Button Not Showing
**Cause:** Not connected with admin wallet
**Solution:** Ensure you're using the wallet that created the cooperative

---

## ✅ Final Verification Checklist

After completing all tests, verify:

### Smart Contract:
- [ ] Cooperative creation works
- [ ] Member addition works
- [ ] Proposal creation works
- [ ] Voting works (Yes/No/Abstain)
- [ ] Duplicate vote prevention works
- [ ] Quorum calculation is accurate
- [ ] Status updates automatically (Active → Passed/Failed)
- [ ] Execute proposal validates correctly

### Frontend:
- [ ] All pages load without errors
- [ ] Wallet connection works (Phantom + Solflare)
- [ ] Character counters work
- [ ] Loading states display
- [ ] Error messages are clear
- [ ] Success confirmations show
- [ ] Solana Explorer links work
- [ ] Countdown timer updates in real-time
- [ ] Vote tallies update immediately
- [ ] Status badges show correct colors
- [ ] Mobile responsive (tested on phone screen size)

### User Experience:
- [ ] Navigation is intuitive
- [ ] Forms are easy to use
- [ ] Button states are clear (disabled/loading)
- [ ] Error messages are helpful
- [ ] Success flows feel complete
- [ ] No broken links or 404s
- [ ] Icons and colors are appropriate

---

## 📝 Bug Report Template

If you find bugs during testing, document them as follows:

```markdown
### Bug: [Short Description]
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**

**Actual Behavior:**

**Screenshots:** (if applicable)

**Console Errors:** (F12 → Console tab)

**Wallet Used:** Phantom / Solflare
**Browser:** Chrome / Firefox / Safari
**Device:** Desktop / Mobile
```

---

## 🚀 Next Steps After Testing

Once all tests pass:
1. ✅ Document any bugs found (if any)
2. ✅ Fix critical/high bugs
3. ✅ Deploy to Vercel (see DEPLOYMENT_GUIDE.md)
4. ✅ Test deployed version on Vercel URL
5. ✅ Share with team/judges

---

**Testing Duration:** Estimated 30-45 minutes for complete flow

**Best Practice:** Test with fresh wallets each time to simulate real user experience

**Questions?** Refer to:
- Smart Contract: `programs/koperasichain/src/`
- Frontend Code: `app/app/dashboard/`
- PRD: `docs/PRD.md`

---

**Bismillah, happy testing! May Allah make this testing smooth and reveal any issues early. InshaAllah, everything works perfectly!** 🤲
