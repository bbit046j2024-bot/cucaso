import { NextResponse } from "next/server";
import { getPayments, createPayment, matchPayment, syncMpesaPayments, deletePayment, updatePayment } from "@/lib/db";
import { guardApi, apiForbidden } from "@/lib/auth";
import { STAFF_ROLES, CHAPTER_ROLES, TREASURY_ROLES, isChapterRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { session, error } = await guardApi([...STAFF_ROLES, ...CHAPTER_ROLES]);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");
    let chapterId = searchParams.get("chapterId");
    const sync = searchParams.get("sync");

    // Chapter-level users can only ever see their own payments and
    // may not trigger the treasury's M-Pesa reconciliation pass
    let syncResult = null;
    if (isChapterRole(session.role)) {
      chapterId = session.chapterId ?? "__none__";
    } else if (sync === "true") {
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
  const { session, error } = await guardApi([...TREASURY_ROLES, ...CHAPTER_ROLES]);
  if (error) return error;
  try {
    const body = await request.json();
    // A chapter user may only record remittances for their own chapter
    if (isChapterRole(session.role)) {
      if (!session.chapterId) {
        return apiForbidden("Your account is not linked to a chapter.");
      }
      body.chapterId = session.chapterId;
    }
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
  // Reconciliation and payment edits are treasury operations
  const { error } = await guardApi(TREASURY_ROLES);
  if (error) return error;
  try {
    const body = await request.json();
    const { paymentId, invoiceId, ...editFields } = body;

    // Reconcile mode: match payment to invoice
    if (paymentId && invoiceId && Object.keys(editFields).length === 0) {
      const result = await matchPayment(paymentId, invoiceId);
      return NextResponse.json({
        success: true,
        message: "Payment successfully reconciled and matched to invoice",
        data: result
      });
    }

    // Edit mode: update payment fields
    if (paymentId) {
      const updated = await updatePayment(paymentId, editFields);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json(
      { success: false, error: "paymentId is required" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { error } = await guardApi(TREASURY_ROLES);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");
    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "paymentId is required" },
        { status: 400 }
      );
    }
    await deletePayment(paymentId);
    return NextResponse.json({ success: true, message: "Payment deleted and invoice balance reversed." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete payment" },
      { status: 500 }
    );
  }
}
