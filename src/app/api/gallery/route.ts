import { NextResponse } from "next/server";
import { getGalleryItems, createGalleryItem, deleteGalleryItem } from "@/lib/db";
import { GALLERY_ITEMS as DEFAULT_ITEMS } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;

  try {
    const dbItems = await getGalleryItems(category);
    // Return DB items (even if empty — empty means admin cleared the gallery intentionally)
    return NextResponse.json({ success: true, data: dbItems ?? [] });
  } catch (error: any) {
    // DB is unreachable — fall back to static seed data so the site still renders
    const filteredDefaults =
      category && category !== "All"
        ? DEFAULT_ITEMS.filter((i) => i.category === category)
        : DEFAULT_ITEMS;
    return NextResponse.json(
      { success: true, data: filteredDefaults, fallback: true },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.imageUrl) {
      return NextResponse.json(
        { success: false, error: "Title and Image are required" },
        { status: 400 }
      );
    }
    const item = await createGalleryItem(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create gallery item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }
    const deleted = await deleteGalleryItem(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
