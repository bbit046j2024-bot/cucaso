import { NextResponse } from "next/server";
import { queryStkPushStatus, pendingCheckouts } from "@/lib/daraja";
import { prisma } from "@/lib/prisma";
import { sendSms, SmsTemplates } from "@/lib/sms";
import { sendEmail, EmailTemplates } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");

    if (!checkoutRequestId) {
      return NextResponse.json(
        { success: false, error: "checkoutRequestId parameter is required" },
        { status: 400 }
      );
    }

    const item = pendingCheckouts.get(checkoutRequestId);

    // If simulated checkout in development: auto-succeed after 3 seconds
    if (item && checkoutRequestId.startsWith("ws_CO_SIM_")) {
      const elapsed = Date.now() - item.createdAt;
      if (elapsed > 3500 && item.status === "PENDING") {
        item.status = "SUCCESS";
        item.mpesaReceipt = `QKD${Math.floor(1000000 + Math.random() * 9000000)}`;

        // Trigger simulated SMS and Email
        if (item.phone) {
          sendSms({
            to: item.phone,
            message: SmsTemplates.donationThankYou(
              item.donorName,
              item.amount,
              item.purpose,
              item.mpesaReceipt
            ),
          }).catch(() => {});
        }

        if (item.email) {
          const emailData = EmailTemplates.donationReceipt({
            donorName: item.donorName,
            amountKes: item.amount,
            receiptNumber: item.mpesaReceipt,
            purpose: item.purpose,
            date: new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }),
          });
          sendEmail({
            to: item.email,
            subject: emailData.subject,
            html: emailData.html,
          }).catch(() => {});
        }

        // Record simulated payment into DB
        prisma.payment
          .create({
            data: {
              amountKes: item.amount,
              mpesaReceiptNumber: item.mpesaReceipt,
              senderPhone: item.phone,
              senderName: item.donorName,
              accountReference: `DONATION-${item.purpose.toUpperCase().slice(0, 10)}`,
              channel: "MPESA_STK",
              status: "MATCHED",
              transactionTime: new Date(),
            },
          })
          .catch(() => {});
      }

      return NextResponse.json({
        success: true,
        status: item.status,
        mpesaReceipt: item.mpesaReceipt,
        amount: item.amount,
        donorName: item.donorName,
        purpose: item.purpose,
      });
    }

    // Real Daraja transaction
    if (item && item.status !== "PENDING") {
      return NextResponse.json({
        success: true,
        status: item.status,
        mpesaReceipt: item.mpesaReceipt,
        amount: item.amount,
      });
    }

    // Query Daraja status directly if not resolved yet
    const queryResult = await queryStkPushStatus(checkoutRequestId);

    if (queryResult.resultCode === 0) {
      if (item) item.status = "SUCCESS";
      return NextResponse.json({
        success: true,
        status: "SUCCESS",
        mpesaReceipt: item?.mpesaReceipt || "CONFIRMED",
        amount: item?.amount,
      });
    } else if (queryResult.resultCode === 1032) {
      if (item) item.status = "CANCELLED";
      return NextResponse.json({
        success: true,
        status: "CANCELLED",
        error: "Transaction cancelled by user",
      });
    }

    return NextResponse.json({
      success: true,
      status: item ? item.status : "PENDING",
      error: queryResult.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to query status" },
      { status: 500 }
    );
  }
}
