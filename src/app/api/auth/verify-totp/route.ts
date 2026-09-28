import { NextRequest, NextResponse } from "next/server";
import { getSession, verifyTotpToken, apiUnauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Completes a login that requires TOTP 2FA.
 * The login route creates a session with isAuthenticated=false and
 * requiresTwoFactor=true; this endpoint verifies the authenticator code
 * and upgrades the session to fully authenticated.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return apiUnauthorized("No sign-in in progress. Please log in first.");
    }

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

    if (!user?.totpEnabled || !user.totpSecret) {
      return NextResponse.json(
        { success: false, error: "Two-factor authentication is not enabled for this account." },
        { status: 400 }
      );
    }

    const valid = await verifyTotpToken(user.totpSecret, code);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication code. Please try again." },
        { status: 401 }
      );
    }

    session.isAuthenticated = true;
    session.requiresTwoFactor = false;
    await session.save();

    await prisma.auditLog
      .create({
        data: {
          userId: user.id,
          actor: user.email,
          action: "TOTP_VERIFIED",
          entityType: "User",
          entityId: user.id,
          ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
        },
      })
      .catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "[AUTH/VERIFY-TOTP]",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
