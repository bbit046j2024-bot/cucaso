import { NextResponse } from "next/server";
import { getInvoices, upsertChapterInvoice } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");
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
  try {
    const body = await request.json();
    const invoice = await upsertChapterInvoice(body);
    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create or update invoice" },
      { status: 500 }
    );
  }
}

