import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  getSessionFromRequest,
  ADMIN_ROLES,
  checkAndRecordLoginAttempt,
} from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Input Validation (Zod) ──────────────────────────────────────────────
    const parse = loginSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.errors[0].message },
        { status: 400 }
      );
    }
    const { email, password } = parse.data;

    // ── Find User ────────────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        chapterId: true,
        passwordHash: true,
        totpEnabled: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    });

    // ── Account Lockout Check ─────────────────────────────────────────────────
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      const unlockAt = user.lockedUntil.toISOString();
      return NextResponse.json(
        {
          success: false,
          error: `Account temporarily locked due to multiple failed attempts. Try again after ${new Date(unlockAt).toLocaleTimeString("en-KE", { timeZone: "Africa/Nairobi" })}.`,
          lockedUntil: unlockAt,
        },
        { status: 429 }
      );
    }

    // ── Constant-time password verification (prevents timing attacks) ────────
    // Always run verifyPassword even if user not found, to prevent user enumeration
    const dummyHash =
      "$argon2id$v=19$m=65536,t=3,p=4$dummysalt$dummyhashvaluexxxxxxxxxxxxxxxxxx";
    const isValidPassword = user
      ? await verifyPassword(password, user.passwordHash)
      : await verifyPassword(password, dummyHash).then(() => false);

    if (!user || !isValidPassword || !user.isActive) {
      // Record failed attempt (only if user exists)
      if (user) {
        await checkAndRecordLoginAttempt(user.id, false);
      }
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ── Successful credential check ───────────────────────────────────────────
    await checkAndRecordLoginAttempt(user.id, true);

    const isAdminRole = ADMIN_ROLES.includes(user.role);
    const requiresTwoFactor = isAdminRole && user.totpEnabled;

    // ── Create Iron Session ───────────────────────────────────────────────────
    const res = NextResponse.json({
      success: true,
      requiresTwoFactor,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        chapterId: user.chapterId,
      },
    });

    // Note: iron-session needs req+res to set cookies on the response
    // We store session data and set the cookie via middleware pattern
    // For App Router, we use the response approach
    const { getIronSession } = await import("iron-session");
    const session = await getIronSession<{
      userId: string;
      email: string;
      name: string;
      role: string;
      chapterId?: string;
      requiresTwoFactor: boolean;
      isAuthenticated: boolean;
    }>(req, res, {
      cookieName: "cucaso_session",
      password: process.env.SESSION_SECRET as string,
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
      },
    });

    session.userId = user.id;
    session.email = user.email;
    session.name = user.name;
    session.role = user.role;
    session.chapterId = user.chapterId ?? undefined;
    session.requiresTwoFactor = requiresTwoFactor;
    session.isAuthenticated = !requiresTwoFactor; // Full auth only if 2FA not needed
    await session.save();

    // ── Audit Log ─────────────────────────────────────────────────────────────
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actor: user.email,
        action: "USER_LOGIN",
        entityType: "User",
        entityId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") ?? req.ip,
      },
    });

    return res;
  } catch (error) {
    console.error("[AUTH/LOGIN]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  // Logout
  try {
    const { getIronSession } = await import("iron-session");
    const res = NextResponse.json({ success: true });
    const session = await getIronSession<{ userId?: string; actor?: string }>(
      req,
      res,
      {
        cookieName: "cucaso_session",
        password: process.env.SESSION_SECRET as string,
        cookieOptions: {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          sameSite: "strict",
        },
      }
    );

    if (session.userId) {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          actor: session.actor ?? "unknown",
          action: "USER_LOGOUT",
          entityType: "User",
          entityId: session.userId,
          ipAddress: req.headers.get("x-forwarded-for") ?? req.ip,
        },
      }).catch(() => {}); // Non-blocking
    }

    session.destroy();
    return res;
  } catch {
    return NextResponse.json({ success: true }); // Always succeed on logout
  }
}
