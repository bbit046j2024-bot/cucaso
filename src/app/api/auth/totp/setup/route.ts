import { NextResponse } from "next/server";
import { guardApi, generateTotpSecret } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Begins TOTP enrollment for the signed-in user.
 * Generates a fresh secret, stores it (totpEnabled stays false until the
 * user confirms with a valid code via /api/auth/totp/enable), and returns
 * the shared secret + otpauth URI for QR rendering.
 */
export async function POST() {
  const { session, error } = await guardApi();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, totpEnabled: true },
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

    const { secret, uri } = await generateTotpSecret(user.email);
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: secret, totpEnabled: false },
    });

    return NextResponse.json({ success: true, data: { secret, uri } });
  } catch (err: any) {
    console.error("[AUTH/TOTP/SETUP]", err?.message || err);
    return NextResponse.json(
      { success: false, error: "Failed to start two-factor setup." },
      { status: 500 }
    );
  }
}
