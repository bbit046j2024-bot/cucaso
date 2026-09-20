import { NextResponse } from "next/server";
import { getInvoices, getDatabase, saveDatabase } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");
    let invoices = getInvoices();
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
