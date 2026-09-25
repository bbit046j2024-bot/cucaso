import { NextResponse } from "next/server";
import { getCurrentRally, updateCurrentRally, createRally, deleteRally } from "@/lib/db";
import { CURRENT_RALLY as FALLBACK_RALLY } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * GET /api/rallies
 * Returns the current/active rally for public and admin consumption.
 * Includes dynamic Event Programme, Venue Access, Fees & Capitation, and Cost Items.
 */
export async function GET() {
  try {
    const rally = await getCurrentRally();
    return NextResponse.json({ success: true, data: rally });
  } catch (error: any) {
    console.error("GET /api/rallies error:", error);
    return NextResponse.json({ success: true, data: FALLBACK_RALLY, fallback: true });
  }
}

/**
 * PUT /api/rallies
 * Updates the current active rally:
 * title, theme, venueName, venueLocation, dates, deadlines, state,
 * programme, venueAccess, feesAndCapitation.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateCurrentRally(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/rallies error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update rally" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rallies
 * Creates a new rally in the database pipeline.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createRally(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rallies error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create rally" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rallies
 * Deletes a rally by ID (or deletes the active rally if no ID is specified).
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }
    const success = await deleteRally(id || undefined);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete rally from database." },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: "Rally deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/rallies error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete rally" },
      { status: 500 }
    );
  }
}

