# ==============================================================================
# ChemAxis Institutional Chemical Trade Desk — Production Dockerfile
# Multi-stage secure build (Compiles frontend SPA & runs backend REST API)
# ==============================================================================

# --- Stage 1: Build Frontend Assets ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Install Backend Dependencies ---
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# --- Stage 3: Minimal Production Container ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=10000

RUN apk add --no-cache dumb-init

# Copy backend dependencies and source
WORKDIR /app/backend
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY backend/package*.json ./
COPY backend/src/ ./src/
COPY backend/migrations/ ./migrations/
COPY backend/scripts/ ./scripts/

# Copy built frontend assets so backend can serve the full website
WORKDIR /app/frontend
COPY --from=frontend-builder /app/frontend/dist ./dist

WORKDIR /app/backend
RUN mkdir -p uploads/seller-docs && chown -R node:node /app

USER node

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 10000) + '/api/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
