// CUCASO Transactional Email Service
// Primary: Resend REST API (https://resend.com/)

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Sends an email using Resend REST API (or dev simulator if unconfigured)
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = options.from || process.env.EMAIL_FROM || "CUCASO Giving <onboarding@resend.dev>";
  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  if (recipients.length === 0) {
    return { success: false, error: "No recipient emails provided" };
  }

  // Simulation mode if Resend key is not yet set
  if (!apiKey || apiKey.startsWith("re_xxx") || apiKey === "sandbox") {
    console.log(`[EMAIL SIMULATION to ${recipients.join(", ")}]:\nSubject: ${options.subject}\nFrom: ${fromEmail}`);
    return {
      success: true,
      messageId: `sim_email_${Date.now()}`,
      simulated: true,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      return {
        success: false,
        error: data.message || "Failed to send email via Resend",
      };
    }

    return {
      success: true,
      messageId: data.id,
      simulated: false,
    };
  } catch (err: any) {
    console.error("Email dispatch failed:", err);
    return {
      success: false,
      error: err?.message || "Failed to reach Resend Email API",
    };
  }
}

/**
 * Standard CUCASO Branded Email HTML Shell
 */
function wrapCucasoEmail(title: string, bodyContent: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cucaso.org";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .email-container { max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(10,37,64,0.06); }
    .header { background: linear-gradient(135deg, #0a2540 0%, #061826 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 12px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0 0; color: #38bdf8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .content { padding: 32px 24px; color: #334155; line-height: 1.6; font-size: 14px; }
    .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #00a389; text-decoration: none; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background-color: #f0fdf4; color: #166534; font-weight: 700; font-size: 11px; border: 1px solid #bbf7d0; }
    .receipt-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; }
    .receipt-row:last-child { border-bottom: none; font-weight: 800; font-size: 16px; color: #0a2540; padding-top: 12px; }
    .btn { display: inline-block; background-color: #00a389; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="${appUrl}/favicon.png" alt="CUCASO" width="56" height="56" style="border-radius: 50%; background: #ffffff; padding: 2px;">
      <h1>CUCASO</h1>
      <p>Coastal Universities & Colleges Adventist Students Organization</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;"><strong>One Family. One Mission.</strong></p>
      <p style="margin: 0 0 12px 0;">Mombasa Coast Region, Kenya • Seventh-day Adventist Student Ministries</p>
      <p style="margin: 0;">
        <a href="${appUrl}">Official Website</a> • 
        <a href="${appUrl}/support">Giving</a> • 
        <a href="${appUrl}/contact">Contact Secretariat</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Pre-built Transactional Email Builders
 */
export const EmailTemplates = {
  donationReceipt(params: {
    donorName: string;
    amountKes: number;
    receiptNumber: string;
    purpose: string;
    date: string;
  }): { subject: string; html: string } {
    const subject = `Official Donation Receipt — KES ${params.amountKes.toLocaleString()} (Ref: ${params.receiptNumber})`;

    const html = wrapCucasoEmail(
      subject,
      `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge">Donation Confirmed</span>
        <h2 style="color: #0a2540; margin: 12px 0 4px 0; font-size: 24px; font-weight: 800;">Thank You for Supporting CUCASO</h2>
        <p style="margin: 0; color: #64748b;">Your generous gift enables ministry, tuition support, and student soul-winning across the coast.</p>
      </div>

      <div class="receipt-box">
        <div class="receipt-row">
          <span style="color: #64748b;">Donor Name</span>
          <span style="font-weight: 600; color: #0f172a;">${params.donorName || "Generous Supporter"}</span>
        </div>
        <div class="receipt-row">
          <span style="color: #64748b;">M-Pesa Receipt Number</span>
          <span style="font-family: monospace; font-weight: 700; color: #0284c7;">${params.receiptNumber}</span>
        </div>
        <div class="receipt-row">
          <span style="color: #64748b;">Purpose / Ministry</span>
          <span style="font-weight: 600; color: #0f172a;">${params.purpose}</span>
        </div>
        <div class="receipt-row">
          <span style="color: #64748b;">Date & Time</span>
          <span style="color: #0f172a;">${params.date}</span>
        </div>
        <div class="receipt-row">
          <span style="color: #0a2540;">Total Remitted</span>
          <span style="color: #0a2540;">KES ${params.amountKes.toLocaleString()}</span>
        </div>
      </div>

      <p><em>&ldquo;Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.&rdquo; — 2 Corinthians 9:7</em></p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cucaso.org"}/support" class="btn">View Giving Portal</a>
      </div>
      `
    );

    return { subject, html };
  },

  chapterApproval(params: {
    contactName: string;
    institutionName: string;
    chapterCode: string;
  }): { subject: string; html: string } {
    const subject = `Welcome to CUCASO! Chapter Application Approved for ${params.institutionName}`;

    const html = wrapCucasoEmail(
      subject,
      `
      <h2 style="color: #0a2540; margin-top: 0;">Chapter Application Approved</h2>
      <p>Dear <strong>${params.contactName}</strong>,</p>
      <p>We are delighted to inform you that the CUCASO Central Council has formally approved the application for <strong>${params.institutionName}</strong>.</p>
      
      <div class="receipt-box">
        <div class="receipt-row">
          <span style="color: #64748b;">Assigned Chapter Code</span>
          <span style="font-weight: 800; color: #0a2540; font-family: monospace;">${params.chapterCode}</span>
        </div>
        <div class="receipt-row">
          <span style="color: #64748b;">Status</span>
          <span class="badge">ACTIVE MEMBER</span>
        </div>
      </div>

      <p>You can now log in to the Chapter Portal to register delegates for upcoming coastal rallies, access ministerial resources, and submit reports.</p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cucaso.org"}/login" class="btn">Access Chapter Portal</a>
      </div>
      `
    );

    return { subject, html };
  },
};
