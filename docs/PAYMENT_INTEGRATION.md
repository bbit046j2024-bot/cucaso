# Safaricom Daraja M-Pesa C2B Integration Guide

## 1. Overview
CUCASO integrates with the **Safaricom Daraja API** using Customer to Business (C2B) URLs. Member chapters remit rally fees via Paybill, which calls CUCASO webhooks to credit chapter invoices in real time.

---

## 2. API Endpoints
- **Validation URL**: `https://cucaso.org/api/daraja/validation?token=${DARAJA_CALLBACK_SECRET}`
  - Validates that the account number follows the pattern `[ChapterCode]-[RallyCode]`.
  - Rejects malformed account references early to prevent misplaced funds.
- **Confirmation URL**: `https://cucaso.org/api/daraja/confirmation?token=${DARAJA_CALLBACK_SECRET}`
  - Receives completed transaction notifications from Safaricom.
  - Automatically records the payment and reconciles the invoice balance.

---

## 3. Configuration & Environment Variables
In `.env` or `.env.local`:
```env
DARAJA_CONSUMER_KEY="your_consumer_key"
DARAJA_CONSUMER_SECRET="your_consumer_secret"
DARAJA_PASSKEY="your_passkey"
DARAJA_SHORTCODE="your_paybill_number"
DARAJA_CALLBACK_SECRET="cryptographic_random_token_32_chars"
DARAJA_ENVIRONMENT="sandbox" # or "production"
```

---

## 4. Sandbox Testing Procedure
1. Register URLs with Daraja Test Portal:
   ```bash
   node scripts/register-daraja-urls.js
   ```
2. Simulate a C2B transaction using the Safaricom Simulator or cURL:
   ```bash
   curl -X POST https://cucaso.org/api/daraja/confirmation?token=test_token \
     -H "Content-Type: application/json" \
     -d '{
       "TransactionType": "Pay Bill",
       "TransID": "QDF728XN1P",
       "TransTime": "20260921120000",
       "TransAmount": "50000.00",
       "BusinessShortCode": "600999",
       "BillRefNumber": "TUM-01-RAL-2026",
       "MSISDN": "254712345678",
       "FirstName": "John",
       "LastName": "Mwangi"
     }'
   ```
3. Verify in CUCASO portal:
   - Check payment appears in `/portal` under **Payment Ledger**.
   - Check TUM Chapter invoice shows KES 50,000 paid.
