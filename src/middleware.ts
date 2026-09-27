import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/auth";

const SESSION_OPTIONS = {
  cookieName: "cucaso_session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24,
  },
};

/** Roles allowed into the full admin panel */
const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "COUNCIL_MEMBER",
  "CENTRAL_TREASURER",
  "SECRETARY",
  "COMMUNICATIONS_DIRECTOR",
  "OBSERVER",
];

/** Roles allowed into the chapter portal */
const CHAPTER_ROLES = ["CHAPTER_REP", "CHAPTER_TREASURER"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── /portal/admin/** ─────────────────────────────────────────────────────
  if (pathname.startsWith("/portal/admin")) {
    const res = NextResponse.next();
    let session: any;
    try {
      session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);
    } catch {
      return NextResponse.redirect(new URL("/login?redirect=/portal/admin", req.url));
    }

    if (!session?.isAuthenticated) {
      return NextResponse.redirect(new URL("/login?redirect=/portal/admin", req.url));
    }

    if (!ADMIN_ROLES.includes(session.role)) {
      // Chapter reps trying to access admin get redirected to chapter portal
      if (CHAPTER_ROLES.includes(session.role)) {
        return NextResponse.redirect(new URL("/portal/chapter", req.url));
      }
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    return res;
  }

  // ── /portal/chapter/** ───────────────────────────────────────────────────
  if (pathname.startsWith("/portal/chapter")) {
    const res = NextResponse.next();
    let session: any;
    try {
      session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);
    } catch {
      return NextResponse.redirect(new URL("/login?redirect=/portal/chapter", req.url));
    }

    if (!session?.isAuthenticated) {
      return NextResponse.redirect(new URL("/login?redirect=/portal/chapter", req.url));
    }

    // Both admin roles and chapter roles can view the chapter portal
    const allAllowed = [...ADMIN_ROLES, ...CHAPTER_ROLES];
    if (!allAllowed.includes(session.role)) {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/admin/:path*", "/portal/chapter/:path*"],
};
