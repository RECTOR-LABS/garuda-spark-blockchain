# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Garuda Spark Blockchain for Good** - Focused hackathon project building **KoperasiChain**, a blockchain-powered digital cooperative platform for Indonesian MSMEs, aligned with cypherpunk principles (privacy, freedom, decentralization).

**Single-Project Strategy**: With 10+ senior developers, we are focusing all resources on ONE exceptional solution to maximize quality and win probability for 1st place.

### Repository Structure

```
garuda-spark-blockchain/                # Main repository
├── projects/
│   └── koperasichain/                  # Main project: Inclusive Economy (HIGHEST PRIORITY)
├── shared/
│   ├── design-system/                  # Shared UI components
│   ├── solana-utils/                   # Common Solana helpers
│   └── deployment-scripts/             # CI/CD automation
├── docs/
│   ├── TEAM_ALLOCATION.md              # Team structure & responsibilities
│   └── team-workflows/
├── archive/                            # Previous multi-project exploration (not pursued)
│   ├── sumberbenar/                    # Anti-Hoax project (archived)
│   └── ecochain/                       # Green Tech project (archived)
├── bounty-original.md                  # Official hackathon requirements
├── bounty-analysis.md                  # Strategic analysis & recommendations
└── CLAUDE.md                           # This file
```

### The Project: KoperasiChain

**Sub-theme**: Inclusive Economy
**Target Prize**: 🥇 1st Place ($3,000 USDC)
**Team Size**: 10-14 senior developers (unified team)
**Complexity**: Medium (achievable in 23 days with senior developers)

**Goal**: Win 1st place by delivering an exceptional, polished MVP that demonstrates real impact for Indonesian MSMEs and cooperatives.

**Hackathon Details**:
- Prize Pool: $5,000 USDC (1st: $3,000 | 2nd: $1,500 | 3rd: $500)
- Deadline: October 31, 2025 (23 days from Oct 8, 2025)
- Region: Indonesia Only
- Partners: Ministry of Communication & Digital Affairs, Ministry of Creative Economy
- Platform: Cypherpunk Colosseum

**Cypherpunk Theme**: Solutions must embody cypherpunk principles:
- **Privacy**: Protecting user data through encryption and zero-knowledge proofs
- **Freedom**: Decentralized systems that resist censorship and control
- **Decentralization**: Distributed trust without central authorities
- Examples: Anonymous voting, self-sovereign identity, transparent governance

**Mandatory Requirements**:
- Functional MVP (Minimum Viable Product)
- 3-minute demo video
- Public GitHub repository
- Pitch deck presentation
- Colosseum Cyberpunk submission

## Working with KoperasiChain

### Development Workflow

**When working on the project:**
```bash
# Navigate to project directory
cd projects/koperasichain

# Build smart contracts
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run frontend
npm run dev
```

**When working on shared infrastructure:**
```bash
# Navigate to shared directory
cd shared/design-system
npm run build                   # Build shared components

cd shared/solana-utils
npm run build                   # Build shared utilities
```

**Project-Specific Commands:**
- See `projects/koperasichain/README.md` for detailed commands and workflows

### Team Coordination

**Team Structure**: See `docs/TEAM_ALLOCATION.md` for detailed team assignments

**Communication**:
- Daily async standups (team-wide)
- Monday week planning (all roles)
- Wednesday mid-week demos (progress showcase)
- Friday retrospectives (learning & adjustments)

**Quality Gates**:
- Week 1 (Oct 14): MVP scope defined, dev environment ready
- Week 2 (Oct 21): Smart contract deployed, wallet connected, one complete user flow
- Week 3 (Oct 28): All features complete, demo ready, submission materials finalized
- Submission (Oct 29): All materials ready, 48 hours before deadline

### Shared Resources

KoperasiChain uses shared infrastructure:
1. **Design System** (`shared/design-system/`): UI components, TailwindCSS theme
2. **Solana Utils** (`shared/solana-utils/`): Wallet connection, transaction helpers
3. **Deployment** (`shared/deployment-scripts/`): CI/CD automation

**Usage Example**:
```typescript
// In KoperasiChain project
import { Button, WalletButton } from '@garuda/design-system';
import { sendAndConfirmWithRetry } from '@garuda/solana-utils';
```

### Git Strategy

**Repository**: Single monorepo with KoperasiChain as primary project
**Archive**: Previous multi-project exploration preserved in `archive/` directory

```bash
# Main development happens in projects/koperasichain
cd projects/koperasichain

# Archived projects (not actively developed)
ls archive/  # sumberbenar, ecochain
```

## Project Focus: KoperasiChain

**Why KoperasiChain?**
- **Best 1st Place Potential**: Massive market (64M MSMEs, 150K+ cooperatives), clear blockchain value proposition
- **Ministry Alignment**: Direct alignment with Ministry of Creative Economy (MSME empowerment)
- **Cultural Resonance**: Traditional gotong-royong → blockchain innovation
- **Proven Demand**: 40% cooperative failure rate due to mismanagement = clear pain point
- **Measurable Impact**: Transaction cost reduction, governance transparency, automated dividends

**Why Focus vs Multi-Project?**
- **Quality Over Quantity**: One exceptional solution beats three mediocre ones
- **Resource Efficiency**: 10-14 devs focused = faster iteration, better polish
- **Reduced Complexity**: Single codebase, unified team, clearer communication
- **Higher Win Probability**: 1st place requires excellence, not diversification
- **Better Execution**: Time for proper user research, testing, demo production

## Tech Stack (Recommended)

### Blockchain Layer
- **Primary Chain**: Solana (Devnet for development, Mainnet-ready)
  - Ultra-low transaction costs (<$0.001)
  - High throughput (2000+ TPS)
  - Fast finality (400ms)
- **Smart Contracts**: Anchor Framework (Rust)
- **Token Standard**: SPL (Solana Program Library)

### Frontend Stack
- **Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS v3
- **Wallet Integration**: Solana Wallet Adapter
- **State Management**: Zustand or React Context

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL) or Firebase
- **API Layer**: Next.js API Routes
- **Hosting**: Vercel (frontend), Solana Devnet (contracts)
- **CI/CD**: GitHub Actions + Vercel auto-deploy

### Mobile Strategy
- **Primary**: Progressive Web App (PWA) - single codebase, no app store delays
- **Alternative**: React Native (if native features required)

## Development Commands

### Blockchain Development

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor Framework
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Initialize Solana project (if starting fresh)
anchor init koperasichain

# Build smart contracts
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Get devnet SOL for testing
solana airdrop 2 <wallet-address> --url devnet

# Check Solana config
solana config get
```

### Frontend Development

```bash
# Create Next.js project (if starting fresh)
npx create-next-app@latest app --typescript --tailwind --app

# Install Solana dependencies
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/wallet-adapter-base

# Install additional dependencies
npm install @supabase/supabase-js zustand

# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Testing & Quality

```bash
# Smart contract tests (Anchor)
anchor test

# Frontend tests (if configured)
npm run test

# E2E tests (if configured)
npm run test:e2e
```

## Architecture Patterns

### Smart Contract Structure (Anchor)
```
programs/
├── koperasichain/
│   ├── src/
│   │   ├── lib.rs                      # Main program logic
│   │   ├── instructions/               # Instruction handlers
│   │   │   ├── create_cooperative.rs
│   │   │   ├── add_member.rs
│   │   │   ├── create_proposal.rs
│   │   │   ├── vote.rs
│   │   │   └── distribute_dividends.rs
│   │   ├── state/                      # Account structures
│   │   │   ├── cooperative.rs
│   │   │   ├── member.rs
│   │   │   └── proposal.rs
│   │   └── errors.rs                   # Custom errors
│   └── Cargo.toml
```

### Frontend Structure (Next.js App Router)
```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── components/
│   ├── wallet/             # Wallet connection components
│   ├── ui/                 # Reusable UI components
│   └── features/           # Feature-specific components
│       ├── cooperative/
│       ├── voting/
│       └── treasury/
├── lib/
│   ├── solana/             # Solana client & program interactions
│   ├── supabase/           # Database client
│   └── utils/              # Helper functions
└── api/                    # API routes
```

### Data Flow Pattern
```
User Action → Wallet Adapter → Smart Contract → On-chain Transaction
                                              ↓
                                         Supabase (off-chain data)
                                              ↓
                                         UI Update (optimistic + confirmed)
```

## Key Development Principles

### Indonesian Context First
- **Mobile-First Design**: 80%+ Indonesian users are mobile
- **Performance**: Optimize for 3G/4G speeds (slow internet)
- **Language**: Support Bahasa Indonesia naturally
- **Cultural Design**: Consider Indonesian visual preferences (batik patterns, local color schemes)
- **Local Validation**: Interview real Indonesian MSMEs and cooperative members

### MVP Excellence Strategy (23 Days - Build the BEST!)
- **Goal**: Create the BEST possible solution that demonstrates real impact and technical excellence
- **Strategic Prioritization**:
  - START with core features that deliver maximum impact
  - BUILD with quality and polish from day one
  - EXPAND features as time allows while maintaining excellence
  - ENSURE every feature works flawlessly before adding more
- **Excellence Over Quantity**:
  - Ship features that work perfectly and demonstrate clear value
  - Well-executed features beat half-finished complexity
  - Every user interaction should feel polished and intentional
- **Smart Scope Management**:
  - Day 1-7: Define ambitious but achievable scope based on team capacity
  - Day 8-14: Build core features with excellence and test thoroughly
  - Day 15-21: Add enhanced features, polish UX, create compelling demo
  - Day 22-23: Final refinements and submission
- **Ambition with Wisdom**: Push for the best outcome while staying realistic about what excellence requires

### Blockchain Integration Philosophy
- **Justify WHY Blockchain**: Don't use blockchain just for buzzwords
- **Show On-Chain Activity**: Provide Solana Explorer links for transparency
- **Abstract Complexity**: Users shouldn't need to understand blockchain
- **Visible Value**: Make blockchain benefits tangible (transparency, immutability, low cost)

### Code Quality Standards
- **TypeScript Strict Mode**: Enabled for type safety
- **Error Handling**: Graceful failures with user-friendly messages
- **Loading States**: Always show feedback during blockchain transactions
- **Mobile Responsive**: Test on actual devices, not just browser DevTools
- **No Secrets in Code**: Use environment variables, never commit API keys

## Judging Criteria Alignment

### Impact Potential (35% - Highest Weight)
- Cite Indonesian statistics (BPS data, ministry reports)
- Quantify impact metrics (64M MSMEs, 150K cooperatives, 30M members)
- Include real user testimonials or interviews
- Connect to Digital Indonesia 2045 vision
- Lead with human impact stories, not technology

### Tech Feasibility (25%)
- **Working MVP is non-negotiable** - test extensively
- Deploy early and often (Week 2 target)
- Clean GitHub repository with comprehensive README
- Active commit history showing development progression
- Fast loading (<3 seconds), no broken buttons/links

### Innovation (20%)
- Novel blockchain application (traditional gotong-royong → blockchain)
- Superior UX (abstract crypto complexity)
- Gamification elements (leaderboards, achievements, reputation)
- Cultural localization (Indonesian design patterns)

### Business Feasibility (20%)
- Clear monetization strategy (0.1% transaction fees, SaaS, partnerships)
- Realistic go-to-market plan with specific channels
- Partnership roadmap (Ministry of Creative Economy, Kominfo, BUMDes)
- Post-hackathon sustainability plan

## Development Timeline (23 Days Total - AGGRESSIVE)

### Week 1: Foundation & Validation (Oct 8-14) - Days 1-7
- **Days 1-2**: User validation (5-10 MSME/cooperative interviews), problem confirmation
- **Days 3-4**: MVP scope definition, wireframes, smart contract architecture
- **Days 5-7**: Project setup, smart contract scaffold, frontend init, wallet integration
- **Deliverable**: Clear MVP scope + working dev environment

### Week 2: Core Development Sprint (Oct 15-21) - Days 8-14
- **Days 8-10**: Smart contract implementation + deployment to devnet
- **Days 11-13**: Frontend core features + blockchain integration
- **Day 14**: End-to-end user flow working (create cooperative → add member → vote → distribute)
- **Deliverable**: Functional MVP with one complete user journey

### Week 3: Polish, Documentation & Submission (Oct 22-28) - Days 15-21
- **Days 15-17**: UI/UX polish, mobile optimization, performance tuning, bug fixes
- **Days 18-19**: Demo video production (3 min) + pitch deck (8-10 slides)
- **Days 20-21**: GitHub documentation, README polish, code cleanup
- **Deliverable**: Complete submission package ready

### Final Buffer (Oct 29-31) - Days 22-23
- **Day 22 (Oct 29)**: Submit to both platforms (Colosseum + Superteam)
- **Day 23 (Oct 30)**: Final testing, backup materials
- **Day 24 (Oct 31)**: DEADLINE - last chance for fixes

**MISSION**: Build the BEST possible solution in 23 days. Focus on impact, execution excellence, and demonstrating genuine blockchain value for Indonesian cooperatives and MSMEs. Aim high, execute smart, deliver quality.

## Submission Checklist

**Before Final Submission**:
- [ ] Working MVP deployed and accessible (test in incognito mode)
- [ ] Demo video uploaded (<3 minutes, shows core features)
- [ ] GitHub repo public with comprehensive README
- [ ] Pitch deck finalized (covers impact, tech, business model)
- [ ] Colosseum Cyberpunk submission completed
- [ ] Superteam Earn submission completed
- [ ] All links tested on mobile and desktop
- [ ] No API keys or secrets exposed in code
- [ ] Solana Explorer links provided for on-chain transactions

## Common Pitfalls to Avoid

**Technical**:
- ❌ Blockchain for blockchain's sake (always justify WHY)
- ❌ Broken demo or inaccessible deployment
- ❌ Slow loading times (optimize for Indonesian internet speeds)
- ❌ Wallet connection failures (test with Phantom, Solflare, Backpack)
- ❌ Exposing private keys or secrets in GitHub

**Strategic**:
- ❌ Generic global problem (must be Indonesia-specific)
- ❌ Overly ambitious scope (focus on ONE complete user journey)
- ❌ Ignoring government alignment (ministry priorities matter)
- ❌ No clear path to sustainability
- ❌ Last-minute submission (submit 48 hours early)

**Presentation**:
- ❌ Tech-heavy pitch without impact focus
- ❌ Messy GitHub repository
- ❌ Poor demo video quality
- ❌ Missing Colosseum Cyberpunk submission

## Winning Differentiators

**Execution Excellence**:
- Most teams submit incomplete demos - ship a polished MVP
- Superior UX (most blockchain apps have poor UX)
- Mobile-first design (competitors often neglect mobile)
- Fast, reliable deployment

**Impact Storytelling**:
- Compelling video narrative with emotional connection
- Real user testimonials or pilot feedback
- Quantified metrics (not vague claims)
- Before/after transformation story

**Indonesian Context Mastery**:
- Deep cultural understanding (natural Bahasa Indonesia usage)
- Traditional gotong-royong → blockchain innovation
- Local partnerships or pilot commitments
- Indonesia-specific validation data
- Design that resonates with Indonesian users

## Resources & Documentation

**Project Documentation**:
- `bounty-original.md` - Complete hackathon requirements
- `bounty-analysis.md` - Comprehensive strategic analysis (READ THIS)
- `projects/koperasichain/README.md` - Project-specific details
- `resources/GETTING_STARTED.md` - Quick start guide

**Recommended Reading**:
- Solana Documentation: https://docs.solana.com
- Anchor Framework: https://www.anchor-lang.com
- Solana Wallet Adapter: https://github.com/solana-labs/wallet-adapter
- Cypherpunk Colosseum: https://earn.superteam.fun/hackathon/cypherpunk

**Contact & Support**:
- Hackathon Organizer: [Telegram - Steven4293](https://t.me/Steven4293)
- Technical Questions: Solana Discord, Anchor GitHub

## Development Philosophy & Mindset

### Islamic Ethos of Excellence

**Ihsan in Code**: Strive for perfection in every implementation. Allah loves when we do our work with excellence. This MVP is an amanah (trust) to serve Indonesian society - build it as if the judges are watching every line of code, because they represent the people you're serving.

**Avoid Israf (Waste)**: Write efficient, purposeful code. Every feature should serve a clear purpose. Respect users' limited resources and internet bandwidth. No bloat, no vanity features.

**Tawakkul**: Plan meticulously, execute with full effort, then trust in Allah for the results. Do YOUR absolute best, then leave the outcome to Him.

**Sabr (Patience) with Urgency**: Work with focused discipline, not panic. 23 days is enough to build something exceptional when every day counts.

### Winning Mindset

- **Aim for 1st Place**: Don't settle for "good enough" - build something that deserves $3,000 USDC
- **Think Like Champions**: Study what wins hackathons (execution + impact + storytelling)
- **Focus Over Fragmentation**: Better to build ONE exceptional solution than spread thin
- **No Excuses**: Limited time means smart prioritization, not limited ambition
- **Compete with Excellence**: Your competition is other talented Indonesian developers - bring your A-game
- **Build for Real Users**: This isn't just a hackathon - it's a solution for real Indonesian MSMEs and cooperatives

---

**InshaAllah**, with 23 days of focused excellence and unwavering commitment to impact, we will build a solution that judges cannot ignore. The deadline is tight, but champions thrive under pressure. Give it everything you have - Allahu Ma'ak (Allah is with you).
