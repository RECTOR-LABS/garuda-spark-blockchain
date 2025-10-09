# EcoChain Indonesia - Gamified Recycling & Carbon Tracking

**Sub-theme**: Green Tech & Sustainability
**Target Users**: Indonesian citizens, waste banks (Bank Sampah), corporate CSR
**Core Value**: Tokenized incentives for verified recycling behavior

## Problem Statement

Indonesia's waste & sustainability challenges:
- Low recycling participation (<10% household waste recycled)
- No incentive mechanisms for green behavior
- Opaque carbon tracking for corporates
- Waste banks (Bank Sampah) lack digital infrastructure
- Citizens unaware of environmental impact

## Solution Overview

Blockchain-powered recycling platform with gamification:
- QR code waste drop-off tracking at Bank Sampah
- Instant SPL token rewards (Solana 400ms finality)
- Leaderboards, challenges, achievements
- Carbon impact dashboard (kg recycled → CO2 saved)
- Token redemption marketplace (discounts, transit credits)

## Tech Stack

- **Blockchain**: Solana (Devnet → Mainnet-ready)
- **Smart Contracts**: Anchor Framework (Rust)
- **Tokens**: SPL Token (EcoToken)
- **Frontend**: Next.js 14 PWA (mobile-first)
- **QR Code**: react-qr-code, @solana/qr-code-styling
- **Database**: Supabase (user profiles, waste bank locations)
- **Maps**: Mapbox/Google Maps (waste bank finder)

## Core Features (MVP - 23 Days)

### Phase 1: Foundation (Days 1-7)
- [ ] SPL token creation (EcoToken)
- [ ] Recycling event tracking smart contract
- [ ] Waste bank registration system

### Phase 2: Core Features (Days 8-14)
- [ ] QR code generation for users
- [ ] Waste bank staff scanner app
- [ ] Instant token reward distribution
- [ ] Leaderboard (Jakarta, Surabaya, Bandung)

### Phase 3: Polish (Days 15-21)
- [ ] Carbon impact dashboard
- [ ] Monthly challenges (10kg = 2x tokens)
- [ ] Token redemption marketplace
- [ ] Waste bank map (find nearby locations)
- [ ] Demo video production

### Phase 4: Submission (Days 22-23)
- [ ] Documentation
- [ ] Pitch deck
- [ ] Final testing & deployment

## Team Allocation

**Blockchain Lead** (1 dev): Smart contract, SPL token mechanics
**Frontend Lead** (1-2 devs): Next.js PWA, QR scanning, gamification
**Full-stack** (1 dev): API, maps integration, Supabase
**Designer** (0.5 dev): Gamification UX, visual appeal

**Total**: 3-4 developers

## Success Metrics

- **Impact**: 100+ users test recycling, 5-10 waste bank partners (demo)
- **Technical**: <2s QR scan → token reward, mobile-optimized
- **Business**: 2-3 corporate sponsors committed (LOIs)
- **Demo**: Show complete recycling journey in 3-min video

## Key Differentiators

1. **Instant Gratification**: Token reward in <1 second (behavior change psychology)
2. **Gamification**: Leaderboards, streaks, achievements (not just utility)
3. **Waste Bank Integration**: Leverage existing 7000+ Bank Sampah in Indonesia
4. **Corporate CSR**: B2B2C model (corporates sponsor tokens)
5. **Solana Narrative**: "Energy-efficient blockchain for green tech"

## Repository Structure

```
ecochain/
├── programs/
│   └── ecochain/
│       ├── src/
│       │   ├── lib.rs
│       │   ├── instructions/
│       │   │   ├── initialize_token.rs
│       │   │   ├── record_recycling.rs
│       │   │   ├── distribute_rewards.rs
│       │   │   └── redeem_tokens.rs
│       │   ├── state/
│       │   │   ├── user_profile.rs
│       │   │   ├── recycling_event.rs
│       │   │   └── waste_bank.rs
│       │   └── errors.rs
│       └── Cargo.toml
├── app/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── scan/                      # QR scanner
│   │   ├── leaderboard/
│   │   ├── rewards/                   # Redemption marketplace
│   │   ├── impact/                    # Carbon dashboard
│   │   └── api/
│   ├── components/
│   │   ├── qr/
│   │   ├── gamification/
│   │   └── ui/
│   └── lib/
├── tests/
└── README.md
```

## User Flow Example

1. **User**: Downloads EcoChain PWA, creates wallet
2. **User**: Brings 5kg plastic bottles to local Bank Sampah
3. **Staff**: Weighs waste, scans user's QR code from app
4. **Smart Contract**: Calculates reward (5kg × 1000 tokens/kg)
5. **Solana**: Distributes 5000 EcoTokens in <1 second
6. **User**: Sees token balance update, rank on leaderboard
7. **User**: Redeems 3000 tokens for TransJakarta credit
8. **Gamification**: "10kg Challenge this month - 2x multiplier!"

## Tokenomics

- **Reward Rate**: 1000 EcoTokens per kg recycled (adjustable)
- **Token Value**: 1000 tokens ≈ Rp 5,000 (initial peg)
- **Supply**: Inflationary (corporate sponsors mint new tokens for CSR)
- **Redemption**: Partner merchants, transit, donations

## Development Commands

```bash
# Blockchain
anchor build
anchor test
anchor deploy --provider.cluster devnet

# Create SPL Token
spl-token create-token
spl-token create-account <TOKEN_ADDRESS>

# Frontend
npm run dev
npm run build
```

## Links

- **Live Demo**: TBD
- **Solana Explorer**: TBD
- **Demo Video**: TBD
- **Waste Bank Partners**: TBD

---

**Alhamdulillah**, we make sustainability rewarding for Indonesian citizens.
