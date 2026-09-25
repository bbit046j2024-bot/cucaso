import { NextResponse } from "next/server";
import { 
  getRallyHistory, 
  saveRallyHistory, 
  deleteRallyHistoryItem, 
  addRallyHistoryItem 
} from "@/lib/db";

/**
 * GET /api/rallies/history
 * Returns the persistent rally history and archives from DB
 */
export async function GET() {
  try {
    const history = await getRallyHistory();
    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    console.error("GET /api/rallies/history error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load rally history" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rallies/history
 * Adds a new rally to history, or replaces/saves the history array
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      const saved = await saveRallyHistory(body);
      return NextResponse.json({ success: true, data: saved });
    }
    const updated = await addRallyHistoryItem(body);
    return NextResponse.json({ success: true, data: updated }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rallies/history error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save rally history" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rallies/history
 * Deletes a rally history record by id or title, or clears history
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clear");

    if (clearAll === "true") {
      const cleared = await saveRallyHistory([]);
      return NextResponse.json({ success: true, data: cleared, message: "Rally history cleared" });
    }

    if (!id) {
      let bodyId = "";
      try {
        const body = await request.json();
        bodyId = body.id;
      } catch {}
      if (!bodyId) {
        return NextResponse.json(
          { success: false, error: "Missing rally history ID to delete" },
          { status: 400 }
        );
      }
      const updated = await deleteRallyHistoryItem(bodyId);
      return NextResponse.json({ success: true, data: updated, message: "Item deleted from history" });
    }

    const updated = await deleteRallyHistoryItem(id);
    return NextResponse.json({ success: true, data: updated, message: "Item deleted from history" });
  } catch (error: any) {
    console.error("DELETE /api/rallies/history error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete rally history" },
      { status: 500 }
    );
  }
}
