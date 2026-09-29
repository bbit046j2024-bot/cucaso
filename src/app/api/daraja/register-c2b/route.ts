import { NextRequest, NextResponse } from "next/server";
import { getDarajaAccessToken, getDarajaBaseUrl } from "@/lib/daraja";

export const dynamic = "force-dynamic";

/**
 * POST /api/daraja/register-c2b
 *
 * Registers the C2B Validation & Confirmation URLs with Safaricom Daraja.
 * Must be called once per environment (sandbox / production) whenever the
 * app URL changes. Requires a valid Daraja OAuth token.
 *
 * Daraja docs: POST https://sandbox.safaricom.co.ke/mpesa/c2b/v2/registerurl
 */
export async function POST(req: NextRequest) {
  try {
    // Allow override via request body, default to env-configured app URL
    const body = await req.json().catch(() => ({}));
    const appUrl = body.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackSecret = process.env.DARAJA_CALLBACK_SECRET || "cucaso_dev_daraja_callback_secret_token_2026";
    const shortcode = process.env.DARAJA_C2B_SHORTCODE || "600997";
    const responseType = body.responseType || "Completed"; // "Completed" or "Cancelled"

    const validationUrl = `${appUrl}/api/daraja/c2b-validate`;
    const confirmationUrl = `${appUrl}/api/daraja/c2b-confirm`;

    let accessToken: string | null = null;
    try {
      accessToken = await getDarajaAccessToken();
    } catch (err: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to get Daraja OAuth token: ${err.message}`,
          hint: "Ensure DARAJA_CONSUMER_KEY and DARAJA_CONSUMER_SECRET are set in .env.local",
        },
        { status: 502 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "DARAJA_CONSUMER_KEY and DARAJA_CONSUMER_SECRET are not configured.",
          hint: "Visit https://developer.safaricom.co.ke/MyApps to get your API credentials, then add them to .env.local",
          wouldRegister: {
            ShortCode: shortcode,
            ResponseType: responseType,
            ConfirmationURL: confirmationUrl,
            ValidationURL: validationUrl,
          },
        },
        { status: 400 }
      );
    }

    const payload = {
      ShortCode: shortcode,
      ResponseType: responseType,
      ConfirmationURL: confirmationUrl,
      ValidationURL: validationUrl,
    };

    console.log("[DARAJA/REGISTER-C2B] Registering URLs:", payload);

    const res = await fetch(`${getDarajaBaseUrl()}/mpesa/c2b/v2/registerurl`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json();
    console.log("[DARAJA/REGISTER-C2B] Response:", data);

    if (data.ResponseCode === "0" || data.ResponseDescription?.toLowerCase().includes("success")) {
      return NextResponse.json({
        success: true,
        message: "C2B URLs registered successfully with Safaricom Daraja.",
        registered: payload,
        darajaResponse: data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: data.errorMessage || data.ResponseDescription || "Registration failed",
        darajaResponse: data,
        attempted: payload,
      },
      { status: 502 }
    );
  } catch (err: any) {
    console.error("[DARAJA/REGISTER-C2B] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error during C2B registration" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/daraja/register-c2b
 * Returns current C2B configuration without triggering registration.
 */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shortcode = process.env.DARAJA_C2B_SHORTCODE || "600997";
  const env = process.env.DARAJA_ENVIRONMENT || "sandbox";
  const hasCredentials = !!(
    process.env.DARAJA_CONSUMER_KEY &&
    process.env.DARAJA_CONSUMER_SECRET &&
    process.env.DARAJA_CONSUMER_KEY !== "your_consumer_key_here"
  );

  return NextResponse.json({
    environment: env,
    shortcode,
    validationUrl: `${appUrl}/api/daraja/c2b-validate`,
    confirmationUrl: `${appUrl}/api/daraja/c2b-confirm`,
    stkCallbackUrl: `${appUrl}/api/daraja/stk-callback?token=${process.env.DARAJA_CALLBACK_SECRET || "***"}`,
    credentialsConfigured: hasCredentials,
    darajaBaseUrl: getDarajaBaseUrl(),
    status: hasCredentials ? "ready" : "missing_credentials",
    hint: hasCredentials
      ? "POST to this endpoint to register C2B URLs with Safaricom"
      : "Set DARAJA_CONSUMER_KEY and DARAJA_CONSUMER_SECRET in .env.local first",
  });
}
