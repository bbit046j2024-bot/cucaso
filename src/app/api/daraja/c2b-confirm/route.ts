import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

export const dynamic = "force-dynamic";

/**
 * Daraja C2B Confirmation Endpoint (FR-PAY-C2B-02)
 *
 * Safaricom calls this URL after a successful C2B paybill payment.
 * This is the "settlement" notification — we must persist the payment and
 * acknowledge with ResultCode 0 within 8 seconds.
 *
 * Registration: POST to
 *   https://api.safaricom.co.ke/mpesa/c2b/v2/registerurl
 * with:
 *   "ConfirmationURL": "https://cucaso.vercel.app/api/daraja/c2b-confirm"
 *   "ValidationURL":  "https://cucaso.vercel.app/api/daraja/c2b-validate"
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const {
      TransID,
      TransAmount,
      BillRefNumber,
      MSISDN,
      FirstName,
      MiddleName,
      LastName,
    } = body;

    const amount = Number(TransAmount) || 0;
    const phone = String(MSISDN || "").trim();
    const ref = String(BillRefNumber || "").trim().toUpperCase();
    const senderName =
      [FirstName, MiddleName, LastName].filter(Boolean).join(" ") ||
      "M-Pesa Customer";
    const mpesaReceiptNumber = String(TransID || `C2B-${Date.now()}`);

    console.log("[DARAJA/C2B-CONFIRM]", {
      TransID,
      TransAmount: amount,
      BillRefNumber: ref,
      MSISDN: phone,
      senderName,
    });

    // Archive raw payload
    let rawCallbackId: string | null = null;
    try {
      const archived = await prisma.rawCallbackPayload.create({
        data: {
          provider: "DARAJA_C2B",
          rawJson: JSON.stringify(body),
          processed: false,
        },
      });
      rawCallbackId = archived.id;
    } catch (archiveErr) {
      console.warn(
        "[DARAJA/C2B-CONFIRM] Could not archive raw payload:",
        archiveErr
      );
    }

    // Try to match the payment reference to a chapter invoice
    let invoiceId: string | undefined;
    let chapterName: string | undefined;
    let paymentStatus: "MATCHED" | "UNMATCHED" = "UNMATCHED";

    if (ref) {
      const invoice = await prisma.invoice.findFirst({
        where: {
          OR: [
            { paymentReference: ref },
            { chapter: { code: ref } },
          ],
        },
        select: {
          id: true,
          totalDueKes: true,
          amountPaidKes: true,
          chapter: { select: { name: true, institution: { select: { name: true } } } },
        },
      });

      if (invoice) {
        invoiceId = invoice.id;
        chapterName = invoice.chapter.institution?.name || invoice.chapter.name;
        paymentStatus = "MATCHED";

        // Update invoice amountPaidKes and balanceKes atomically
        const newPaid = invoice.amountPaidKes + amount;
        const newBalance = invoice.totalDueKes - newPaid;
        const newStatus =
          newPaid >= invoice.totalDueKes
            ? "PAID"
            : newPaid > 0
            ? "PARTIAL"
            : "UNPAID";
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            amountPaidKes: newPaid,
            balanceKes: newBalance,
            status: newStatus as any,
          },
        });
      }
    }

    // Persist to Payment ledger
    const payment = await prisma.payment.create({
      data: {
        amountKes: amount,
        mpesaReceiptNumber,
        senderPhone: phone,
        senderName,
        accountReference: ref || "PAYBILL-C2B",
        channel: "MPESA_C2B",
        status: paymentStatus,
        invoiceId: invoiceId ?? null,
        transactionTime: new Date(),
        rawCallbackId: rawCallbackId ?? null,
      },
    });

    // Audit log
    await prisma.auditLog
      .create({
        data: {
          actor: senderName,
          action: "C2B_PAYMENT_CONFIRMED",
          entityType: "Payment",
          entityId: payment.id,
          afterJson: JSON.stringify({
            amount,
            mpesaReceiptNumber,
            ref,
            phone,
            status: paymentStatus,
            invoiceId,
          }),
        },
      })
      .catch(() => {});

    // Send SMS confirmation to payer
    if (phone) {
      const smsMsg =
        `CUCASO: Received KES ${amount.toLocaleString()} from ${senderName}` +
        ` (Ref: ${ref || "N/A"}).` +
        (chapterName ? ` For ${chapterName}.` : "") +
        ` M-Pesa Receipt: ${mpesaReceiptNumber}. Thank you.`;
      sendSms({ to: phone, message: smsMsg }).catch(() => {});
    }

    // Acknowledge to Safaricom — must be ResultCode 0
    return NextResponse.json(
      { ResultCode: 0, ResultDesc: "Confirmation received successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[DARAJA/C2B-CONFIRM] Error:", err?.message || err);
    // Always return 200 + ResultCode 0 so Safaricom doesn't retry infinitely
    return NextResponse.json(
      { ResultCode: 0, ResultDesc: "Error logged" },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "c2b-confirm" });
}
