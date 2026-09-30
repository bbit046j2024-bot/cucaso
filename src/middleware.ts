import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/auth";
import { STAFF_ROLES, CHAPTER_ROLES } from "@/lib/roles";

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

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const res = NextResponse.next();
  let session: SessionData | null = null;
  try {
    session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);
  } catch {
    session = null;
  }

  const redirectToLogin = () => {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(url);
  };

  // Everything under /portal requires a fully-authenticated session
  // (isAuthenticated is false until any required TOTP step is completed)
  if (!session?.isAuthenticated || !session.userId) {
    return redirectToLogin();
  }

  const role = session.role as string;
  const isStaff = (STAFF_ROLES as readonly string[]).includes(role);
  const isChapter = (CHAPTER_ROLES as readonly string[]).includes(role);

  if (!isStaff && !isChapter) {
    return redirectToLogin();
  }

  if (isStaff) {
    const missingMode =
      pathname === "/portal" && !req.nextUrl.searchParams.get("mode");
    if (missingMode) {
      const url = new URL("/portal", req.url);
      url.searchParams.set("mode", "ADMIN");
      return NextResponse.redirect(url);
    }
  }

  if (isChapter) {
    const wantsAdmin =
      pathname.startsWith("/portal/admin") ||
      req.nextUrl.searchParams.get("mode") === "ADMIN";

    // Chapter users always land in (and stay in) their own chapter workspace
    const missingMode =
      pathname === "/portal" && !req.nextUrl.searchParams.get("mode");
    const missingChapter =
      pathname === "/portal" &&
      !req.nextUrl.searchParams.get("chapter") &&
      !!session.chapterId;

    if (wantsAdmin || missingMode || missingChapter) {
      const url = new URL("/portal", req.url);
      url.searchParams.set("mode", "CHAPTER");
      if (session.chapterId) url.searchParams.set("chapter", session.chapterId);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/portal/:path*"],
};
