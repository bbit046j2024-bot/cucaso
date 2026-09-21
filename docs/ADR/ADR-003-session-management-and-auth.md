# ADR-003: Session Management, Argon2id & Admin 2FA

## Status
Accepted

## Context
The CUCASO platform handles financial ledgers, sensitive attendee information (including minors under 18), and executive council voting. It requires robust authentication that adheres to OWASP ASVS Level 2 guidelines without introducing excessive external microservice complexity or vendor lock-in.

## Decision
1. **Password Hashing**:
   - `argon2id` via the `argon2` npm package is used for all user credentials with OWASP-recommended parameters (`memoryCost: 65536` [64 MB], `timeCost: 3`, `parallelism: 4`).
2. **Stateless Encrypted Cookie + Database Revocation (Hybrid iron-session)**:
   - Client sessions are managed using `iron-session` with 256-bit AES-GCM encryption in an HTTP-only, `SameSite=Strict`, `Secure` cookie.
   - To support instantaneous server-side session invalidation (e.g. upon role change, password reset, or officer handover), an entry is persisted in the database `Session` table matching the session ID. Middleware cross-references active database validity.
3. **Mandatory TOTP 2FA for Administrative Roles**:
   - Administrative roles (`SUPER_ADMIN`, `COUNCIL_MEMBER`, `CENTRAL_TREASURER`, `SECRETARY`) are cryptographically required to register and verify an RFC 6238 TOTP authenticator (Google Authenticator, Microsoft Authenticator) before accessing portal administrative views.
4. **Brute Force Lockout**:
   - 5 consecutive failed login attempts trigger a 15-minute account lockout (`lockedUntil`), preventing credential stuffing attacks on administrative accounts.
5. **Role-Based Access Control & IDOR Guard**:
   - Routes and API handlers enforce role checks and IDOR checks. Chapter Representatives and Chapter Treasurers can strictly query and mutate records belonging to their assigned `chapterId`.

## Consequences
- Protects administrative credentials against GPU-accelerated dictionary attacks.
- Enables instant lockout and revocation of compromised accounts.
- Zero external identity provider billing costs (eliminating dependency on proprietary auth SaaS).
