# CUCASO Platform Security Architecture & ASVS Level 2 Verification

## 1. Compliance Baseline
The CUCASO platform is engineered to comply with the **OWASP Application Security Verification Standard (ASVS) Level 2** and the **Kenya Data Protection Act (KDPA), 2019**.

---

## 2. Authentication & Credential Storage
- **Password Hashing**: Stored using `argon2id` with parameters:
  - Memory cost: 65,536 KiB (64 MB)
  - Time cost: 3 iterations
  - Parallelism: 4 threads
- **Brute-Force & Lockout**:
  - Accounts lock automatically after 5 consecutive failed login attempts.
  - 15-minute cool-off period (`lockedUntil`).
- **Session Security**:
  - Managed via `iron-session` utilizing 256-bit AES-GCM encryption.
  - Cookies configured with `HttpOnly; Secure; SameSite=Strict; Path=/`.
  - Database-backed `Session` table permits instant global revocation on demand.
- **Two-Factor Authentication (2FA)**:
  - RFC 6238 TOTP mandatory for all administrative roles (`SUPER_ADMIN`, `COUNCIL_MEMBER`, `CENTRAL_TREASURER`, `SECRETARY`).
  - Secret keys encrypted in the database; verified using `otplib`.

---

## 3. Insecure Direct Object Reference (IDOR) Protection
- Every API route and server action validates both role authorization and entity ownership:
  - Chapter officers (`CHAPTER_REP`, `CHAPTER_TREASURER`) are strictly confined to data matching their `session.chapterId`.
  - Chapter officers cannot access another chapter's attendee list, internal communications, or capability weights.
  - Council members and Treasury officers have cross-chapter read permissions strictly according to their constitutional mandate.

---

## 4. Payment Gateway Hardening (Daraja C2B)
- **Secret Webhook Path**: Callback endpoints are protected by secret URL tokens:
  `/api/daraja/confirmation?token=${DARAJA_CALLBACK_SECRET}`.
- **Idempotency Guarantee**: Unique index on `mpesaReceiptNumber` in PostgreSQL/MySQL ensures repeat webhook retries cannot double-credit invoices.
- **Payload Ingestion**: Inbound payloads are preserved in `RawCallbackPayload` with timestamp and source IP prior to parsing.

---

## 5. Break-Glass Emergency Recovery Procedure
In the event of total administrator lockout or loss of 2FA device:
1. SSH into the production server.
2. Run the secure emergency CLI generator:
   ```bash
   node scripts/break-glass.js
   ```
3. The script prompts for database credentials, provisions a one-time emergency credential valid for 30 minutes, and logs a critical `BREAK_GLASS_LOGIN` event to the `AuditLog` table.
4. Once restored, the administrator re-configures 2FA and revokes the emergency token.
