# ==============================================================================
# C-TECH Chemical Trading Platform — Backend Production Dockerfile
# Multi-stage secure build with Node.js 22 LTS Alpine
# ==============================================================================

# --- Stage 1: Dependencies & Build ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# --- Stage 2: Production Minimal Runtime ---
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production \
    PORT=4000

# Install dumb-init or use Node native signal handling
RUN apk add --no-cache dumb-init

# Copy node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/
COPY migrations/ ./migrations/
COPY scripts/ ./scripts/

# Create uploads directory and assign ownership to non-root user
RUN mkdir -p uploads/seller-docs && chown -R node:node /usr/src/app

# Switch to non-root user for security
USER node

EXPOSE 4000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/api/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
