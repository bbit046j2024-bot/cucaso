import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Daraja C2B Validation Endpoint (FR-PAY-C2B-01)
 *
 * Safaricom calls this URL synchronously before processing a C2B payment.
 * We must reply within 8 seconds with ResultCode 0 (Accept) or 1 (Reject).
 *
 * Registration: POST to
 *   https://api.safaricom.co.ke/mpesa/c2b/v2/registerurl
 * with:
 *   "ValidationURL": "https://cucaso.vercel.app/api/daraja/c2b-validate"
 *   "ConfirmationURL": "https://cucaso.vercel.app/api/daraja/c2b-confirm"
 *
 * Validation logic:
 *  - The account number (BillRefNumber) must match a known chapter payment reference.
 *  - If unknown, we still accept (ResultCode 0) but flag for manual review.
 */
export async function POST(req: NextRequest) {
  // Verify the Daraja callback secret header (Safaricom doesn't send one by
  // default, but some implementations add it via custom headers — kept as a
  // no-op guard that can be wired later).
  try {
    const body = await req.json().catch(() => ({}));

    const {
      TransactionType,
      TransID,
      TransTime,
      TransAmount,
      BusinessShortCode,
      BillRefNumber,
      InvoiceNumber,
      OrgAccountBalance,
      ThirdPartyTransID,
      MSISDN,
      FirstName,
      MiddleName,
      LastName,
    } = body;

    // Log inbound validation request for audit trail
    console.log("[DARAJA/C2B-VALIDATE]", {
      TransID,
      TransAmount,
      BillRefNumber,
      MSISDN,
    });

    // Look up a matching chapter invoice by payment reference
    const ref = String(BillRefNumber || "").trim().toUpperCase();
    let resultCode = 0; // 0 = Accept, 1 = Reject
    let resultDesc = "Accepted";

    if (ref) {
      const invoice = await prisma.invoice.findFirst({
        where: {
          OR: [
            { paymentReference: ref },
            { chapter: { code: ref } },
          ],
        },
        select: { id: true, status: true, totalDueKes: true, amountPaidKes: true },
      });

      if (!invoice) {
        // Unknown reference — still accept but flag; manual reconciliation handles it
        console.warn("[DARAJA/C2B-VALIDATE] Unknown BillRefNumber:", ref);
        // Keep resultCode = 0 to avoid blocking legitimate payments with typos
        resultDesc = "Accepted – reference unrecognised, flagged for reconciliation";
      }
    }

    // Safaricom expects this exact JSON shape
    return NextResponse.json(
      { ResultCode: resultCode, ResultDesc: resultDesc },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[DARAJA/C2B-VALIDATE] Error:", err?.message || err);
    // Return accept on internal error to avoid blocking payments
    return NextResponse.json(
      { ResultCode: 0, ResultDesc: "Accepted" },
      { status: 200 }
    );
  }
}

// Safaricom occasionally sends a GET to verify the endpoint is reachable
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "c2b-validate" });
}
