import { NextResponse } from "next/server";
import { getCostItems, createCostItem, resetCostItems } from "@/lib/db";

/**
 * GET /api/cost-items
 * Returns all cost items for the active rally.
 * Optional query: ?rallyId=xxx
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rallyId = searchParams.get("rallyId") || undefined;
    const items = await getCostItems(rallyId);
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error("GET /api/cost-items error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch cost items" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cost-items
 * Creates a new cost item for the active rally, or resets to standard template if action === "reset".
 * Body: { category, name, type, amount, quantity?, notes?, rallyId? } OR { action: "reset", rallyId? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if reset action requested
    if (body.action === "reset") {
      const items = await resetCostItems(body.rallyId);
      return NextResponse.json({ success: true, data: items, message: "Standard budget template loaded" });
    }

    if (!body.name || !body.type || body.amount === undefined || !body.category) {
      return NextResponse.json(
        { success: false, error: "name, type, category, and amount are required" },
        { status: 400 }
      );
    }


    const validTypes = ["FIXED", "PER_HEAD", "PER_VEHICLE"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { success: false, error: `type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const created = await createCostItem({
      rallyId: body.rallyId,
      category: body.category,
      name: body.name,
      type: body.type,
      amount: Number(body.amount),
      quantity: body.quantity ? Number(body.quantity) : 1,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/cost-items error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create cost item" },
      { status: 500 }
    );
  }
}
