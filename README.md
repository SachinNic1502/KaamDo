# KaamDo — Full-Stack Marketplace Platform

**Har Kaam, Sahi Insaan**  
Digital on-demand marketplace connecting customers with verified technicians, tradespeople, workers, and contractors.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |   Cloudflare / Nginx (Port 80/443)    |
                      +-------------------+-------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
    +-----------v-----------+                           +-----------v-----------+
    |   Customer Web &      |                           |   Mobile Application  |
    |   Admin Portal        |                           |   (Expo / React       |
    |   (Next.js 16 Web)    |                           |    Native SDK 57)     |
    +-----------+-----------+                           +-----------+-----------+
                |                                                   |
                +-------------------------+-------------------------+
                                          | HTTP / REST & WebSockets
                               +----------v----------+
                               | Next.js API Routes  |
                               | & Socket.IO Engine  |
                               +----------+----------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
              +---------v---------+               +---------v---------+
              |  MongoDB Replica  |               |  Redis Cluster    |
              |  Set (Documents)  |               |  (Rate Limit /    |
              |                   |               |   Session / OTP)  |
              +-------------------+               +-------------------+
```

---

## Tech Stack

### Web Application (Customer Portal & Admin Panel)
- **Framework:** Next.js 16 (App Router + Turbopack) & React 19
- **Styling:** Tailwind CSS + shadcn/ui design system with Dark/Light modes
- **State & Data Fetching:** TanStack React Query v5 & Redux Toolkit
- **Real-Time Layer:** Socket.IO WebSocket server with MongoDB persistence
- **Security:** Distributed Redis sliding-window rate limiting, HMAC upload signatures, role-based access containment (RBAC)
- **Database:** MongoDB 7+ via Mongoose 9 with multi-document replica-set transactions

### Mobile Application (Customer & Worker App)
- **Framework:** Expo SDK 57 (React Native 0.86) + TypeScript
- **Navigation:** React Navigation (Native Stack + Bottom Tabs)
- **Authentication:** WhatsApp / SMS OTP verification with automatic retry challenge
- **Worker Features:** 3-step KYC Wizard (Aadhaar/PAN/trade certs), live bank account configuration, GPS geofenced attendance, payout ledger
- **Customer Features:** Service catalog search, direct technician booking, OTP work authorization, dispute filing, ratings & reviews

---

## Key Marketplace Modules

1. **Customer Web Portal:**
   - `/` — High-converting marketplace landing page with hero search, categories grid, testimonials, and trust guarantees.
   - `/services` — Comprehensive service catalog with category filtering, trade chips, duration estimates, and upfront rates.
   - `/workers/[id]` — Public profile of verified professionals displaying rating, reviews, skills, and booking CTA.
   - `/book` & `/book/[subcategoryId]` — Multi-step booking wizard with slot selection, address geocoding, and OTP security.
2. **Automated Tax Invoicing:**
   - `GET /api/jobs/[id]/invoice` — GST-compliant tax invoice generation with SAC 9987 codes, 9% CGST + 9% SGST breakdown, and print-ready HTML (`?format=html`).
3. **Dynamic Platform Settings:**
   - `GET /api/settings` and `PATCH /api/settings` — Admin-configurable commission rules, cancellation fee policies, notification triggers, and covered cities.
4. **Worker KYC & Banking:**
   - Admin KYC verification portal (`/admin/kyc`) with pan/zoom document controls and live approve/reject actions.
   - Live worker bank account matching, IFSC validation, and payout tracking via `/api/payouts`.
5. **Real-time Engine:**
   - Bi-directional Socket.IO chat rooms scoped strictly to active job participants.
   - Worker assignment, arrival, and completion push notifications via Expo Server SDK.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- MongoDB 7.0+ (running locally or via Docker)
- Redis 7.0+ (running locally or via Docker)

### 1. Web Application Setup
```bash
cd web

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local

# 3. Seed initial marketplace categories & settings
npm run seed:marketplace

# 4. Optional: Seed admin user
ADMIN_PHONE=9876543210 ADMIN_PASSWORD=StrongPassword123! ADMIN_NAME="Super Admin" npm run seed:admin

# 5. Start dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the customer marketplace.  
Visit [http://localhost:3000/admin](http://localhost:3000/admin) to view the administration dashboard.

### 2. Mobile Application Setup
```bash
cd mobile

# 1. Install dependencies
npm install

# 2. Start Expo development server
npx expo start
```
Scan the QR code with Expo Go (Android) or the iOS Camera app.

---

## Automated Verification & Testing

```bash
# Run 60-point security containment and route audit
cd web
npm run test:security

# Typecheck both repositories
npm run typecheck:security
npx tsc --noEmit           # in web
npx tsc --noEmit           # in mobile

# Production Next.js build compilation
npm run build
```

---

## Production Deployment with Docker Compose

A complete production-ready container stack is pre-configured with Nginx reverse proxy, MongoDB replica set, and Redis:

```bash
# 1. Review environment variables in docker-compose.yml
# 2. Build and launch all services
docker-compose up -d --build

# 3. Check container status
docker-compose ps

# 4. Check service health
curl http://localhost/api/health
```

The health check endpoint (`/api/health`) provides real-time database ping latency, process uptime, and memory statistics.

---

## License

Private Proprietary — KaamDo Technologies Private Limited © 2026. All rights reserved.
