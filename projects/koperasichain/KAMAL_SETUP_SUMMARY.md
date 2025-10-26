# Kamal Setup Summary - KoperasiChain

**Date**: October 26, 2025
**Status**: ✅ Complete - Ready for deployment
**Context7 Reference**: https://context7.com/basecamp/kamal-site

---

## 📦 What Was Created

### 1. Docker Configuration

**📄 `app/Dockerfile`**
- Multi-stage build for Next.js
- Optimized for production (~150-200MB image)
- Non-root user for security
- Built-in health check
- Node 20 Alpine base

**📄 `app/.dockerignore`**
- Excludes node_modules, .next, .git
- Prevents secrets from being copied to image
- Reduces build context size

**📄 `app/next.config.ts`** (Updated)
- Added `output: 'standalone'` for Docker
- Disabled `poweredByHeader` for security

**📄 `app/app/api/health/route.ts`** (New)
- Health check endpoint for Kamal
- Returns JSON with status, timestamp, service name
- Used by Traefik proxy for zero-downtime deployments

### 2. Kamal Configuration

**📄 `config/deploy.yml`**
- Complete Kamal deployment configuration
- Context7 best practices applied
- Zero-downtime deployment setup
- SSL/TLS with Let's Encrypt
- Health check configuration
- Traefik reverse proxy settings
- Environment variables (clear + secret)
- Rollback support (retains 3 containers)

**Key Settings:**
```yaml
service: koperasichain
image: rectorspace/koperasichain  # UPDATE THIS
servers:
  web:
    hosts:
      - sanctum  # UPDATE THIS
proxy:
  ssl: true
  host: koperasichain.rectorspace.com  # UPDATE THIS
  healthcheck:
    path: /api/health
    interval: 10s
registry:
  username: rectorspace  # UPDATE THIS
  password: KAMAL_REGISTRY_PASSWORD (from secrets)
```

### 3. Secrets Management

**📄 `.kamal/secrets-example`**
- Template for secrets configuration
- Instructions for Docker Hub / GitHub Container Registry
- Guidelines for secure credential management

**⚠️ IMPORTANT:**
```bash
# Copy template to create your secrets file:
cp .kamal/secrets-example .kamal/secrets

# Fill in your Docker Hub access token
# NEVER commit .kamal/secrets to git (it's in .gitignore)
```

### 4. Deployment Hooks

**📄 `.kamal/hooks/pre-deploy`** (executable)
- Runs BEFORE deployment starts
- Current checks:
  - Displays deployment info
  - Checks for exposed secrets in code
- Can be extended with:
  - Linting (`npm run lint`)
  - Testing (`npm run test`)
  - Additional validation

**📄 `.kamal/hooks/post-deploy`** (executable)
- Runs AFTER deployment completes
- Current actions:
  - Success notification
  - Smoke test (health check)
- Can be extended with:
  - Telegram notifications
  - Slack webhooks
  - Monitoring alerts

### 5. Documentation

**📄 `DEPLOYMENT_GUIDE.md`** (Completely rewritten)
- Replaced Vercel with Kamal instructions
- Step-by-step deployment process
- Troubleshooting guide
- Advanced configuration examples
- SSL/TLS setup
- Rollback procedures
- Emergency procedures

**📄 `README.md`** (Updated)
- Changed deployment from "Vercel" to "Kamal (Docker + VPS)"
- Updated live demo URL to koperasichain.rectorspace.com
- Updated tech stack section

**📄 `CLAUDE.md`** (Updated)
- Changed DEPLOYMENT_GUIDE.md description to reflect Kamal

**📄 `.gitignore`** (Updated)
- Added `.kamal/secrets` (CRITICAL - never commit secrets!)
- Added `.kamal/secrets-*` pattern
- Allows `.kamal/secrets-example` to be committed

---

## 🚀 Quick Start

### Prerequisites

```bash
# 1. Install Kamal
gem install kamal

# 2. Verify installation
kamal version

# 3. Ensure Docker Hub account ready
# Sign up: https://hub.docker.com
# Create access token: https://hub.docker.com/settings/security
```

### First Deployment

```bash
# 1. Navigate to project
cd /Users/rz/local-dev/garuda-spark-blockchain/projects/koperasichain

# 2. Configure secrets
cp .kamal/secrets-example .kamal/secrets
nano .kamal/secrets  # Fill in KAMAL_REGISTRY_PASSWORD

# 3. Update config/deploy.yml
# - Line 10: image: YOUR_DOCKERHUB_USERNAME/koperasichain
# - Line 25: hosts: [your-vps-alias]
# - Line 50: host: koperasichain.rectorspace.com
# - Line 65: username: YOUR_DOCKERHUB_USERNAME

# 4. Bootstrap VPS (installs Docker) - ONCE ONLY
kamal server bootstrap

# 5. First deployment
kamal setup
# ⏱️ Duration: ~10-15 minutes

# 6. Verify deployment
curl https://koperasichain.rectorspace.com/api/health
```

### Regular Deployments

```bash
# After making code changes
cd /Users/rz/local-dev/garuda-spark-blockchain/projects/koperasichain
git add .
git commit -m "Your changes"
git push

# Deploy
kamal deploy
# ⏱️ Duration: ~5 minutes
# ⚡ Downtime: 0 seconds (zero-downtime!)
```

---

## 🔧 Configuration Checklist

### Before First Deployment

- [ ] **Install Kamal**: `gem install kamal`
- [ ] **Docker Hub account**: Create at https://hub.docker.com
- [ ] **Access token**: Generate at https://hub.docker.com/settings/security
- [ ] **DNS configured**: A record pointing koperasichain.rectorspace.com to VPS IP
- [ ] **VPS accessible**: Test with `ssh sanctum` (or your alias)

### Update config/deploy.yml

- [ ] **Line 10**: `image: YOUR_DOCKERHUB_USERNAME/koperasichain`
- [ ] **Line 25**: `hosts: [sanctum]` (or your VPS SSH alias)
- [ ] **Line 50**: `host: koperasichain.rectorspace.com`
- [ ] **Line 65**: `username: YOUR_DOCKERHUB_USERNAME`

### Create .kamal/secrets

- [ ] **Copy template**: `cp .kamal/secrets-example .kamal/secrets`
- [ ] **Add Docker token**: Set `KAMAL_REGISTRY_PASSWORD=your_token_here`
- [ ] **Verify gitignore**: `git check-ignore .kamal/secrets` (should output: .kamal/secrets)

---

## 📊 File Structure Overview

```
koperasichain/
├── app/
│   ├── Dockerfile                         # ✅ New: Docker build instructions
│   ├── .dockerignore                      # ✅ New: Exclude files from build
│   ├── next.config.ts                     # ✅ Updated: Added standalone output
│   └── app/
│       └── api/
│           └── health/
│               └── route.ts               # ✅ New: Health check endpoint
│
├── config/
│   └── deploy.yml                         # ✅ New: Kamal configuration
│
├── .kamal/
│   ├── secrets-example                    # ✅ New: Secrets template
│   └── hooks/
│       ├── pre-deploy                     # ✅ New: Pre-deployment hook
│       └── post-deploy                    # ✅ New: Post-deployment hook
│
├── DEPLOYMENT_GUIDE.md                    # ✅ Updated: Kamal instructions
├── README.md                              # ✅ Updated: Deployment info
├── KAMAL_SETUP_SUMMARY.md                 # ✅ New: This file
└── .gitignore                             # ✅ Updated: Added .kamal/secrets

Files to ignore (gitignored):
└── .kamal/
    └── secrets                            # 🔴 NEVER commit this!
```

---

## ⚠️ Important Security Notes

### NEVER Commit Secrets

```bash
# ✅ Committed (safe):
.kamal/secrets-example        # Template with placeholders

# 🔴 NEVER commit (gitignored):
.kamal/secrets                # Contains your actual tokens
```

### Verify Before Committing

```bash
# Check what will be committed
git status

# Verify secrets file is gitignored
git check-ignore .kamal/secrets
# Should output: .kamal/secrets

# If secrets file shows up in git status:
git rm --cached .kamal/secrets
git commit -m "Remove secrets file from tracking"
```

---

## 🎯 Next Steps

### 1. Install Kamal
```bash
gem install kamal
kamal version
```

### 2. Configure Your Credentials
```bash
cd /Users/rz/local-dev/garuda-spark-blockchain/projects/koperasichain
cp .kamal/secrets-example .kamal/secrets
# Edit .kamal/secrets and add your Docker Hub token
```

### 3. Update config/deploy.yml
- Docker Hub username
- VPS host alias
- Domain name

### 4. Test Locally
```bash
cd app
npm run build  # Ensure builds successfully
```

### 5. Deploy!
```bash
kamal server bootstrap  # First time only - installs Docker
kamal setup             # First deployment
```

---

## 🆘 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `kamal: command not found` | Install Kamal: `gem install kamal` |
| `Port 443 already in use` | See DEPLOYMENT_GUIDE.md → Issue 3: Port Conflict |
| `Health check failed` | Check logs: `kamal app logs --tail 100` |
| `SSH connection refused` | Test SSH: `ssh sanctum` |
| `Registry authentication failed` | Verify token in `.kamal/secrets` |

**Full troubleshooting guide**: See `DEPLOYMENT_GUIDE.md` (sections starting line 338)

---

## 📚 Resources

**Documentation:**
- **Kamal Official**: https://kamal-deploy.org
- **Context7 Reference**: https://context7.com/basecamp/kamal-site
- **Local Guide**: `DEPLOYMENT_GUIDE.md`

**Your Infrastructure:**
- **Docker Hub**: https://hub.docker.com/u/rectorspace
- **VPS SSH Config**: `~/.ssh/config`
- **Domain**: koperasichain.rectorspace.com

---

## ✨ Benefits of Kamal

### vs Vercel
✅ **Full control**: Own your infrastructure
✅ **No vendor lock-in**: Can move to any VPS
✅ **Lower cost**: No serverless pricing surprises
✅ **Flexibility**: Run any Docker container
✅ **Learning**: Understand deployment internals

### Features
✅ **Zero-downtime deployments**: Seamless updates
✅ **Automatic SSL**: Let's Encrypt integration
✅ **Easy rollbacks**: Keep 3 previous versions
✅ **Health checks**: Automatic traffic switching
✅ **Multi-server**: Scale horizontally
✅ **Accessories**: PostgreSQL, Redis, etc.

---

## 🎬 Deployment Workflow Example

```bash
# 1. Make changes to code
cd projects/koperasichain/app
# ... edit files ...

# 2. Test locally
npm run build
npm run lint

# 3. Commit
cd ..
git add .
git commit -m "Add feature X"
git push

# 4. Deploy to production
kamal deploy

# 5. Verify
curl https://koperasichain.rectorspace.com/api/health
# {"status":"healthy","timestamp":"2025-10-26T...","service":"koperasichain"}

# 6. Check logs
kamal app logs --tail 50

# 7. If issues, rollback
kamal app containers -q  # List versions
kamal rollback <previous_version>
```

---

## 🔒 Security Checklist

- [x] `.kamal/secrets` in `.gitignore`
- [x] Docker Hub uses access token (not password)
- [x] SSL/TLS enabled in `config/deploy.yml`
- [x] Non-root user in Dockerfile
- [x] Health check endpoint uses standard path
- [x] Pre-deploy hook checks for exposed secrets
- [ ] Configure firewall on VPS (UFW)
- [ ] Set up monitoring (Uptime Robot, etc.)
- [ ] Implement backup strategy for database
- [ ] Rotate secrets every 90 days

---

**Alhamdulillah, Kamal setup complete! Ready for deployment, InshaAllah.** 🚀

Bismillah - may your deployments be smooth and your uptime be 100%!
