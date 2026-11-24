#!/usr/bin/env bash
# ==============================================================================
# C-TECH Institutional Chemical Trade Desk — Production Deployment Script
# Target: Ubuntu 22.04 / 24.04 LTS or Debian 12
# Usage: ./deploy.sh
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}C-TECH CHEMICAL TRADE DESK — AUTOMATED CLOUD DEPLOYMENT${NC}"
echo -e "${BLUE}================================================================${NC}\n"

# 1. Check Root / Sudo Privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[Error] Please run this deployment script as root or with sudo.${NC}"
  exit 1
fi

# 2. Check System Prerequisites
echo -e "${YELLOW}--> Step 1: Checking system packages (Docker & Docker Compose)...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "    Installing Docker Engine..."
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg lsb-release ufw
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  echo -e "${GREEN}    [OK] Docker Engine installed successfully.${NC}"
else
  echo -e "${GREEN}    [OK] Docker is already installed: $(docker --version)${NC}"
fi

# 3. Configure Firewall (UFW)
echo -e "\n${YELLOW}--> Step 2: Hardening Firewall (UFW)...${NC}"
ufw status | grep -qw "active" || {
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 22/tcp comment 'SSH'
  ufw allow 80/tcp comment 'HTTP'
  ufw allow 443/tcp comment 'HTTPS'
  echo "y" | ufw enable
  echo -e "${GREEN}    [OK] UFW enabled: Allowed ports 22, 80, 443.${NC}"
}

# 4. Check Environment Configuration File
echo -e "\n${YELLOW}--> Step 3: Verifying Production Environment Configuration...${NC}"
if [ ! -f "backend/.env.production" ]; then
  echo -e "${RED}    [Error] backend/.env.production not found!${NC}"
  echo -e "    Please create backend/.env.production with strong JWT secrets before deploying."
  exit 1
fi
echo -e "${GREEN}    [OK] backend/.env.production verified.${NC}"

# 5. Build and Launch Stack
echo -e "\n${YELLOW}--> Step 4: Building and Launching Docker Containers...${NC}"
docker compose down --remove-orphans || true
docker compose build --pull
docker compose up -d

# 6. Wait for Database Health and Execute Migrations
echo -e "\n${YELLOW}--> Step 5: Awaiting Database Readiness & Running Migrations...${NC}"
for i in {1..30}; do
  if docker compose exec -T postgres pg_isready -U postgres -d ctech_v3 &> /dev/null; then
    echo -e "${GREEN}    [OK] PostgreSQL is healthy and accepting connections.${NC}"
    break
  fi
  echo "    Waiting for PostgreSQL to initialize (${i}/30)..."
  sleep 2
done

# Run database migrations inside backend container
echo -e "    Executing database migrations..."
docker compose exec -T backend npm run migrate
echo -e "${GREEN}    [OK] Database schema is up to date.${NC}"

# 7. Verify Health Probes
echo -e "\n${YELLOW}--> Step 6: Verifying Production Health Probes...${NC}"
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/health || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}    [PASS] Health Probe: http://localhost/api/v1/health returned HTTP 200 OK${NC}"
else
  echo -e "${RED}    [FAIL] Health Probe failed with HTTP ${HTTP_CODE}${NC}"
  docker compose logs --tail=50 backend
  exit 1
fi

echo -e "\n${BLUE}================================================================${NC}"
echo -e "${GREEN}DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "Platform URL:   http://localhost (or public server IP)"
echo -e "Backend API:    http://localhost/api/v1"
echo -e "Health Probe:   http://localhost/api/v1/health/ready"
echo -e "${BLUE}================================================================${NC}\n"
