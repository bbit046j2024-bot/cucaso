# CUCASO Platform Architecture & Engineering Specification

## 1. System Overview
The **CUCASO Platform** (Coastal Universities and Colleges Adventists Students Organization) serves as the unified digital operations centre and public ministry portal for Seventh-day Adventist tertiary and secondary student chapters across Mombasa, Kilifi, Kwale, Taita Taveta, and the wider Kenyan coastal region.

The platform unites two distinct operational domains:
1. **Public Ministry & Content Portal**: 31 sections from the official website proposal providing mission clarity, institutional directories, event schedules, multimedia hubs, devotional content, and chapter application forms.
2. **Operations & Financial Management Engine**: Based on `CUCASO_Platform_PRD.docx`, providing capability-weighted fee apportionment, Safaricom Daraja M-Pesa C2B reconciliation, Council voting, attendee compliance, and financial sufficiency monitoring.

---

## 2. Tech Stack & Infrastructure
- **Core Framework**: Next.js 14+ (App Router), React 18, TypeScript (Strict Mode).
- **Styling & Design System**: Tailwind CSS, custom CUCASO color tokens:
  - Deep Navy Blue: `#002046`
  - Palm Teal Green: `#006A61`
  - Coastal Amber Gold: `#EB851C`
  - Typography: Plus Jakarta Sans (Headings) and Inter (Body).
- **Database & ORM**: TiDB / MySQL 8.0+ managed via Prisma ORM.
- **Authentication & Security**:
  - `argon2id` password hashing.
  - Signed, encrypted HTTP-only session cookies with `iron-session`.
  - Database-backed session table for instant server-side revocation.
  - RFC 6238 TOTP 2FA required for administrative roles (`SUPER_ADMIN`, `COUNCIL_MEMBER`, `CENTRAL_TREASURER`, `SECRETARY`).
- **Payments**: Safaricom Daraja C2B (Validation & Confirmation webhooks with idempotency and audit trail).
- **Asset Storage**: Cloudinary / S3-compatible cloud storage for media, logos, and payment proofs.

---

## 3. Proposal-to-Architecture Merge Map

| Proposal Section | Feature / Route | Purpose & Implementation |
|---|---|---|
| §1–§4 Background & Mission | `/`, `/about` | Core identity, historical timeline, constitutional objectives. |
| §5–§8 Home & Values | `/`, `/about#values` | Hero with rally countdown, 6 core values (Faith, Fellowship, Service, Unity, Excellence, Evangelism). |
| §9 Events & Rallies | `/events`, `/rallies` | Rallies, retreats, vespers, conventions with countdowns. |
| §10 Institutions Directory | `/institutions` | Interactive directory of member universities, colleges, and polytechnics. |
| §11 Leadership Organogram | `/leadership` | Executive Council, Patron, Chaplaincy, and terms. |
| §12 Media Hub | `/media/photos`, `/media/videos` | Consent-screened photo galleries and curated YouTube devotionals. |
| §13 Spiritual Resources | `/resources/spiritual`, `/resources/prayer` | Sabbath materials, Bible studies, and two-tier prayer requests (public vs private to chaplain). |
| §14–§15 News & Documents | `/news`, `/resources/documents` | Official bulletins, press releases, and tiered document downloads (Public, Members, Leaders). |
| §16–§17 Attendee Reg & Join | `/apply`, `/rallies/[slug]/register` | Chapter onboarding and attendee registration forms. |
| §18–§20 Alumni, Partners, Support | `/alumni`, `/partners`, `/support` | Alumni network registration, sponsorship tiers, and donation instructions. |
| §21 Contact Centre | `/contact` | Department-routed inquiries and prayer hotline. |
| §23–§31 Mobile & Admin CMS | `/portal` | Unified role-based command center with responsive mobile drawer. |

---

## 4. Pure Deterministic Cost Engine (`src/lib/cost-engine.ts`)
The CUCASO cost engine distributes rally budgets across member chapters based on financial capability:
1. **Total Budget**:
   $$\text{Subtotal} = \text{Fixed Costs} + (\text{Per-Head Rate} \times \text{Attendees}) + \text{Vehicle Costs}$$
   $$\text{Total Budget} = \text{round}\left(\text{Subtotal} \times \left(1 + \frac{\text{Contingency}}{100}\right)\right)$$
2. **Capability Allocation**:
   $$\text{Raw Fee}_i = \text{round}\left(\text{Total Budget} \times \frac{w_i}{\sum_{j} w_j}\right)$$
   - *Deterministic Rounding*: Discrepancy ($\Delta$) is assigned to the highest-weight chapter ($w_{\max}$) and recorded in the audit trail.
3. **Cross-Subsidy**:
   $$\text{Cost to Serve}_i = \text{Per-Head Rate} \times \text{Attendees}_i$$
   $$\text{Cross-Subsidy}_i = \text{Final Fee}_i - \text{Cost to Serve}_i$$
   Surfaces how large university chapters subsidize smaller colleges.

---

## 5. Security & Access Control Matrix

| Role | Access Scope | 2FA Required? |
|---|---|:---:|
| **SUPER_ADMIN** | Full system configuration, break-glass, audit logs, user provisioning | Yes |
| **COUNCIL_MEMBER** | Chapter applications queue, voting, tier reclassifications, waivers | Yes |
| **CENTRAL_TREASURER** | Fee engine locks, M-Pesa reconciliation, budget shortfall monitoring | Yes |
| **SECRETARY** | Rally scheduling, venue setup, logistics tallies, documents | Yes |
| **CHAPLAIN** | Private prayer requests, spiritual counseling, dietary logistics | Optional |
| **COMMUNICATION_SEC** | CMS articles, media uploads, news bulletins, social channels | Optional |
| **CHAPTER_REP** | Own chapter roster, attendee registration, invoice view | No |
| **CHAPTER_TREASURER** | Own chapter invoices, payment proof upload, receipt downloads | No |
