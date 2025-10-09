# SumberBenar - Blockchain-Powered Truth Verification

**Sub-theme**: Anti-Hoax & Trusted Info
**Target Users**: 170M+ Indonesian social media users
**Core Value**: Real-time content verification against blockchain registry

## Problem Statement

Indonesia faces severe disinformation crisis:
- Viral WhatsApp/Facebook hoaxes reach millions in minutes
- Limited digital literacy in identifying fake news
- Slow fact-checking (hours/days after viral spread)
- Trust erosion in media and institutions
- Political & health misinformation causing real harm

## Solution Overview

Browser extension + mobile app for instant content verification:
- Cryptographic journalist registry on Solana
- Real-time content fingerprinting & verification
- Community-driven fact-checking with reputation system
- WhatsApp bot integration for viral checking
- Immutable provenance tracking on-chain

## Tech Stack

- **Blockchain**: Solana (Devnet → Mainnet-ready)
- **Smart Contracts**: Anchor Framework (Rust)
- **Frontend**: Next.js 14 + Browser Extension API
- **Mobile**: PWA with share integration
- **Database**: Supabase (off-chain metadata)
- **Bot**: WhatsApp Business API (optional for MVP)

## Core Features (MVP - 23 Days)

### Phase 1: Foundation (Days 1-7)
- [ ] Verified journalist registry smart contract
- [ ] Content fingerprinting (SHA-256 hashing)
- [ ] Browser extension scaffold (Chrome)

### Phase 2: Core Features (Days 8-14)
- [ ] Real-time verification checking
- [ ] Visual badge system (✅ Verified | ⚠️ Disputed | ❌ False)
- [ ] Mobile PWA for sharing
- [ ] 10-15 pre-verified Indonesian news sources

### Phase 3: Polish (Days 15-21)
- [ ] Community fact-checking interface
- [ ] Reputation/staking mechanism
- [ ] Verification history dashboard
- [ ] Demo video production

### Phase 4: Submission (Days 22-23)
- [ ] Documentation
- [ ] Pitch deck
- [ ] Final testing & deployment

## Team Allocation

**Blockchain Lead** (1 dev): Smart contract, cryptographic verification
**Extension Developer** (1 dev): Chrome extension, content hashing
**Frontend Lead** (1 dev): Next.js PWA, mobile interface
**Full-stack** (1 dev): API, journalist onboarding, Supabase

**Total**: 3-4 developers

## Success Metrics

- **Impact**: Verify 1000+ articles in demo, 10+ verified journalists
- **Technical**: <1s verification time, 99.9% accuracy
- **Business**: Partnership LOI with 1 Indonesian media outlet
- **Demo**: Show viral hoax detection in real-time

## Key Differentiators

1. **Speed**: 400ms Solana finality = instant verification (vs minutes on Ethereum)
2. **WhatsApp Integration**: Where hoaxes actually spread in Indonesia
3. **Community-Driven**: Not centralized fact-checkers (censorship-resistant)
4. **Ministry Alignment**: Kominfo disinformation priorities

## Repository Structure

```
sumberbenar/
├── programs/
│   └── sumberbenar/
│       ├── src/
│       │   ├── lib.rs
│       │   ├── instructions/
│       │   │   ├── register_journalist.rs
│       │   │   ├── verify_content.rs
│       │   │   ├── submit_dispute.rs
│       │   │   └── update_status.rs
│       │   ├── state/
│       │   │   ├── journalist.rs
│       │   │   ├── content.rs
│       │   │   └── verification.rs
│       │   └── errors.rs
│       └── Cargo.toml
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── content-script.js
│   ├── popup/
│   └── assets/
├── app/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── verify/
│   │   ├── journalists/
│   │   └── api/
│   ├── components/
│   └── lib/
├── tests/
└── README.md
```

## Development Commands

```bash
# Blockchain
anchor build
anchor test
anchor deploy --provider.cluster devnet

# Extension
cd extension
npm run build
npm run watch

# Frontend
cd app
npm run dev
npm run build
```

## User Flow Example

1. User sees news article on Facebook/WhatsApp
2. Clicks browser extension icon (or shares to SumberBenar app)
3. Extension hashes article content (SHA-256)
4. Queries Solana in <400ms for verification status
5. Returns badge: ✅ "Verified by Kompas.com, signed 2h ago"
6. User can click to see full verification trail on-chain

## Links

- **Live Demo**: TBD
- **Chrome Extension**: TBD (demo APK)
- **Solana Explorer**: TBD
- **Demo Video**: TBD

---

**InshaAllah**, we combat Indonesian disinformation with blockchain transparency.
