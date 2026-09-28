import { NextResponse } from "next/server";
import { getInvoices, upsertChapterInvoice, deleteInvoice, updateInvoice, clearRallyInvoices } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { STAFF_ROLES, CHAPTER_ROLES, TREASURY_ROLES, isChapterRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { session, error } = await guardApi([...STAFF_ROLES, ...CHAPTER_ROLES]);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    let chapterId = searchParams.get("chapterId");
    // Chapter-level users can only ever see their own invoices
    if (isChapterRole(session.role)) {
      chapterId = session.chapterId ?? "__none__";
    }
    let invoices = await getInvoices();
    if (chapterId) {
      invoices = invoices.filter((i) => i.chapterId === chapterId);
    }
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await guardApi(TREASURY_ROLES);
  if (error) return error;
  try {
    const body = await request.json();

    // Special action: clear all invoices after a rally
    if (body.action === "clear_all") {
      const result = await clearRallyInvoices();
      return NextResponse.json({ success: true, ...result });
    }

    const invoice = await upsertChapterInvoice(body);
    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create or update invoice" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { error } = await guardApi(TREASURY_ROLES);
  if (error) return error;
  try {
    const body = await request.json();
    const { invoiceId, ...fields } = body;
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "invoiceId is required" },
        { status: 400 }
      );
    }
    const updated = await updateInvoice(invoiceId, fields);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { error } = await guardApi(TREASURY_ROLES);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "invoiceId is required" },
        { status: 400 }
      );
    }
    await deleteInvoice(invoiceId);
    return NextResponse.json({ success: true, message: "Invoice deleted. Linked payments unmatched." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
