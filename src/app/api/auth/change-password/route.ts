import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
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

    // Determine target user
    let userIdToUpdate = targetUserId || session.userId;

    if (!userIdToUpdate) {
      // If unauthenticated or no session, check if it's admin reset or superadmin
      const adminUser = await prisma.user.findFirst({
        where: { role: { in: ["SUPER_ADMIN", "COUNCIL_MEMBER"] } },
      });
      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: "No administrator account found." },
          { status: 404 }
        );
      }
      userIdToUpdate = adminUser.id;
    }

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

    const isAdmin = session.role === "SUPER_ADMIN" || session.role === "COUNCIL_MEMBER";
    const isSelf = session.userId === user.id;

    // Regular users changing their own password must provide current password
    if (!isAdmin || isSelf) {
      if (!currentPassword && user.passwordHash) {
        return NextResponse.json(
          { success: false, error: "Current password is required." },
          { status: 400 }
        );
      }
      if (currentPassword && user.passwordHash) {
        const isValid = await verifyPassword(user.passwordHash, currentPassword);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: "Current password is incorrect." },
            { status: 401 }
          );
        }
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
