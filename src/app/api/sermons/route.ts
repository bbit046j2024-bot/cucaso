import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApi } from "@/lib/auth";
import { STAFF_WRITE_ROLES } from "@/lib/roles";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const statusParam = searchParams.get("status");
    const status = statusParam === "ALL" ? undefined : (statusParam || "PUBLISHED");
    const rallyId = searchParams.get("rallyId") || undefined;
    const chapterId = searchParams.get("chapterId") || undefined;
    const series = searchParams.get("series") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status: status as any }),
      ...(type && { type: type as any }),
      ...(rallyId && { rallyId }),
      ...(chapterId && { chapterId }),
      ...(series && { series }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { speaker: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
          { series: { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.sermon.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.sermon.count({ where }),
    ]);

    // Enrich with auto thumbnails
    const enriched = items.map((s) => ({
      ...s,
      thumbnail: s.thumbnailUrl || getYouTubeThumbnail(s.youtubeUrl),
      videoId: extractYouTubeId(s.youtubeUrl),
    }));

    return NextResponse.json({ success: true, data: enriched, total, page, limit });
  } catch (error: any) {
    console.error("[GET /api/sermons]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { session, error } = await guardApi(STAFF_WRITE_ROLES);
  if (error) return error;

  try {
    const body = await request.json();
    const { title, speaker, description, youtubeUrl, thumbnailUrl, rallyId,
            chapterId, tags, series, duration, status, type } = body;

    if (!title || !speaker || !youtubeUrl) {
      return NextResponse.json({ success: false, error: "title, speaker, and youtubeUrl are required" }, { status: 400 });
    }

    const sermon = await prisma.sermon.create({
      data: {
        type: type || "SERMON",
        title,
        speaker,
        description: description || null,
        youtubeUrl,
        thumbnailUrl: thumbnailUrl || null,
        rallyId: rallyId || null,
        chapterId: chapterId || null,
        tags: tags || null,
        series: series || null,
        duration: duration || null,
        status: status || "PUBLISHED",
        publishedAt: new Date(),
        createdBy: session?.userId || null,
      },
    });

    return NextResponse.json({ success: true, data: sermon }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/sermons]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
