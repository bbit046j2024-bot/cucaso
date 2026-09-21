# CUCASO Platform (Production Application)

> **Coastal Universities and Colleges Adventists Students Organization**  
> *"United in Christ. Connected in Fellowship. Committed to Mission."*

A production-ready web application uniting Seventh-day Adventist student chapters across universities, colleges, and schools in Mombasa and the Kenyan coastal region.

---

## 1. Quick Start

### Prerequisites
- Node.js 18+ (Node.js 20 LTS recommended)
- MySQL 8.0+ or TiDB
- npm 9+

### Installation & Local Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your TiDB / MySQL connection string and secrets
   ```

3. Initialize Prisma and generate the client:
   ```bash
   npx prisma generate
   npm run db:push
   ```

4. Seed the development database (optional):
   ```bash
   npm run db:seed
   ```

5. Run type checks and test suites:
   ```bash
   npm run type-check
   npm run test:engine
   ```

6. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 2. Core Architecture & Features

- **Public Ministry Portal**: Complete 31-section public presence matching the official website proposal (`/`, `/about`, `/institutions`, `/leadership`, `/events`, `/rallies`, `/media/*`, `/resources/*`, `/apply`, `/alumni`, `/partners`, `/support`, `/contact`).
- **Authenticated Operations Center (`/portal`)**:
  - **Council Queue**: Review prospective chapters, inspect patron endorsements, vote on applications, and assign capability tiers.
  - **Capability-Weighted Cost Engine**: Pure deterministic calculations (PRD Section 6) in integer KES with automatic rounding remainder resolution and cross-subsidy transparency.
  - **Attendee Management**: Registration, CSV uploads, age validation, and KDPA under-18 guardian consent enforcement.
  - **Daraja M-Pesa C2B Ingestion**: Automated reconciliation queue matching M-Pesa Paybill transactions to chapter invoices with idempotency and audit logs.
  - **Security & RBAC**: Argon2id password hashing, iron-session cookies, and mandatory RFC 6238 TOTP 2FA for all administrative roles.

---

## 3. Documentation Index

The platform includes comprehensive operational and architectural documentation in the `docs/` directory:

| Document | Description |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architectural specification, proposal merge map, and security matrix |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Complete data dictionary and Prisma schema documentation |
| [docs/SECURITY.md](docs/SECURITY.md) | OWASP ASVS Level 2 baseline and emergency break-glass procedure |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker multi-stage build, docker-compose, and Nginx VPS deployment guide |
| [docs/RUNBOOK.md](docs/RUNBOOK.md) | Incident response drills, database backup/restore procedures |
| [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | Plain-language manual for CUCASO executive officers and chapter reps |
| [docs/PAYMENT_INTEGRATION.md](docs/PAYMENT_INTEGRATION.md) | Safaricom Daraja M-Pesa C2B integration and webhook testing guide |
| [docs/KDPA_COMPLIANCE.md](docs/KDPA_COMPLIANCE.md) | Kenya Data Protection Act 2019 compliance, consent, and retention policies |
| [docs/ADR/](docs/ADR/) | Architectural Decision Records (ADR-001 through ADR-005) |

---

## 4. Scripts & Commands

- `npm run dev`: Launch local Next.js development server
- `npm run build`: Compile production Next.js bundle
- `npm run start`: Start production server
- `npm run type-check`: Execute strict TypeScript type analysis (`tsc --noEmit`)
- `npm run test:engine`: Run automated unit tests verifying the PRD Section 6.4 cost engine
- `npm run db:push`: Synchronize Prisma schema with the target database
- `npm run db:seed`: Populate database with initial tiers, institutions, and sample chapters
- `npm run db:studio`: Launch Prisma Studio UI for visual database inspection

---

## 5. License & Governance
Developed for the Coastal Universities and Colleges Adventists Students Organization (CUCASO).  
Governed under the CUCASO Constitution and Kenya Data Protection Act, 2019.
