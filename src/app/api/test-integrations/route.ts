import { NextRequest, NextResponse } from "next/server";
import { sendSms } from "@/lib/sms";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { getDarajaAccessToken, getDarajaBaseUrl, initiateStkPush, normalizePhoneNumber } from "@/lib/daraja";

export const dynamic = "force-dynamic";

/**
 * GET /api/test-integrations
 * Returns current configuration status for all three integrations.
 */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Check Daraja
  let darajaStatus = "unconfigured";
  let darajaError: string | null = null;
  const hasConsumerKey =
    !!process.env.DARAJA_CONSUMER_KEY &&
    process.env.DARAJA_CONSUMER_KEY !== "your_consumer_key_here";

  if (hasConsumerKey) {
    try {
      const token = await getDarajaAccessToken();
      darajaStatus = token ? "connected" : "simulation_mode";
    } catch (e: any) {
      darajaStatus = "error";
      darajaError = e.message;
    }
  } else {
    darajaStatus = "simulation_mode";
  }

  // Check Africa's Talking
  const atApiKey = process.env.AFRICAS_TALKING_API_KEY;
  const atUsername = process.env.AFRICAS_TALKING_USERNAME || "sandbox";
  const atStatus =
    !atApiKey || atApiKey === "atsk_your_africas_talking_api_key"
      ? "unconfigured"
      : atUsername === "sandbox"
      ? "sandbox_ready"
      : "production_ready";

  // Check Resend Email
  const resendKey = process.env.RESEND_API_KEY;
  const emailStatus =
    !resendKey || resendKey.startsWith("re_xxx")
      ? "unconfigured"
      : "configured";

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.DARAJA_ENVIRONMENT || "sandbox",
    appUrl,
    integrations: {
      mpesa_daraja: {
        status: darajaStatus,
        error: darajaError,
        environment: process.env.DARAJA_ENVIRONMENT || "sandbox",
        baseUrl: getDarajaBaseUrl(),
        stkShortcode: process.env.DARAJA_BUSINESS_SHORTCODE || "174379",
        c2bShortcode: process.env.DARAJA_C2B_SHORTCODE || "600997",
        callbackUrls: {
          stkCallback: `${appUrl}/api/daraja/stk-callback?token=***`,
          c2bValidation: `${appUrl}/api/daraja/c2b-validate`,
          c2bConfirmation: `${appUrl}/api/daraja/c2b-confirm`,
        },
        credentialsConfigured: hasConsumerKey,
        hint: hasConsumerKey
          ? "POST /api/daraja/register-c2b to register C2B URLs"
          : "Add DARAJA_CONSUMER_KEY and DARAJA_CONSUMER_SECRET to .env.local",
      },
      africas_talking_sms: {
        status: atStatus,
        username: atUsername,
        sandboxSimulatorUrl: "https://simulator.africastalking.com:10010/",
        hint:
          atUsername === "sandbox"
            ? "Use the AT sandbox simulator to receive test SMS messages"
            : "Production mode — real SMS will be sent",
      },
      resend_email: {
        status: emailStatus,
        from: process.env.EMAIL_FROM || "not configured",
        hint:
          emailStatus === "configured"
            ? "POST /api/test-integrations with {test:'email', to:'your@email.com'} to test"
            : "Add RESEND_API_KEY to .env.local",
      },
    },
  });
}

/**
 * POST /api/test-integrations
 * Tests a specific integration. Body: { test: "email"|"sms"|"stk", to: "...", amount?: number }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { test, to, amount = 1 } = body;

  if (!test || !to) {
    return NextResponse.json(
      { success: false, error: "Provide { test: 'email'|'sms'|'stk', to: 'recipient' }" },
      { status: 400 }
    );
  }

  // ── TEST EMAIL ───────────────────────────────────────────────────────────────
  if (test === "email") {
    if (!to.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const emailContent = EmailTemplates.donationReceipt({
      donorName: "Test Donor",
      amountKes: 100,
      receiptNumber: `TEST-${Date.now()}`,
      purpose: "Integration Test",
      date: new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }),
    });

    const result = await sendEmail({
      to,
      subject: `[TEST] ${emailContent.subject}`,
      html: emailContent.html,
    });

    return NextResponse.json({
      success: result.success,
      test: "email",
      recipient: to,
      messageId: result.messageId,
      simulated: result.simulated,
      error: result.error,
      note: result.simulated
        ? "Simulated — add RESEND_API_KEY to .env.local to send real emails"
        : "Email sent via Resend",
    });
  }

  // ── TEST SMS ─────────────────────────────────────────────────────────────────
  if (test === "sms") {
    const norm = normalizePhoneNumber(to);
    const result = await sendSms({
      to: norm,
      message: `[CUCASO TEST] Integration test SMS sent at ${new Date().toLocaleTimeString("en-KE", { timeZone: "Africa/Nairobi" })}. If you received this, Africa's Talking SMS is working! 🎉`,
    });

    return NextResponse.json({
      success: result.success,
      test: "sms",
      recipient: norm,
      messageId: result.messageId,
      recipientsCount: result.recipientsCount,
      simulated: result.simulated,
      error: result.error,
      note: result.simulated
        ? "Simulated — check the AT sandbox simulator at https://simulator.africastalking.com:10010/"
        : "Real SMS dispatched via Africa's Talking",
    });
  }

  // ── TEST STK PUSH ─────────────────────────────────────────────────────────────
  if (test === "stk") {
    const norm = normalizePhoneNumber(to);
    const numAmount = Math.max(1, Number(amount));

    const result = await initiateStkPush({
      phone: norm,
      amount: numAmount,
      accountReference: "TEST-STK",
      transactionDesc: "CUCASOTestPay",
    });

    return NextResponse.json({
      success: result.success,
      test: "stk_push",
      phone: norm,
      amount: numAmount,
      checkoutRequestId: result.checkoutRequestId,
      customerMessage: result.customerMessage,
      simulated: result.simulated,
      error: result.error,
      note: result.simulated
        ? "Simulated — add DARAJA_CONSUMER_KEY and DARAJA_CONSUMER_SECRET to trigger a real sandbox STK Push"
        : `Real STK Push sent to ${norm}. Check your phone for the M-Pesa PIN prompt.`,
    });
  }

  return NextResponse.json(
    { success: false, error: `Unknown test type: "${test}". Use "email", "sms", or "stk"` },
    { status: 400 }
  );
}
