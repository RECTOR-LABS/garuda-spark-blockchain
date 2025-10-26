# Vercel Deployment Guide - KoperasiChain
**Project:** KoperasiChain Frontend
**Framework:** Next.js 15.5.4
**Target:** Vercel Production

---

## 🚀 Deployment Steps

### Step 1: Prepare Repository
```bash
# Ensure you're in the project root
cd /Users/rz/local-dev/garuda-spark-blockchain/projects/koperasichain

# Check git status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Epic 2 Complete: Voting system with proposal creation, voting UI, and execution"

# Push to GitHub
git push origin dev
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended - Faster)
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Navigate to app directory
cd app

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# ? Set up and deploy "app"? → Y
# ? Which scope? → Select your account
# ? Link to existing project? → N
# ? What's your project's name? → koperasichain
# ? In which directory is your code located? → ./
# ? Want to modify these settings? → N

# Production deployment
vercel --prod
```

#### Option B: Vercel Dashboard (Visual)
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import from GitHub:
   - Repository: `garuda-spark-blockchain`
   - Root Directory: `projects/koperasichain/app`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `projects/koperasichain/app`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
5. Environment Variables: None needed (using public Devnet RPC)
6. Click "Deploy"

### Step 3: Verify Deployment
After deployment completes:
1. Visit the Vercel deployment URL (e.g., `https://koperasichain.vercel.app`)
2. Run through **TESTING_GUIDE.md** on the live site
3. Verify:
   - ✅ Wallet connection works
   - ✅ Devnet transactions work
   - ✅ All pages load
   - ✅ No console errors (F12)

---

## 🔧 Configuration

### Vercel Project Settings

**Build & Development Settings:**
- **Framework Preset:** Next.js
- **Root Directory:** `projects/koperasichain/app`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

### Environment Variables
Currently using default public Devnet RPC (no env vars needed).

**Future (for production Mainnet):**
```
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_PROGRAM_ID=<mainnet-program-id>
```

---

## 🌐 Custom Domain (Optional)

If you want to use `koperasichain.rectorspace.com`:

### Step 1: Configure DNS (Cloudflare/Domain Provider)
Add CNAME record:
```
Type: CNAME
Name: koperasichain
Target: cname.vercel-dns.com
TTL: Auto
```

### Step 2: Add Domain in Vercel
1. Go to Vercel Project → Settings → Domains
2. Add domain: `koperasichain.rectorspace.com`
3. Verify DNS propagation
4. Wait for SSL certificate (automatic)

---

## 📊 Performance Optimization

### Lighthouse Scores Target:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >80

### Current Optimizations:
- ✅ Next.js Image optimization
- ✅ TailwindCSS purging unused styles
- ✅ Code splitting (automatic with Next.js)
- ✅ Static page generation where possible

### Future Optimizations (if needed):
- [ ] Enable Next.js Image with Vercel CDN
- [ ] Add og:image metadata for sharing
- [ ] Implement service worker (PWA)
- [ ] Add analytics (Vercel Analytics)

---

## 🔍 Monitoring & Analytics

### Vercel Analytics (Built-in)
Enable in Vercel Dashboard:
1. Project Settings → Analytics → Enable
2. View real-time metrics:
   - Page views
   - Unique visitors
   - Performance scores
   - Error rates

### Error Tracking (Optional - Sentry)
```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

**Environment Variables for Sentry:**
```
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<your-auth-token>
```

---

## 🚨 Troubleshooting Deployment Issues

### Issue 1: Build Fails - "Module not found"
**Cause:** Missing dependencies
**Solution:**
```bash
cd app
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Issue 2: Build Fails - TypeScript Errors
**Cause:** Type errors in code
**Solution:**
```bash
cd app
npm run build  # Test locally first
# Fix any errors shown
```

### Issue 3: "This app is not available in your region"
**Cause:** Wallet adapter issues with Solana network
**Solution:** Ensure `NEXT_PUBLIC_RPC_ENDPOINT` uses public RPC (or leave unset for default)

### Issue 4: Slow First Load
**Cause:** Next.js cold start
**Solution:**
- Enable Vercel Pro plan for faster cold starts
- Use edge functions for critical paths
- Implement loading states

### Issue 5: 404 on Direct URL Access
**Cause:** Next.js routing configuration
**Solution:** Ensure `next.config.ts` has correct settings:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Remove this line for Vercel
}
```

---

## 🔄 Continuous Deployment

Vercel automatically deploys on:
- **Push to `main`:** Production deployment
- **Push to other branches:** Preview deployment
- **Pull Requests:** Preview deployment with unique URL

**Workflow:**
```bash
# Development
git checkout dev
# ... make changes ...
git commit -m "Add feature X"
git push origin dev
# → Creates preview deployment

# Production
git checkout main
git merge dev
git push origin main
# → Deploys to production
```

---

## 📱 Mobile App (Future - Optional)

If you want a native mobile app later:

### Option A: PWA (Progressive Web App)
```bash
npm install next-pwa
```

Add to `next.config.ts`:
```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // existing config
})
```

### Option B: React Native (Separate App)
- Reuse smart contract interactions (`lib/anchor.ts`)
- Use `@solana-mobile/mobile-wallet-adapter` for native wallets
- Share business logic, rebuild UI with React Native

---

## ✅ Post-Deployment Checklist

After deploying to Vercel:

### Functional Testing:
- [ ] Homepage loads (no errors)
- [ ] Wallet connection works (Phantom + Solflare)
- [ ] Create cooperative works
- [ ] Join cooperative works
- [ ] Create proposal works
- [ ] Voting works
- [ ] Dashboard displays correctly
- [ ] All navigation links work
- [ ] Mobile view works (test on real phone)
- [ ] Solana Explorer links work
- [ ] No console errors (F12 → Console)

### Performance Testing:
- [ ] Run Lighthouse audit (F12 → Lighthouse)
- [ ] Performance score >90
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <4s
- [ ] Mobile performance acceptable

### Security:
- [ ] No API keys exposed in client code
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CSP headers configured (if needed)
- [ ] No wallet private keys in code

### SEO & Metadata:
- [ ] Title tags are descriptive
- [ ] Meta descriptions present
- [ ] og:image for social sharing (optional)
- [ ] Favicon displays correctly

---

## 📈 Scaling Considerations

### Current Architecture (MVP):
- Frontend: Vercel (serverless)
- Smart Contract: Solana Devnet
- No backend needed (blockchain is backend)

### Future Scaling (if needed):
1. **Database for Indexing:**
   - Add Supabase for fast queries
   - Index proposals, votes off-chain
   - Sync with blockchain events

2. **RPC Infrastructure:**
   - Use dedicated RPC (QuickNode, Helius)
   - Implement RPC load balancing
   - Add fallback RPC endpoints

3. **Caching:**
   - Redis for frequently accessed data
   - CDN for static assets
   - Service worker for offline support

4. **Mainnet Migration:**
   - Deploy program to Mainnet
   - Update `PROGRAM_ID` in `anchor.ts`
   - Configure production RPC endpoint
   - Test thoroughly before launch

---

## 🎯 Launch Checklist (Mainnet)

When ready for real users:

### Pre-Launch:
- [ ] Smart contract audited (by Otter Security, Sec3, etc.)
- [ ] All tests passing (100% coverage)
- [ ] Mainnet program deployed
- [ ] Frontend updated with Mainnet program ID
- [ ] Legal review (if needed for Indonesia)
- [ ] User documentation complete
- [ ] Support channels ready (Telegram, Discord)

### Launch:
- [ ] Announce on Twitter/X
- [ ] Post in Solana Discord/Reddit
- [ ] Submit to Solana dApp list
- [ ] Create demo video
- [ ] Write Medium article

### Post-Launch:
- [ ] Monitor errors (Sentry)
- [ ] Track usage (Vercel Analytics)
- [ ] Collect user feedback
- [ ] Iterate based on feedback

---

## 🆘 Support & Resources

**Vercel Docs:** https://vercel.com/docs
**Next.js Docs:** https://nextjs.org/docs
**Solana Docs:** https://docs.solana.com
**Wallet Adapter:** https://github.com/solana-labs/wallet-adapter

**Need Help?**
- Vercel Status: https://vercel-status.com
- Community: https://github.com/vercel/next.js/discussions

---

**Deployment Time:** ~5-10 minutes (first time)
**Redeploy Time:** ~2-3 minutes (subsequent)

**Bismillah, may the deployment be smooth and successful! InshaAllah, this will reach thousands of Indonesian cooperative members!** 🚀🇮🇩
