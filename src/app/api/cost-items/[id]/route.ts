import { NextResponse } from "next/server";
import { updateCostItem, deleteCostItem } from "@/lib/db";

/**
 * PUT /api/cost-items/[id]
 * Updates a cost item by ID.
 * Body: { category?, name?, type?, amount?, quantity?, notes? }
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateCostItem(params.id, {
      category: body.category,
      name: body.name,
      type: body.type,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Cost item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/cost-items/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update cost item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}

/**
 * DELETE /api/cost-items/[id]
 * Deletes a cost item by ID.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ok = await deleteCostItem(params.id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Cost item not found or already deleted" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Cost item deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/cost-items/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete cost item" },
      { status: 500 }
    );
  }
}
