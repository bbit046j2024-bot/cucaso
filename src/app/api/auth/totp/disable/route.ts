import { NextResponse } from "next/server";
import { guardApi, apiForbidden, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Disables TOTP 2FA. A user may disable their own after confirming their
 * password; a SUPER_ADMIN may disable it for any account.
 */
export async function POST(request: Request) {
  const { session, error } = await guardApi();
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));
    const targetUserId = body?.targetUserId ? String(body.targetUserId) : session.userId;
    const currentPassword = body?.currentPassword ? String(body.currentPassword) : "";

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, name: true, totpEnabled: true, passwordHash: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const isSelf = session.userId === user.id;
    if (!isSelf && session.role !== "SUPER_ADMIN") {
      return apiForbidden("Only a super administrator can disable another user's two-factor authentication.");
    }

    if (isSelf && user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required." },
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

    if (!user.totpEnabled) {
      return NextResponse.json(
        { success: false, error: "Two-factor authentication is not enabled." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: false, totpSecret: null },
    });

    await prisma.auditLog
      .create({
        data: {
          userId: user.id,
          actor: session.name || user.email,
          action: "TOTP_DISABLED",
          entityType: "User",
          entityId: user.id,
        },
      })
      .catch(() => {});

    return NextResponse.json({ success: true, message: "Two-factor authentication disabled." });
  } catch (err: any) {
    console.error("[AUTH/TOTP/DISABLE]", err?.message || err);
    return NextResponse.json(
      { success: false, error: "Failed to disable two-factor authentication." },
      { status: 500 }
    );
  }
}
