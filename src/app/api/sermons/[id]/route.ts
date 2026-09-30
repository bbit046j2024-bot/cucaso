import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApi } from "@/lib/auth";
import { STAFF_WRITE_ROLES } from "@/lib/roles";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sermon = await prisma.sermon.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({
      success: true,
      data: {
        ...sermon,
        thumbnail: sermon.thumbnailUrl || getYouTubeThumbnail(sermon.youtubeUrl),
        videoId: extractYouTubeId(sermon.youtubeUrl),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Sermon not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error } = await guardApi(STAFF_WRITE_ROLES);
  if (error) return error;
  try {
    const body = await request.json();
    const sermon = await prisma.sermon.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.speaker !== undefined && { speaker: body.speaker }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.youtubeUrl !== undefined && { youtubeUrl: body.youtubeUrl }),
        ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl }),
        ...(body.rallyId !== undefined && { rallyId: body.rallyId || null }),
        ...(body.chapterId !== undefined && { chapterId: body.chapterId || null }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.series !== undefined && { series: body.series }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.type !== undefined && { type: body.type }),
      },
    });
    return NextResponse.json({ success: true, data: sermon });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { error } = await guardApi(STAFF_WRITE_ROLES);
  if (error) return error;
  try {
    await prisma.sermon.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
