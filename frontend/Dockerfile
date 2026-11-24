# ==============================================================================
# C-TECH Frontend Production Dockerfile (Multi-stage Vite + Nginx Alpine)
# ==============================================================================

# --- Stage 1: Build React SPA ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# --- Stage 2: Serve via Nginx Alpine ---
FROM nginx:alpine-slim

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom reverse proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
