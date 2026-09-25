import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session.isAuthenticated || !session.userId) {
      return NextResponse.json({
        isLoggedIn: false,
        user: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        chapterId: true,
        totpEnabled: true,
        createdAt: true,
        chapter: {
          select: {
            id: true,
            code: true,
            name: true,
            institution: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      session.destroy();
      return NextResponse.json({
        isLoggedIn: false,
        user: null,
      });
    }

    return NextResponse.json({
      isLoggedIn: true,
      user,
    });
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { isLoggedIn: false, error: "Internal session error" },
      { status: 500 }
    );
  }
}
