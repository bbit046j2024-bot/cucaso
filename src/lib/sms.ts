// CUCASO Africa's Talking SMS Service
// Sandbox Simulator URL: https://simulator.africastalking.com:10010/

import { normalizePhoneNumber } from "./daraja";

interface SendSmsOptions {
  to: string | string[];
  message: string;
  from?: string; // Optional custom Alphanumeric Sender ID (e.g. "CUCASO")
}

interface SmsResponse {
  success: boolean;
  messageId?: string;
  recipientsCount?: number;
  error?: string;
  simulated?: boolean;
}

/**
 * Returns the Africa's Talking Messaging API endpoint based on username
 */
function getAfricasTalkingEndpoint(username: string): string {
  return username === "sandbox"
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";
}

/**
 * Sends an SMS using Africa's Talking
 */
export async function sendSms(options: SendSmsOptions): Promise<SmsResponse> {
  const username = process.env.AFRICAS_TALKING_USERNAME || "sandbox";
  const apiKey = process.env.AFRICAS_TALKING_API_KEY;
  const configuredSenderId = process.env.AFRICAS_TALKING_SENDER_ID;

  const rawRecipients = Array.isArray(options.to) ? options.to : [options.to];
  const recipients = rawRecipients
    .map((p) => {
      const norm = normalizePhoneNumber(p);
      return norm.startsWith("+") ? norm : `+${norm}`;
    })
    .filter(Boolean);

  if (recipients.length === 0) {
    return { success: false, error: "No valid recipient phone numbers provided." };
  }

  // Simulation mode if API key is not yet set or during offline development
  if (!apiKey || apiKey === "atsk_your_africas_talking_api_key" || apiKey === "sandbox") {
    console.log(`[SMS SIMULATION to ${recipients.join(", ")}]:\n${options.message}`);
    return {
      success: true,
      recipientsCount: recipients.length,
      messageId: `sim_sms_${Date.now()}`,
      simulated: true,
    };
  }

  const endpoint = getAfricasTalkingEndpoint(username);

  // Form-urlencoded payload for Africa's Talking
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("to", recipients.join(","));
  params.append("message", options.message);

  // Africa's Talking Sandbox rejects custom Alphanumeric sender IDs
  const senderId = options.from || configuredSenderId;
  if (username !== "sandbox" && senderId) {
    params.append("from", senderId);
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        apiKey: apiKey,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    });

    const data = await res.json();

    const smsMessageData = data?.SMSMessageData;
    if (smsMessageData && Array.isArray(smsMessageData.Recipients)) {
      const successful = smsMessageData.Recipients.filter(
        (r: any) => r.status === "Success" || r.statusCode === 101
      );
      return {
        success: successful.length > 0,
        recipientsCount: successful.length,
        messageId: smsMessageData.Recipients[0]?.messageId,
        simulated: false,
      };
    }

    return {
      success: false,
      error: smsMessageData?.Message || "Failed to dispatch SMS",
    };
  } catch (err: any) {
    console.error("Africa's Talking SMS dispatch failed:", err);
    return {
      success: false,
      error: err?.message || "Failed to reach Africa's Talking SMS API",
    };
  }
}

/**
 * Predefined SMS Notification Builders
 */
export const SmsTemplates = {
  donationThankYou(donorName: string, amountKes: number, purpose: string, mpesaReceipt: string): string {
    const nameStr = donorName && donorName !== "Anonymous" ? ` ${donorName}` : "";
    return `Dear${nameStr}, thank you for your generous donation of KES ${amountKes.toLocaleString()} to CUCASO (${purpose}). Ref: ${mpesaReceipt}. "God loves a cheerful giver." (2 Cor 9:7)`;
  },

  rallyPaymentReceived(chapterName: string, amountKes: number, invoiceNumber: string, balanceKes: number, mpesaReceipt: string): string {
    const balanceStr = balanceKes <= 0 ? "Fully settled!" : `Remaining balance: KES ${balanceKes.toLocaleString()}`;
    return `CUCASO Treasury: KES ${amountKes.toLocaleString()} received for ${chapterName}. Inv: ${invoiceNumber}. Ref: ${mpesaReceipt}. ${balanceStr}. Thank you!`;
  },

  chapterApplicationApproved(contactName: string, institutionName: string): string {
    return `Congratulations ${contactName}! The CUCASO Central Council has approved the chapter application for ${institutionName}. Welcome to the CUCASO family! Visit cucaso.org/login to access your portal.`;
  },

  prayerRequestConfirmation(name: string): string {
    return `Dear ${name}, CUCASO Chaplaincy has received your prayer request. Our intercessory team is lifting you up in prayer before God's throne of grace. (Jeremiah 29:11)`;
  },
};
