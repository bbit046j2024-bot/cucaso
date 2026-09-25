import { NextResponse } from "next/server";
import { getLeadership, createLeadership, updateLeadership, deleteLeadership } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;

  try {
    const items = await getLeadership(category);
    return NextResponse.json({ success: true, data: items ?? [] });
  } catch (error: any) {
    console.error("GET /api/leadership error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch leadership" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.title) {
      return NextResponse.json(
        { success: false, error: "Name and Title are required" },
        { status: 400 }
      );
    }
    const item = await createLeadership(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/leadership error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create council leader" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Leader ID is required" },
        { status: 400 }
      );
    }
    const item = await updateLeadership(id, updates);
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error("PUT /api/leadership error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update council leader" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing leader id" },
        { status: 400 }
      );
    }
    const success = await deleteLeadership(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("DELETE /api/leadership error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete council leader" },
      { status: 500 }
    );
  }
}
