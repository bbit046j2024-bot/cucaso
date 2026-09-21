import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (session.userId) {
      await audit({
        userId: session.userId,
        actor: session.email || session.userId,
        action: "USER_LOGOUT",
        entityType: "User",
        entityId: session.userId,
        ipAddress: request.headers.get("x-forwarded-for") || "local",
      });
    }

    session.destroy();

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    // Invalidate iron-session cookie
    response.cookies.delete("cucaso_session");
    return response;
  } catch (error: any) {
    console.error("POST /api/auth/logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
