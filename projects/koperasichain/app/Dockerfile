# ═══════════════════════════════════════════════════
# Dockerfile - KoperasiChain Next.js Application
# ═══════════════════════════════════════════════════
# Context7: https://context7.com/basecamp/kamal-site
# Pattern: Multi-stage build for optimized production image
# ═══════════════════════════════════════════════════

# ───────────────────────────────────────────────────
# Stage 1: Dependencies
# ───────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Install libc6-compat for Next.js compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# ───────────────────────────────────────────────────
# Stage 2: Builder
# ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# ───────────────────────────────────────────────────
# Stage 3: Runner (Production)
# ───────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Health check for Kamal
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]

# ═══════════════════════════════════════════════════
# Build Time: ~3-5 minutes (first build)
# Image Size: ~150-200MB (optimized)
# Security: Non-root user, minimal Alpine base
# ═══════════════════════════════════════════════════
