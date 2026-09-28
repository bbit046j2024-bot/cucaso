import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms, SmsTemplates } from "@/lib/sms";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { pendingCheckouts } from "@/lib/daraja";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const expectedSecret =
      process.env.DARAJA_CALLBACK_SECRET ||
      (process.env.NODE_ENV !== "production"
        ? "cucaso_dev_daraja_callback_secret_token_2026"
        : undefined);

    // Always require the shared secret — a missing token must not skip validation
    if (!expectedSecret || token !== expectedSecret) {
      console.warn("[Daraja Webhook] Missing or invalid secret token");
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    console.log("[Daraja STK Callback Received]:", JSON.stringify(payload));

    // Archive raw payload
    let rawCallbackId: string | null = null;
    try {
      const archived = await prisma.rawCallbackPayload.create({
        data: {
          provider: "DARAJA_STK",
          rawJson: JSON.stringify(payload),
          processed: true,
        },
      });
      rawCallbackId = archived.id;
    } catch (e) {
      console.warn("Could not archive raw payload to database:", e);
    }

    const stkCallback = payload?.Body?.stkCallback;
    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted without body" });
    }

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc || "";

    const existingCheckout = pendingCheckouts.get(checkoutRequestId);

    // If User Cancelled (ResultCode: 1032) or Timeout (1037) or other failure
    if (resultCode !== 0) {
      console.log(`[Daraja STK Push Failed/Cancelled] Code: ${resultCode}, Desc: ${resultDesc}`);
      if (existingCheckout) {
        existingCheckout.status = resultCode === 1032 ? "CANCELLED" : "FAILED";
      }
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Handled failure status" });
    }

    // Success (ResultCode === 0) -> Parse Items
    const items = stkCallback.CallbackMetadata?.Item || [];
    const getItem = (name: string) => items.find((i: any) => i.Name === name)?.Value;

    const amount = Number(getItem("Amount")) || existingCheckout?.amount || 0;
    const mpesaReceiptNumber = String(getItem("MpesaReceiptNumber") || `MP${Date.now()}`);
    const transactionDate = String(getItem("TransactionDate") || new Date().toISOString());
    const phoneNumber = String(getItem("PhoneNumber") || existingCheckout?.phone || "");

    const purpose = existingCheckout?.purpose || "General Support";
    const donorName = existingCheckout?.donorName || "Generous Supporter";
    const donorEmail = existingCheckout?.email;

    // Update in-memory tracker
    if (existingCheckout) {
      existingCheckout.status = "SUCCESS";
      existingCheckout.mpesaReceipt = mpesaReceiptNumber;
    }

    // Record into database Payment ledger
    try {
      await prisma.payment.create({
        data: {
          amountKes: amount,
          mpesaReceiptNumber: mpesaReceiptNumber,
          senderPhone: phoneNumber,
          senderName: donorName,
          accountReference: `DONATION-${purpose.toUpperCase()}`,
          channel: "MPESA_STK",
          status: "MATCHED",
          transactionTime: new Date(),
          rawCallbackId: rawCallbackId,
        },
      });

      await prisma.auditLog.create({
        data: {
          actor: donorName,
          action: "STK_DONATION_RECEIVED",
          entityType: "Payment",
          afterJson: JSON.stringify({ amount, mpesaReceiptNumber, purpose, phone: phoneNumber }),
        },
      });
    } catch (dbErr) {
      console.error("Database payment creation error:", dbErr);
    }

    // Dispatch SMS confirmation via Africa's Talking
    if (phoneNumber) {
      const smsMessage = SmsTemplates.donationThankYou(donorName, amount, purpose, mpesaReceiptNumber);
      sendSms({
        to: phoneNumber,
        message: smsMessage,
      }).catch((err) => console.error("SMS dispatch error:", err));
    }

    // Dispatch Email official receipt via Resend
    if (donorEmail && donorEmail.includes("@")) {
      const emailContent = EmailTemplates.donationReceipt({
        donorName,
        amountKes: amount,
        receiptNumber: mpesaReceiptNumber,
        purpose,
        date: new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }),
      });

      sendEmail({
        to: donorEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      }).catch((err) => console.error("Email dispatch error:", err));
    }

    // Acknowledge receipt to Safaricom Daraja
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Confirmation processed successfully" });
  } catch (error: any) {
    console.error("Daraja callback handler exception:", error);
    // Safaricom expects a 200 OK with ResultCode: 0 even on application error
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Error logged" });
  }
}
