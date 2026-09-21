/**
 * CUCASO Auth Library
 * - argon2id password hashing (OWASP ASVS Level 2)
 * - iron-session HTTP-only secure cookies
 * - TOTP 2FA for admin roles
 * - Rate limiting / account lockout
 * - Role-based access control
 */

import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

// ─── Session Configuration ──────────────────────────────────────────────────

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  chapterId?: string;
  requiresTwoFactor: boolean; // true if 2FA not yet completed this session
  isAuthenticated: boolean;
}

const SESSION_OPTIONS = {
  cookieName: "cucaso_session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24, // 24 hours
  },
};

/** Roles that require TOTP 2FA */
export const ADMIN_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "COUNCIL_MEMBER",
  "CENTRAL_TREASURER",
  "SECRETARY",
];

/** Roles that are chapter-level (must have chapterId) */
export const CHAPTER_ROLES: UserRole[] = ["CHAPTER_REP", "CHAPTER_TREASURER"];

// ─── Session Helpers ────────────────────────────────────────────────────────

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, new NextResponse(), SESSION_OPTIONS);
}

// ─── Password Hashing ────────────────────────────────────────────────────────

/**
 * Hash a password using argon2id.
 * Falls back to a simple bcrypt-like approach if argon2 native is unavailable.
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const argon2 = await import("argon2");
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
  } catch {
    // Fallback for environments where argon2 native is not compiled
    // This should not happen in production — flag in logs
    console.error("[AUTH] argon2 native unavailable — check build environment");
    throw new Error("Password hashing service unavailable");
  }
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    const argon2 = await import("argon2");
    return argon2.verify(hash, password);
  } catch {
    console.error("[AUTH] argon2 verify failed");
    return false;
  }
}

// ─── TOTP 2FA ───────────────────────────────────────────────────────────────

/**
 * Generate a TOTP secret URI for authenticator app QR code.
 * Uses RFC 6238 (TOTP / SHA-1 / 30-second window / 6 digits).
 */
export async function generateTotpSecret(
  email: string
): Promise<{ secret: string; uri: string }> {
  const { authenticator } = await import("otplib");
  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri(email, "CUCASO Platform", secret);
  return { secret, uri };
}

export async function verifyTotpToken(
  secret: string,
  token: string
): Promise<boolean> {
  try {
    const { authenticator } = await import("otplib");
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

// ─── Account Lockout ─────────────────────────────────────────────────────────

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function checkAndRecordLoginAttempt(
  userId: string,
  success: boolean
): Promise<{ locked: boolean; attemptsLeft: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loginAttempts: true, lockedUntil: true },
  });

  if (!user) return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS };

  // Check if account is currently locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { locked: true, attemptsLeft: 0 };
  }

  if (success) {
    // Reset on successful login
    await prisma.user.update({
      where: { id: userId },
      data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS };
  } else {
    const newAttempts = user.loginAttempts + 1;
    const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;
    await prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: newAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_DURATION_MS)
          : null,
      },
    });
    return {
      locked: shouldLock,
      attemptsLeft: Math.max(0, MAX_LOGIN_ATTEMPTS - newAttempts),
    };
  }
}

// ─── Authorization Guards ────────────────────────────────────────────────────

export type Permission =
  | "edit_public_content"
  | "decide_applications"
  | "assign_tiers"
  | "manage_rallies"
  | "configure_costs"
  | "view_all_attendees"
  | "submit_attendees"
  | "view_own_invoice"
  | "record_payments"
  | "view_funding_dashboard"
  | "view_reports"
  | "manage_users"
  | "view_audit_log"
  | "view_council_data"   // tiers, weights, cross-subsidy
  | "view_chapter_data";  // only own chapter data

const PERMISSION_MATRIX: Record<Permission, UserRole[]> = {
  edit_public_content:    ["SUPER_ADMIN", "SECRETARY"],
  decide_applications:    ["SUPER_ADMIN", "COUNCIL_MEMBER"],
  assign_tiers:           ["SUPER_ADMIN", "COUNCIL_MEMBER"],
  manage_rallies:         ["SUPER_ADMIN", "SECRETARY"],
  configure_costs:        ["SUPER_ADMIN", "CENTRAL_TREASURER"],
  view_all_attendees:     ["SUPER_ADMIN", "COUNCIL_MEMBER", "CENTRAL_TREASURER", "SECRETARY", "CHAPLAIN"],
  submit_attendees:       ["CHAPTER_REP"],
  view_own_invoice:       ["CHAPTER_REP", "CHAPTER_TREASURER"],
  record_payments:        ["SUPER_ADMIN", "CENTRAL_TREASURER"],
  view_funding_dashboard: ["SUPER_ADMIN", "COUNCIL_MEMBER", "CENTRAL_TREASURER", "SECRETARY", "CHAPLAIN"],
  view_reports:           ["SUPER_ADMIN", "COUNCIL_MEMBER", "CENTRAL_TREASURER", "SECRETARY", "CHAPLAIN", "CHAPTER_REP", "CHAPTER_TREASURER"],
  manage_users:           ["SUPER_ADMIN"],
  view_audit_log:         ["SUPER_ADMIN", "COUNCIL_MEMBER", "CENTRAL_TREASURER"],
  view_council_data:      ["SUPER_ADMIN", "COUNCIL_MEMBER", "CENTRAL_TREASURER", "SECRETARY"],
  view_chapter_data:      ["CHAPTER_REP", "CHAPTER_TREASURER"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSION_MATRIX[permission]?.includes(role) ?? false;
}

/**
 * Require a valid, fully-authenticated session.
 * Returns the session or throws/redirects.
 * Use in Server Actions and API Routes.
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session.isAuthenticated) {
    throw new Error("UNAUTHORIZED");
  }
  // If 2FA required but not completed
  if (
    session.role &&
    ADMIN_ROLES.includes(session.role) &&
    session.requiresTwoFactor
  ) {
    throw new Error("2FA_REQUIRED");
  }
  return session as SessionData;
}

/**
 * Require a specific permission.
 */
export async function requirePermission(
  permission: Permission
): Promise<SessionData> {
  const session = await requireAuth();
  if (!hasPermission(session.role, permission)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

/**
 * Chapter-level ownership check.
 * Ensures the authenticated user can only access their own chapter's data.
 */
export async function requireChapterAccess(chapterId: string): Promise<SessionData> {
  const session = await requireAuth();
  // Admin roles can access any chapter
  if (!CHAPTER_ROLES.includes(session.role)) return session;
  // Chapter roles can only access their own chapter
  if (session.chapterId !== chapterId) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
