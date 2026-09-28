import { NextResponse } from "next/server";
import { getSession, apiUnauthorized, apiForbidden } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.userId) {
      return apiUnauthorized();
    }

    const body = await request.json();
    const { targetUserId, currentPassword, newPassword, confirmPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    // Determine target user — defaults to the signed-in user
    const userIdToUpdate = targetUserId || session.userId;

    // Fetch target user from DB
    const user = await prisma.user.findUnique({
      where: { id: userIdToUpdate },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    const isSelf = session.userId === user.id;

    // Only a super administrator may reset another user's password
    if (!isSelf && session.role !== "SUPER_ADMIN") {
      return apiForbidden("Only a super administrator can reset another user's password.");
    }

    // Users changing their own password must prove the current one
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

    // Hash new password using argon2id
    const newHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Record in audit log
    await prisma.auditLog.create({
      data: {
        actor: session.name || user.name || "Administrator",
        action: "PASSWORD_CHANGED",
        entityType: "User",
        entityId: user.id,
        afterJson: JSON.stringify({ email: user.email, role: user.role, updatedAt: new Date() }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error changing password" },
      { status: 500 }
    );
  }
}
