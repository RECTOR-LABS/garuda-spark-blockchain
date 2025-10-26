# Kamal Deployment Guide - KoperasiChain

**Project:** KoperasiChain Frontend
**Framework:** Next.js 15.5.4
**Deployment:** Kamal (Zero-downtime Docker deployment)
**Target:** VPS (rectorspace.com)

**Context7 Reference:** https://context7.com/basecamp/kamal-site

---

## 🎯 Deployment Strategy

KoperasiChain uses **Kamal** for production deployment:
- ✅ Zero-downtime deployments
- ✅ Docker containerization
- ✅ SSL/TLS with Let's Encrypt
- ✅ Automatic health checks
- ✅ Easy rollbacks
- ✅ Full control on your VPS

---

## 📋 Prerequisites

### 1. Local Machine Requirements

```bash
# Ruby (for Kamal gem)
ruby --version  # Should be >= 3.0

# Kamal installation
gem install kamal

# Verify installation
kamal version
```

### 2. VPS Requirements

- ✅ Ubuntu 20.04+ or Debian 11+
- ✅ Minimum 1GB RAM (2GB recommended)
- ✅ SSH access configured in `~/.ssh/config`
- ✅ Sudo privileges
- ✅ Docker will be installed by Kamal

### 3. Domain & DNS

```
Type: A Record
Name: koperasichain (or @)
Value: YOUR_VPS_IP (e.g., 176.222.53.185)
TTL: 300
```

**Verify DNS propagation:**
```bash
dig koperasichain.rectorspace.com +short
# Should return your VPS IP
```

### 4. Docker Registry

You need a Docker registry account (choose one):

**Option A: Docker Hub** (Recommended for simplicity)
- Sign up: https://hub.docker.com
- Create access token: https://hub.docker.com/settings/security
- Username: `rectorspace` (or your Docker Hub username)

**Option B: GitHub Container Registry**
- Token: https://github.com/settings/tokens
- Permissions: `write:packages`, `read:packages`
- Username: Your GitHub username

---

## 🚀 Initial Setup (First Time Only)

### Step 1: Configure Secrets

```bash
# Navigate to project directory
cd /Users/rz/local-dev/garuda-spark-blockchain/projects/koperasichain

# Copy secrets template
cp .kamal/secrets-example .kamal/secrets

# Edit secrets file
nano .kamal/secrets
# or
code .kamal/secrets
```

**Fill in your credentials:**
```shell
# Docker Hub authentication
KAMAL_REGISTRY_PASSWORD=your_docker_hub_access_token_here
```

**IMPORTANT:** Verify `.kamal/secrets` is in `.gitignore`:
```bash
git check-ignore .kamal/secrets
# Should output: .kamal/secrets
```

### Step 2: Update Deployment Configuration

Edit `config/deploy.yml`:

```bash
nano config/deploy.yml
```

**Update these values:**
1. **Docker Registry** (line 10):
   ```yaml
   image: YOUR_DOCKERHUB_USERNAME/koperasichain
   ```

2. **Server Host** (line 25):
   ```yaml
   hosts:
     - sanctum  # Your SSH config alias
   ```

3. **Domain** (line 50):
   ```yaml
   host: koperasichain.rectorspace.com
   ```

4. **Registry Username** (line 65):
   ```yaml
   username: YOUR_DOCKERHUB_USERNAME
   ```

### Step 3: Bootstrap VPS (Install Docker)

**IMPORTANT:** Only run this ONCE per VPS!

```bash
# This installs Docker on your VPS
kamal server bootstrap

# Expected output:
# Running docker installation on sanctum
# ✅ Docker installed successfully
```

**If your VPS already has Docker:**
```bash
# Skip bootstrap, just verify Docker is running
ssh sanctum 'docker --version'
```

### Step 4: Initial Deployment

```bash
# First deployment - this will take 5-10 minutes
kamal setup

# Expected steps:
# 1. Building Docker image (3-5 min)
# 2. Pushing to registry (1-2 min)
# 3. Deploying to VPS (1-2 min)
# 4. Starting Traefik proxy
# 5. Deploying application container
# 6. Running health checks
# 7. SSL certificate provisioning
```

---

## 🔄 Regular Deployments (After Code Changes)

### Standard Deployment

```bash
# Navigate to project
cd /Users/rz/local-dev/garuda-spark-blockchain/projects/koperasichain

# Deploy latest code
kamal deploy

# Process:
# 1. Builds new Docker image
# 2. Pushes to registry
# 3. Pulls image on VPS
# 4. Starts new container
# 5. Health checks pass
# 6. Switches traffic to new container
# 7. Stops old container (kept for rollback)
#
# ⏱️ Duration: ~5 minutes
# ⚡ Downtime: 0 seconds (zero-downtime!)
```

### Deploy with Custom Version Tag

```bash
# Tag with git SHA
kamal deploy --version=$(git rev-parse --short HEAD)

# Tag with custom version
kamal deploy --version=v1.0.2
```

### Force Rebuild (Skip Cache)

```bash
# Useful when dependencies change
kamal build push --no-cache
kamal deploy
```

---

## 🛠️ Common Operations

### View Application Logs

```bash
# Tail logs (follow mode)
kamal app logs --tail 100 --follow

# Last 50 lines
kamal app logs --tail 50

# Search logs for errors
kamal app logs --grep "error" --tail 200
```

### Check Container Status

```bash
# List running containers
kamal app containers

# Detailed container info
kamal app containers -q
```

### Restart Application

```bash
# Restart without rebuilding
kamal app restart
```

### Execute Commands in Container

```bash
# Open bash shell in container
kamal app exec 'bash'

# Run Node.js command
kamal app exec 'node --version'

# Check environment variables
kamal app exec 'env'
```

### Check Health Status

```bash
# Traefik proxy status
kamal proxy status

# Application status
kamal app status

# Full deployment status
kamal details
```

---

## 🔙 Rollback (Emergency)

If a deployment goes wrong:

```bash
# List available versions (shows last 3 by default)
kamal app containers -q

# Example output:
# koperasichain-abc123 (current)
# koperasichain-def456 (1 deployment ago)
# koperasichain-ghi789 (2 deployments ago)

# Rollback to previous version
kamal rollback def456

# ⏱️ Duration: ~30 seconds
# ⚡ Uses cached container image (very fast!)
```

---

## 🛡️ SSL/TLS Configuration

Kamal automatically provisions SSL certificates via Let's Encrypt.

### Verify SSL

```bash
# Check certificate status
curl -I https://koperasichain.rectorspace.com

# Expected header:
# HTTP/2 200
# server: Traefik
```

### SSL Troubleshooting

If SSL fails to provision:

```bash
# Check Traefik logs
kamal proxy logs

# Common issues:
# 1. DNS not propagated (wait 5-10 minutes)
# 2. Port 443 blocked by firewall
# 3. Let's Encrypt rate limit (5 certs/domain/week)
```

**Manual SSL verification:**
```bash
# Test Let's Encrypt challenge
ssh sanctum
curl http://koperasichain.rectorspace.com/.well-known/acme-challenge/test
```

---

## 🚨 Troubleshooting

### Issue 1: Build Fails - "Module not found"

**Symptom:**
```
ERROR: failed to solve: failed to compute cache key
```

**Solution:**
```bash
# Clear local build cache
docker system prune -a

# Rebuild from scratch
kamal build push --no-cache
kamal deploy
```

### Issue 2: Health Check Fails

**Symptom:**
```
Error: Container failed health check
```

**Diagnosis:**
```bash
# Check app logs for errors
kamal app logs --tail 100

# Common causes:
# 1. App crashed on startup
# 2. Port 3000 not exposed
# 3. /api/health endpoint missing
# 4. Slow startup (increase readiness_delay)
```

**Solution:**
```yaml
# In config/deploy.yml, increase delays:
readiness_delay: 15  # Was 10
deploy_timeout: 180  # Was 120
```

### Issue 3: Port Conflict on VPS

**Symptom:**
```
Error: Port 443 already in use
```

**Solution 1: Use Custom Ports**

Edit `config/deploy.yml`:
```yaml
proxy:
  ssl: true
  host: koperasichain.rectorspace.com
  publish:
    - "8080:80"
    - "8443:443"
```

Access via: `https://koperasichain.rectorspace.com:8443`

**Solution 2: Configure Existing Nginx as Frontend Proxy**

On VPS, edit Nginx config:
```nginx
# /etc/nginx/sites-available/koperasichain
server {
    listen 80;
    listen 443 ssl;
    server_name koperasichain.rectorspace.com;

    # SSL config...

    location / {
        proxy_pass http://localhost:8080;  # Kamal on custom port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Issue 4: SSH Connection Failed

**Symptom:**
```
Error: SSH connection refused
```

**Solution:**
```bash
# Test SSH manually
ssh sanctum

# If fails, check ~/.ssh/config:
cat ~/.ssh/config | grep -A 3 "Host sanctum"

# Verify VPS firewall allows SSH (port 22)
ssh sanctum 'sudo ufw status'
```

### Issue 5: Registry Authentication Failed

**Symptom:**
```
Error: unauthorized: authentication required
```

**Solution:**
```bash
# Verify secrets file has correct token
cat .kamal/secrets | grep KAMAL_REGISTRY_PASSWORD

# Test Docker login manually
docker login -u rectorspace

# Regenerate Docker Hub token if needed:
# https://hub.docker.com/settings/security
```

---

## 🔧 Advanced Configuration

### Add PostgreSQL Database

Edit `config/deploy.yml`:

```yaml
accessories:
  postgres:
    image: postgres:16-alpine
    host: sanctum
    port: 5432
    env:
      secret:
        - POSTGRES_PASSWORD
      clear:
        POSTGRES_USER: koperasichain
        POSTGRES_DB: koperasichain_production
    directories:
      - data/postgres:/var/lib/postgresql/data
```

Add to `.kamal/secrets`:
```shell
POSTGRES_PASSWORD=your_secure_password_here
```

Deploy database:
```bash
kamal accessory boot postgres
```

### Add Redis Cache

```yaml
accessories:
  redis:
    image: redis:7-alpine
    host: sanctum
    port: 6379
    directories:
      - data/redis:/data
```

```bash
kamal accessory boot redis
```

### Multi-Server Deployment

```yaml
servers:
  web:
    hosts:
      - sanctum   # 176.222.53.185
      - tester    # 185.70.184.150
    labels:
      traefik.http.routers.koperasichain.rule: Host(`koperasichain.rectorspace.com`)

  workers:
    hosts:
      - sanctum
    cmd: "node worker.js"
    proxy: false  # Workers don't need HTTP proxy
```

---

## 📊 Monitoring & Maintenance

### View Resource Usage

```bash
# CPU, memory, disk on VPS
ssh sanctum 'docker stats --no-stream'

# Docker disk usage
ssh sanctum 'docker system df'
```

### Clean Up Old Images

```bash
# Remove unused Docker images (reclaim disk space)
kamal server prune

# Aggressive cleanup (removes everything not running)
ssh sanctum 'docker system prune -a --volumes'
```

### Update Kamal

```bash
# Update Kamal gem
gem update kamal

# Verify new version
kamal version
```

---

## 🎬 Deployment Workflow

```bash
# 1. Development: Make code changes
cd /Users/rz/local-dev/garuda-spark-blockchain/projects/koperasichain
# ... edit files ...

# 2. Test locally
cd app
npm run build  # Ensure builds successfully
npm run lint   # Check code quality

# 3. Commit changes
git add .
git commit -m "Add new feature: X"
git push origin dev

# 4. Deploy to production
kamal deploy

# 5. Verify deployment
curl -I https://koperasichain.rectorspace.com/api/health
kamal app logs --tail 50

# 6. If issues, rollback immediately
# kamal rollback <previous_version>
```

---

## ✅ Post-Deployment Checklist

After deploying:

### Functional Testing
- [ ] Homepage loads: https://koperasichain.rectorspace.com
- [ ] Health check returns 200: https://koperasichain.rectorspace.com/api/health
- [ ] Wallet connection works (Phantom + Solflare)
- [ ] Create cooperative works
- [ ] Voting system works
- [ ] All navigation works
- [ ] Mobile view responsive

### Performance Testing
- [ ] Lighthouse score >90: https://pagespeed.web.dev
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <4s
- [ ] Check logs for errors: `kamal app logs --grep "error"`

### Security
- [ ] HTTPS enabled (SSL certificate active)
- [ ] Security headers present: `curl -I https://koperasichain.rectorspace.com`
- [ ] No secrets in code: `git grep -i "sk_live_"`
- [ ] .kamal/secrets not committed: `git check-ignore .kamal/secrets`

### Monitoring
- [ ] Health checks passing: `kamal details`
- [ ] Container running: `kamal app containers`
- [ ] No errors in logs: `kamal app logs --tail 100`

---

## 📈 Scaling Considerations

### Vertical Scaling (Single Server)

Upgrade VPS resources:
- 1GB RAM → 2GB (handles more traffic)
- 1 CPU → 2 CPU (faster response times)

No configuration changes needed - Kamal uses all available resources.

### Horizontal Scaling (Multiple Servers)

Add servers to `config/deploy.yml`:

```yaml
servers:
  web:
    hosts:
      - sanctum    # Primary
      - tester     # Secondary
```

Deploy:
```bash
kamal deploy

# Traffic automatically load-balanced across both servers
```

---

## 🆘 Emergency Procedures

### Complete Service Outage

```bash
# 1. Check container status
kamal app containers

# 2. Check logs for crash
kamal app logs --tail 200

# 3. Restart application
kamal app restart

# 4. If restart fails, redeploy last known good version
kamal rollback <version>

# 5. If all else fails, SSH and debug manually
ssh sanctum
docker ps -a
docker logs koperasichain
```

### Database Corruption

```bash
# 1. Stop application
kamal app stop

# 2. Backup database
ssh sanctum 'docker exec postgres pg_dump -U koperasichain > backup.sql'

# 3. Restore from backup
# (Restore procedures depend on your backup strategy)

# 4. Restart application
kamal app start
```

---

## 📚 Resources

**Official Documentation:**
- Kamal: https://kamal-deploy.org
- Context7: https://context7.com/basecamp/kamal-site
- Docker: https://docs.docker.com
- Traefik: https://doc.traefik.io/traefik

**Community Support:**
- Kamal Discord: https://discord.gg/YgHVT7GCXS
- Basecamp (Kamal creators): https://github.com/basecamp/kamal

**Your Infrastructure:**
- Docker Hub: https://hub.docker.com/u/rectorspace
- VPS SSH Config: `~/.ssh/config`
- Domain DNS: rectorspace.com registrar

---

## 🎯 Quick Command Reference

```bash
# Setup & Deploy
kamal setup              # First-time setup
kamal deploy             # Deploy new version
kamal rollback <version> # Rollback to previous

# Monitoring
kamal app logs           # View logs
kamal app containers     # List containers
kamal details            # Full status

# Management
kamal app restart        # Restart app
kamal app stop           # Stop app
kamal app start          # Start app
kamal server prune       # Clean old images

# Troubleshooting
kamal app exec 'bash'    # SSH into container
kamal proxy logs         # View proxy logs
kamal accessory logs postgres  # Database logs
```

---

**Deployment Time:**
- First setup: ~10-15 minutes
- Regular deploys: ~5 minutes
- Rollbacks: ~30 seconds

**Alhamdulillah, may your deployments be smooth and successful! 🚀**

Bismillah - zero-downtime deployments with full control on your VPS!
