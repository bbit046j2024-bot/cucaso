import { NextResponse } from "next/server";
import { getNewsPosts, createNewsPost, updateNewsPost, deleteNewsPost } from "@/lib/db";

/**
 * GET /api/news
 * Fetches all news articles and announcements.
 */
export async function GET() {
  try {
    const news = await getNewsPosts();
    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    console.error("GET /api/news error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/news
 * Creates a new news article or announcement.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createNewsPost(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/news error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/news
 * Updates an existing news article.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing news ID" }, { status: 400 });
    }
    const updated = await updateNewsPost(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/news error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/news
 * Deletes a news article by ID.
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
      return NextResponse.json({ success: false, error: "Missing news ID" }, { status: 400 });
    }
    const success = await deleteNewsPost(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("DELETE /api/news error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
