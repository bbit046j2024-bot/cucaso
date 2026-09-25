import { NextResponse } from "next/server";
import { getDocumentResources, createDocumentResource, deleteDocumentResource } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/resources
 * Fetches all site documents and resources.
 */
export async function GET() {
  try {
    const docs = await getDocumentResources();
    return NextResponse.json({ success: true, data: docs });
  } catch (error: any) {
    console.error("GET /api/resources error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/resources
 * Creates / registers a new site document or uploaded resource.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createDocumentResource(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/resources error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/resources
 * Deletes a document or resource by ID.
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
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing document ID" }, { status: 400 });
    }
    const success = await deleteDocumentResource(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("DELETE /api/resources error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
