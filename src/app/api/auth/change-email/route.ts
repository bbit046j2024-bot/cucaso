import { NextResponse } from "next/server";
import { getSession, apiUnauthorized, apiForbidden, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.userId) {
      return apiUnauthorized();
    }

    const body = await request.json();
    const { targetUserId, currentPassword, newEmail } = body;

    const email = typeof newEmail === "string" ? newEmail.trim().toLowerCase() : "";
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid new email address is required." },
        { status: 400 }
      );
    }

    // Determine target user — defaults to the signed-in user
    const userIdToUpdate = targetUserId || session.userId;

    const user = await prisma.user.findUnique({ where: { id: userIdToUpdate } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    const isSelf = session.userId === user.id;

    // Only a super administrator may change another user's email
    if (!isSelf && session.role !== "SUPER_ADMIN") {
      return apiForbidden("Only a super administrator can change another user's email.");
    }

    // Users changing their own email must prove the current password
    if (isSelf && user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required." },
          { status: 400 }
        );
      }
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect." },
          { status: 401 }
        );
      }
    }

    // Reject no-op changes
    if (user.email.toLowerCase() === email) {
      return NextResponse.json(
        { success: false, error: "The new email is identical to the current one." },
        { status: 400 }
      );
    }

    // Enforce uniqueness against any other account
    const clash = await prisma.user.findFirst({
      where: { email, NOT: { id: user.id } },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json(
        { success: false, error: "That email is already in use by another account." },
        { status: 409 }
      );
    }

    const previousEmail = user.email;
    await prisma.user.update({ where: { id: user.id }, data: { email } });

    // Keep the live session in sync when an admin changes their own email
    if (isSelf) {
      session.email = email;
      await session.save();
    }

    await prisma.auditLog
      .create({
        data: {
          actor: session.name || user.name || "Administrator",
          action: "EMAIL_CHANGED",
          entityType: "User",
          entityId: user.id,
          beforeJson: JSON.stringify({ email: previousEmail }),
          afterJson: JSON.stringify({ email, role: user.role, updatedAt: new Date() }),
        },
      })
      .catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Email updated successfully.",
      data: { id: user.id, email },
    });
  } catch (error: any) {
    console.error("Change email error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error changing email" },
      { status: 500 }
    );
  }
}
