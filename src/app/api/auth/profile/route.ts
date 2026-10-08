import { NextResponse } from "next/server";
import { getSession, apiUnauthorized, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.userId) {
      return apiUnauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        chapterId: true,
        totpEnabled: true,
        avatarUrl: true,
        chapter: {
          select: {
            id: true,
            code: true,
            name: true,
            repName: true,
            repPhone: true,
            repPhoto: true,
            institution: { select: { name: true, location: true } },
          },
        },
      },
    });

    if (!user) return apiUnauthorized();

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("GET /api/auth/profile error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.userId) {
      return apiUnauthorized();
    }

    const body = await request.json();
    const { name, phone, email, currentPassword, avatarUrl } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { chapter: true },
    });

    if (!user) return apiUnauthorized();

    const updates: { name?: string; phone?: string; email?: string; avatarUrl?: string } = {};

    if (name && typeof name === "string") {
      updates.name = name.trim();
    }
    if (phone !== undefined && typeof phone === "string") {
      updates.phone = phone.trim();
    }
    if (avatarUrl !== undefined && typeof avatarUrl === "string") {
      updates.avatarUrl = avatarUrl.trim();
    }

    // Email change handling
    if (email && typeof email === "string") {
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail !== user.email.toLowerCase()) {
        const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_RE.test(trimmedEmail)) {
          return NextResponse.json(
            { success: false, error: "Please enter a valid email address." },
            { status: 400 }
          );
        }

        if (user.passwordHash) {
          if (!currentPassword) {
            return NextResponse.json(
              { success: false, error: "Current password is required to change your login email." },
              { status: 400 }
            );
          }
          const valid = await verifyPassword(currentPassword, user.passwordHash);
          if (!valid) {
            return NextResponse.json(
              { success: false, error: "Current password is incorrect." },
              { status: 401 }
            );
          }
        }

        const conflict = await prisma.user.findFirst({
          where: { email: trimmedEmail, NOT: { id: user.id } },
          select: { id: true },
        });

        if (conflict) {
          return NextResponse.json(
            { success: false, error: "This email address is already registered by another account." },
            { status: 409 }
          );
        }

        updates.email = trimmedEmail;
        session.email = trimmedEmail;
      }
    }

    // Update user in DB
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        chapterId: true,
        avatarUrl: true,
      },
    });

    if (updates.name) {
      session.name = updates.name;
    }
    await session.save();

    // If chapterId is present, update the chapter's representative details
    let updatedChapter = null;
    const targetChapterId = user.chapterId || (body.chapterId as string);

    if (targetChapterId && targetChapterId !== "default-chapter") {
      const chapterUpdates: Record<string, any> = {};
      if (updates.name) chapterUpdates.repName = updates.name;
      if (updates.phone) chapterUpdates.repPhone = updates.phone;
      if (avatarUrl) chapterUpdates.repPhoto = avatarUrl;

      if (Object.keys(chapterUpdates).length > 0) {
        try {
          updatedChapter = await prisma.chapter.update({
            where: { id: targetChapterId },
            data: chapterUpdates,
          });
        } catch (chapterErr) {
          console.warn("[AUTH/PROFILE] Chapter update error:", chapterErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
      chapter: updatedChapter,
    });
  } catch (error: any) {
    console.error("PUT /api/auth/profile error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}
