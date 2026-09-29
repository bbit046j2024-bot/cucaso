import { NextResponse } from "next/server";
import { guardApi, verifyTotpToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Completes TOTP enrollment: verifies a 6-digit code against the pending
 * secret stored by /api/auth/totp/setup, then flips totpEnabled to true.
 */
export async function POST(request: Request) {
  const { session, error } = await guardApi();
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));
    const code = String(body?.token ?? "").replace(/\s/g, "");
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: "Enter the 6-digit code from your authenticator app." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, totpEnabled: true, totpSecret: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }
    if (user.totpEnabled) {
      return NextResponse.json(
        { success: false, error: "Two-factor authentication is already enabled." },
        { status: 400 }
      );
    }
    if (!user.totpSecret) {
      return NextResponse.json(
        { success: false, error: "No pending setup found. Start two-factor setup again." },
        { status: 400 }
      );
    }

    const valid = await verifyTotpToken(user.totpSecret, code);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid code. Check your authenticator app and try again." },
        { status: 401 }
      );
    }

    await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } });

    await prisma.auditLog
      .create({
        data: {
          userId: user.id,
          actor: session.name || user.email,
          action: "TOTP_ENABLED",
          entityType: "User",
          entityId: user.id,
        },
      })
      .catch(() => {});

    return NextResponse.json({ success: true, message: "Two-factor authentication enabled." });
  } catch (err: any) {
    console.error("[AUTH/TOTP/ENABLE]", err?.message || err);
    return NextResponse.json(
      { success: false, error: "Failed to enable two-factor authentication." },
      { status: 500 }
    );
  }
}
