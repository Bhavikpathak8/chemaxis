# ChemAxis — Institutional Chemical Trade Desk

**ChemAxis** is a sovereign, production-grade B2B chemical trading marketplace connecting verified chemical manufacturers, institutional buyers, and desk administrators across Gujarat's chemical corridors (Dahej PCPIR, Ankleshwar, Hazira, and Panoli).

Chemical suppliers list stock with encrypted reserve rates. The ChemAxis trade desk executes zero-leakage pricing, handles quotations and spot RFQs, generates GST e-invoices with QR codes, arranges HazMat tankers with E-Way Bill documentation, and settles payouts.

Sellers never see the buyer's price; buyers never see the seller's reserve price.

---

## ⚡ Key Highlights & Architecture

- **Role-Based Portals:**
  - **Buyer Portal:** Browse physical catalog, request spot RFQs, lock orders, track tanker dispatch, download invoices & COA/MSDS.
  - **Seller Portal:** Onboard with GSTIN verification, list physical inventory, attach specification documents (COA/MSDS), track payouts.
  - **Super Admin Desk:** Deep verification, dynamic margin engine (fixed / percentage / manual), dispatch scheduling, expense tracking, and GST e-invoicing.
- **Enterprise Security:**
  - Strict JWT session authentication + Refresh tokens.
  - Rate limiting & brute-force mitigation on authentication endpoints.
  - Zero Price Leakage: Server-side data stripping prevents unauthorized margin or counterparty visibility.
  - Row-locked inventory reservation preventing overselling or race conditions.
- **Tech Stack:**
  - **Frontend:** React 18, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion.
  - **Backend:** Node.js, Express REST API, PostgreSQL connection pooling.
  - **Compliance:** GSTIN algorithmic validation, HazMat UN/Packaging classifications, Audit logging.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 16+

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Configure your DATABASE_URL, JWT_SECRET, and transactional email/SMS credentials in .env
npm install
npm run migrate
npm run seed
npm run dev
```
Backend API will be running at `http://localhost:4000/api/v1`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
ChemAxis Trade Desk web app will be accessible at `http://localhost:5173`.

---

## 📦 Production Deployment

### Frontend (Vercel / Cloudflare / Netlify)
Build output:
```bash
cd frontend
npm run build
```
Deploy the `frontend/dist` directory to your static hosting provider with single-page application (SPA) rewrite rules pointing all routes to `/index.html`.

### Backend (Docker / Render / Railway / VM)
Start production backend with PM2 or Docker:
```bash
# Docker Compose
docker compose up -d

# PM2
pm2 start ecosystem.config.js --env production
```

---

## 🛡️ License & Trademarks
Copyright © ChemAxis Chemicals Pvt Ltd. All rights reserved.
