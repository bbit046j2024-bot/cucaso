import { NextResponse } from "next/server";
import { getPayments, createPayment, matchPayment, syncMpesaPayments } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");
    const chapterId = searchParams.get("chapterId");
    const sync = searchParams.get("sync");

    let syncResult = null;
    if (sync === "true") {
      syncResult = await syncMpesaPayments();
    }

    let payments = await getPayments();

    if (invoiceId) {
      payments = payments.filter((p) => p.invoiceId === invoiceId);
    }
    if (chapterId) {
      payments = payments.filter((p) => 
        p.chapterId === chapterId || 
        (p.reference && p.reference.toLowerCase().includes(chapterId.replace("ch-", "").toLowerCase()))
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: payments,
      syncResult 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payment = await createPayment(body);
    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to record payment" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, invoiceId } = body;
    if (!paymentId || !invoiceId) {
      return NextResponse.json(
        { success: false, error: "paymentId and invoiceId are required for reconciliation" },
        { status: 400 }
      );
    }

    const result = await matchPayment(paymentId, invoiceId);
    return NextResponse.json({ 
      success: true, 
      message: "Payment successfully reconciled and matched to invoice",
      data: result 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reconcile payment" },
      { status: 500 }
    );
  }
}

