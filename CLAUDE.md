# CLAUDE.md

Claude Code guidance for this repository.

## Project Overview

**KoperasiChain** - Blockchain-powered digital cooperative platform for Indonesian MSMEs (Inclusive Economy sub-theme)
- **Goal**: Win 1st Place ($3,000 USDC) with exceptional, polished MVP
- **Strategy**: Single-project focus with 10-14 senior developers
- **Deadline**: October 31, 2025 (23 days from Oct 8)
- **Theme**: Cypherpunk principles (privacy, freedom, decentralization)
- **Requirements**: Functional MVP, 3-min demo video, public GitHub, pitch deck, Colosseum submission

### Repository Structure

```
garuda-spark-blockchain/
├── projects/koperasichain/        # Main project (HIGHEST PRIORITY)
├── shared/                        # design-system, solana-utils, deployment-scripts
├── docs/                          # PRD.md, EXECUTION_PLAN.md, bounty-analysis.md
├── archive/                       # sumberbenar, ecochain (not pursued)
└── CLAUDE.md
```

### Smart Contract Deployment

**Program ID**: `RECs4kXKatsFrGWckRqBujXL2Qs9FLDeFcF9PYCZ3Za` (Solana Devnet)
- **Epic 1**: ✅ Cooperative creation & member management
- **Epic 2**: ✅ Democratic governance (proposals, voting, quorum, execution)
- **Vanity Address**: "REC" prefix (generated via `solana-keygen grind --starts-with REC:1`)
- **Test Status**: 5/12 passing (6 failing = devnet issues, not code bugs)
- **Explorer**: https://explorer.solana.com/address/RECs4kXKatsFrGWckRqBujXL2Qs9FLDeFcF9PYCZ3Za?cluster=devnet

**Keypair**: `target/deploy/koperasichain-keypair.json`
**Docs**: `TESTING_GUIDE.md`, `DEPLOYMENT_GUIDE.md`, `EPIC2_COMPLETION_SUMMARY.md`

## Development Workflow

### Quick Commands

```bash
cd projects/koperasichain

# Smart Contracts
anchor build                       # Build
anchor test                        # Run tests
anchor deploy --provider.cluster devnet  # Deploy

# Frontend
npm run dev                        # Dev server
npm run build                      # Production build

# Shared Infrastructure
cd shared/design-system && npm run build
cd shared/solana-utils && npm run build
```

### Installation (if starting fresh)

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor Framework
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest && avm use latest

# Next.js + Dependencies
npx create-next-app@latest app --typescript --tailwind --app
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/wallet-adapter-base @supabase/supabase-js zustand
```

## Tech Stack

**Blockchain**: Solana (Devnet/Mainnet-ready) | Anchor (Rust) | SPL Tokens
**Frontend**: Next.js 14 + TypeScript | TailwindCSS v3 | Solana Wallet Adapter | Zustand
**Backend**: Supabase/Firebase | Next.js API Routes
**Hosting**: Vercel (frontend) | Solana Devnet (contracts) | GitHub Actions CI/CD
**Mobile**: PWA (primary) | React Native (if native features needed)

## Architecture

### Smart Contract (Modularized)

```
programs/koperasichain/src/
├── lib.rs                      # Program entry point
├── errors.rs                   # 10 custom error codes
├── instructions/               # Modularized handlers
│   ├── create_cooperative.rs   # Epic 1
│   ├── add_member.rs           # Epic 1
│   ├── create_proposal.rs      # Epic 2
│   ├── cast_vote.rs            # Epic 2
│   └── execute_proposal.rs     # Epic 2
└── state/
    ├── cooperative.rs
    ├── member.rs
    ├── proposal.rs
    └── vote.rs
```

**Ready for**: `deposit_funds.rs`, `withdraw_funds.rs`, `distribute_dividends.rs`

### Frontend (Next.js App Router)

```
app/
├── layout.tsx, page.tsx
├── components/
│   ├── wallet/                 # Wallet connection
│   ├── ui/                     # Reusable components
│   └── features/               # cooperative, voting, treasury
├── lib/
│   ├── solana/                 # Program interactions
│   ├── supabase/               # Database client
│   └── utils/
└── api/                        # API routes
```

**Data Flow**: User → Wallet Adapter → Smart Contract → On-chain TX → Supabase (off-chain) → UI Update

## Development Principles

### Indonesian Context First
- Mobile-first (80%+ mobile users)
- Optimize for 3G/4G speeds
- Bahasa Indonesia support
- Cultural design (batik, local colors)
- Interview real MSMEs/cooperatives

### MVP Excellence (23 Days)
- Build BEST solution, not fastest
- Core features with maximum impact first
- Polish from day one
- Ship only fully working features
- **Scope**: Days 1-7 (define) → 8-14 (build core) → 15-21 (enhance + demo) → 22-23 (submit)

### Blockchain Integration
- Justify WHY blockchain (not buzzwords)
- Provide Solana Explorer links
- Abstract complexity from users
- Make benefits tangible

### Code Quality
- TypeScript strict mode
- Graceful error handling
- Loading states for all blockchain TXs
- Test on real devices
- No secrets in code (use env vars)

## Judging Criteria

1. **Impact (35%)**: Indonesian stats, quantified metrics (64M MSMEs, 150K coops), user testimonials, Digital Indonesia 2045 alignment
2. **Tech Feasibility (25%)**: Working MVP (non-negotiable), early deployment, clean GitHub, fast loading (<3s)
3. **Innovation (20%)**: Gotong-royong → blockchain, superior UX, gamification, cultural localization
4. **Business (20%)**: Clear monetization (0.1% fees, SaaS, partnerships), go-to-market plan, Ministry partnerships

## Timeline (23 Days)

**Week 1 (Oct 8-14)**: User validation → MVP scope → Dev environment
**Week 2 (Oct 15-21)**: Smart contract deployment → Frontend integration → End-to-end flow
**Week 3 (Oct 22-28)**: UI/UX polish → Demo video → Pitch deck → Documentation
**Final (Oct 29-31)**: Submit Oct 29 (48h buffer) → Final testing → Deadline Oct 31

## Submission Checklist

- [ ] Working MVP deployed (test incognito)
- [ ] Demo video (<3 min)
- [ ] GitHub public + comprehensive README
- [ ] Pitch deck (impact, tech, business)
- [ ] Colosseum Cyberpunk submission
- [ ] Superteam Earn submission
- [ ] Mobile + desktop tested
- [ ] No exposed secrets
- [ ] Solana Explorer links

## Pitfalls to Avoid

**Technical**: ❌ Unjustified blockchain | Broken demo | Slow loading | Wallet failures | Exposed secrets
**Strategic**: ❌ Generic problem (must be Indonesia-specific) | Overly ambitious scope | Ignored ministry alignment | Late submission
**Presentation**: ❌ Tech-heavy pitch | Messy GitHub | Poor demo quality | Missing Colosseum submission

## Winning Differentiators

**Execution**: Polished MVP (most teams ship incomplete) | Superior UX | Mobile-first | Fast deployment
**Impact**: Compelling narrative | Real testimonials | Quantified metrics | Before/after story
**Context**: Deep cultural understanding | Gotong-royong innovation | Local partnerships | Indonesia-specific validation

## Resources

**Docs**: `docs/PRD.md` (Epic→Story→Task) | `docs/EXECUTION_PLAN.md` | `docs/bounty-analysis.md` (READ THIS)
**External**: [Solana](https://docs.solana.com) | [Anchor](https://www.anchor-lang.com) | [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
**Contact**: [Telegram - Steven4293](https://t.me/Steven4293)

## Development Philosophy

**Ihsan in Code**: Strive for perfection. This MVP is an amanah to serve Indonesian society.
**Avoid Israf**: Efficient, purposeful code. No bloat or vanity features.
**Tawakkul**: Plan meticulously, execute fully, trust Allah for results.
**Sabr**: Focused discipline, not panic. 23 days is enough for excellence.

**Winning Mindset**:
- Aim for 1st Place ($3K USDC)
- Quality over quantity
- Smart prioritization
- Build for real users

---

**InshaAllah**, 23 days of focused excellence will build a solution judges cannot ignore. Champions thrive under pressure. Give it everything - Allahu Ma'ak.
