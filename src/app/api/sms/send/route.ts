import { NextResponse } from "next/server";
import { sendSms } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
