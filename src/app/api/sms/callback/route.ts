import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Africa's Talking SMS Delivery Report (DLR) Webhook
 * Set URL in Africa's Talking Dashboard -> SMS -> SMS Callback URLs -> Delivery Reports:
 * https://www.cucaso.org/api/sms/callback
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let data: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });
    } else {
      data = await request.json();
    }

    const { id, status, phoneNumber, networkCode, failureReason, retryCount } = data;

    console.log(
      `[SMS DLR CALLBACK] Message: ${id} | To: ${phoneNumber} | Status: ${status} | Network: ${networkCode} | Reason: ${failureReason || "N/A"}`
    );

    // If Safaricom/Airtel blocked due to blacklist/promotional filter
    if (failureReason === "UserInBlacklist" || failureReason === "DeliveryFailure") {
      console.warn(
        `[SMS BLOCKED] Recipient ${phoneNumber} has promotional SMS blocked or DND enabled by Safaricom.`
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("[SMS DLR CALLBACK ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
