# ADR-004: Daraja C2B Payment Ingestion & Reconciliation Architecture

## Status
Accepted

## Context
In Kenya, student chapters remit rally dues primarily via Safaricom M-Pesa. To ensure financial integrity, CUCASO operates a single central Paybill / Till receiving remittances from all member chapters. The platform must reliably ingest incoming M-Pesa C2B (Customer to Business) transactions, prevent double-crediting, and match payments to open chapter invoices.

## Decision
1. **Validation & Confirmation Webhooks**:
   - The platform exposes `/api/daraja/validation` and `/api/daraja/confirmation`.
   - The validation endpoint verifies the account number format against active chapters (`[ChapterCode]-[RallyCode]`).
   - The confirmation endpoint processes finalized transactions.
2. **Secret Path Token & Idempotency**:
   - Webhooks are secured with a path token (`?secret=${DARAJA_CALLBACK_SECRET}`).
   - Idempotency is strictly enforced by a database unique constraint on `mpesaReceiptNumber`. Duplicate callback submissions from Safaricom return an immediate HTTP 200 without duplicate processing.
3. **Raw Payload Archiving**:
   - All inbound callback payloads are written verbatim into `RawCallbackPayload` with incoming timestamp and IP address prior to normalization or invoice matching.
4. **Auto-Match vs Unmatched Triage Queue**:
   - When the `BillRefNumber` or `accountReference` contains a valid Chapter Code, the payment is automatically linked to the chapter's active rally invoice, updating `amountPaidKes`, `balanceKes`, and flipping status (`PARTIAL` or `PAID`).
   - When payer reference is ambiguous or mistyped by a student, the transaction is flagged as `UNMATCHED` and surfaced to the Central Treasurer in the Unmatched Payments Queue for manual review and reconciliation.
5. **Manual Payment Fallback**:
   - For chapters paying via bank EFT/RTGS or cash at the venue, manual entry with document upload proof is supported, requiring dual-officer audit verification.

## Consequences
- Guarantees zero lost transactions even during network blips or retry storms from Safaricom gateways.
- Provides a clean audit trail from raw telecom payload to bank deposit slip.
