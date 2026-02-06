# KoperasiChain - Digital Cooperative Platform

**Sub-theme**: Inclusive Economy
**Target Users**: 64M Indonesian MSMEs & Digital Cooperatives
**Core Value**: Transparent, blockchain-powered cooperative governance

## Problem Statement

Indonesian MSMEs and cooperatives face:
- High transaction costs (3-5% traditional banking)
- Opaque fund management and voting processes
- Limited access to fair financial services
- Manual, paper-based cooperative operations
- Trust issues in traditional cooperatives

## Solution Overview

Blockchain-powered digital cooperative platform enabling:
- Transparent voting with real-time results (400ms Solana finality)
- Automated dividend distribution via smart contracts
- Near-zero transaction costs (<$0.001 per transaction)
- Mobile-first PWA for Indonesian MSME owners
- On-chain governance with immutable audit trails

## Tech Stack

- **Blockchain**: Solana (Devnet → Mainnet-ready)
- **Smart Contracts**: Anchor Framework (Rust)
- **Frontend**: Next.js 15.5.4 + TypeScript + TailwindCSS
- **Wallet**: Solana Wallet Adapter
- **Database**: Supabase (PostgreSQL) or PostgreSQL (Docker)
- **Deployment**: Kamal (Docker + VPS), Solana Devnet (contracts)

## Core Features (MVP - 23 Days)

### Phase 1: Foundation (Days 1-7) ✅ COMPLETE
- [x] Cooperative registration smart contract
- [x] Member wallet integration
- [x] Basic UI scaffold (mobile-first)

### Phase 2: Core Features (Days 8-14) ✅ COMPLETE (Oct 25, 2025)
- [ ] Deposit/contribution tracking (Epic 3 - Treasury)
- [x] Voting mechanism (proposals + real-time tallying)
- [x] Democratic governance with quorum detection
- [x] Proposal execution (admin-only)
- [ ] Treasury management smart contract (Epic 3)
- [x] Mobile PWA setup

### Phase 3: Polish (Days 15-21)
- [ ] Auto-dividend distribution (Epic 3)
- [ ] Transaction history dashboard
- [ ] Member leaderboard/reputation
- [ ] Demo video production

### Phase 4: Submission (Days 22-23)
- [ ] Documentation
- [ ] Pitch deck
- [ ] Final testing & deployment

## Team Allocation

**Blockchain Lead** (1 dev): Smart contract architecture, Anchor programs
**Frontend Lead** (1-2 devs): Next.js app, wallet integration, PWA
**Full-stack** (1 dev): API routes, Supabase integration, data sync
**QA/DevOps** (0.5 dev): Testing, deployment, CI/CD

**Total**: 3-4 developers

## Success Metrics

- **Impact**: Enable 100+ MSMEs to test platform (pilot)
- **Technical**: <3s load time, 99% uptime, working on 3G
- **Business**: Clear path to 1000 cooperatives in 6 months
- **Demo**: 3-min video showing complete user journey

## Key Differentiators

1. **Traditional Gotong-Royong → Blockchain** (cultural resonance)
2. **Mobile-first for Indonesian context** (80% mobile users)
3. **Solana speed = instant voting results** (400ms vs 15s Ethereum)
4. **Ministry of Creative Economy alignment** (MSME empowerment)

## Repository Structure

```
koperasichain/
├── programs/
│   └── koperasichain/
│       ├── src/
│       │   ├── lib.rs                 # Main program (5 instructions)
│       │   ├── instructions/
│       │   │   ├── create_cooperative.rs     # ✅ Epic 1
│       │   │   ├── add_member.rs             # ✅ Epic 1
│       │   │   ├── create_proposal.rs        # ✅ Epic 2
│       │   │   ├── cast_vote.rs              # ✅ Epic 2
│       │   │   └── execute_proposal.rs       # ✅ Epic 2
│       │   ├── state/
│       │   │   ├── cooperative.rs            # Cooperative account
│       │   │   ├── member.rs                 # Member account
│       │   │   ├── proposal.rs               # Proposal + ProposalType/Status
│       │   │   └── vote.rs                   # Vote + VoteChoice
│       │   └── errors.rs                     # 10 custom errors
│       └── Cargo.toml
├── app/                                      # Next.js 15.5.4 frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                         # ✅ Cooperative creation
│   │   ├── join/page.tsx                    # ✅ Member invitation
│   │   └── dashboard/
│   │       └── [address]/
│   │           ├── page.tsx                  # ✅ Dashboard
│   │           └── proposals/
│   │               ├── page.tsx              # ✅ Epic 2: Proposal list
│   │               ├── create/page.tsx       # ✅ Epic 2: Create proposal
│   │               └── [proposalId]/page.tsx # ✅ Epic 2: Vote & execute
│   ├── lib/
│   │   ├── anchor.ts                        # ✅ Program integration
│   │   └── idl.json                         # ✅ Updated IDL
│   └── package.json
├── tests/
│   └── koperasichain.ts                     # ✅ 12 tests (5 passing)
├── TESTING_GUIDE.md                         # ✅ Epic 2 testing flows
├── DEPLOYMENT_GUIDE.md                      # ✅ Kamal deployment
├── EPIC2_COMPLETION_SUMMARY.md              # ✅ Complete overview
└── README.md
```

## Development Commands

```bash
# Blockchain
anchor build
anchor test
anchor deploy --provider.cluster devnet

# Frontend
npm run dev
npm run build
npm run lint

# Full stack
npm run dev:all    # Run frontend + watch smart contracts
```

## Links

- **Live Demo**: http://localhost:3001 (dev) | https://koperasichain.rectorspace.com (production via Kamal)
- **Solana Explorer**: https://explorer.solana.com/address/RECs4kXKatsFrGWckRqBujXL2Qs9FLDeFcF9PYCZ3Za?cluster=devnet
- **Program ID**: `RECs4kXKatsFrGWckRqBujXL2Qs9FLDeFcF9PYCZ3Za` (Devnet)
- **Documentation**: See TESTING_GUIDE.md, DEPLOYMENT_GUIDE.md, EPIC2_COMPLETION_SUMMARY.md
- **GitHub**: TBD (this repo when public)
- **Demo Video**: TBD (YouTube link)

## Contact

**Team Lead**: [Name]
**Hackathon**: Garuda Spark Blockchain for Good
**Target Prize**: 1st Place ($3,000 USDC)

---

**InshaAllah**, we build the best inclusive economy solution for Indonesian MSMEs.
