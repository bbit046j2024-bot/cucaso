import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function mapPost(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary ?? undefined,
    content: p.contentHtml,
    contentHtml: p.contentHtml,
    category: p.category,
    featuredImageUrl: p.featuredImageUrl ?? undefined,
    altText: p.altText ?? undefined,
    status: p.status,
    author: p.authorUserId || "CUCASO Secretariat",
    publishedAt: p.publishedAt
      ? (p.publishedAt instanceof Date
          ? p.publishedAt.toISOString().split("T")[0]
          : String(p.publishedAt).split("T")[0])
      : undefined,
    createdAt: p.createdAt
      ? (p.createdAt instanceof Date
          ? p.createdAt.toISOString().split("T")[0]
          : String(p.createdAt).split("T")[0])
      : undefined,
    readTime: "3 min read",
  };
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.cmsPost.findUnique({
      where: { slug: params.slug },
    });
    if (!post || post.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: mapPost(post) });
  } catch (error: any) {
    console.error("[GET /api/news/[slug]]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}