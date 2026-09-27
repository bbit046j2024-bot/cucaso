import { NextResponse } from "next/server";
import { initiateStkPush, normalizePhoneNumber, isValidKenyanPhone, pendingCheckouts } from "@/lib/daraja";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, amount, purpose = "General Support", donorName = "Generous Donor", email } = body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid donation amount (minimum KES 1)." },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required for M-Pesa STK Push." },
        { status: 400 }
      );
    }

    const normPhone = normalizePhoneNumber(phone);
    if (!isValidKenyanPhone(normPhone)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid Kenyan mobile number (e.g. 0712345678 or 254712345678)." },
        { status: 400 }
      );
    }

    // Clean account reference (max 12 alphanumeric characters for Daraja)
    const cleanPurpose = purpose.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
    const accountReference = `DON-${cleanPurpose || "GEN"}`;

    const stkResult = await initiateStkPush({
      phone: normPhone,
      amount: numAmount,
      accountReference,
      transactionDesc: `CUCASO ${purpose}`.slice(0, 13),
    });

    if (!stkResult.success || !stkResult.checkoutRequestId) {
      return NextResponse.json(
        { success: false, error: stkResult.error || "Failed to initiate M-Pesa STK Push prompt." },
        { status: 502 }
      );
    }

    // Store in-memory pending checkout
    pendingCheckouts.set(stkResult.checkoutRequestId, {
      checkoutRequestId: stkResult.checkoutRequestId,
      phone: normPhone,
      amount: numAmount,
      purpose,
      donorName,
      email,
      status: "PENDING",
      createdAt: Date.now(),
    });

    // Also persist initial raw callback tracker in database if available
    try {
      await prisma.rawCallbackPayload.create({
        data: {
          provider: "DARAJA_STK",
          rawJson: JSON.stringify({
            checkoutRequestId: stkResult.checkoutRequestId,
            phone: normPhone,
            amount: numAmount,
            purpose,
            donorName,
            email,
            status: "PENDING",
          }),
          processed: false,
        },
      });
    } catch {
      // Prisma logging fallback if table not yet migrated
    }

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkResult.checkoutRequestId,
      customerMessage:
        stkResult.customerMessage ||
        `An M-Pesa payment prompt has been sent to your phone (${normPhone}). Please enter your M-Pesa PIN to complete.`,
      simulated: Boolean(stkResult.simulated),
    });
  } catch (error: any) {
    console.error("STK Push error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error initiating STK Push" },
      { status: 500 }
    );
  }
}
