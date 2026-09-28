import { NextResponse } from "next/server";
import { sendSms } from "@/lib/sms";
import { guardApi } from "@/lib/auth";
import { STAFF_WRITE_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // SMS relay is staff-only — it spends the org's Africa's Talking credit
  const { error } = await guardApi(STAFF_WRITE_ROLES);
  if (error) return error;
  try {
    const body = await request.json();
    const { to, message, from } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: "Recipient ('to') and 'message' are required" },
        { status: 400 }
      );
    }

    const result = await sendSms({ to, message, from });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error dispatching SMS" },
      { status: 500 }
    );
  }
}
