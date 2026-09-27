// CUCASO Safaricom Daraja M-Pesa STK Push Service
// PRD & Payment Architecture: Lipa Na M-Pesa Online (LNMO)

interface StkPushParams {
  phone: string;
  amount: number;
  accountReference: string; // e.g. "DONATION-GENERAL" or "TUM01-CUR2026"
  transactionDesc?: string;
  callbackUrl?: string;
}

interface StkPushResponse {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  error?: string;
  simulated?: boolean;
}

interface StkQueryResponse {
  success: boolean;
  resultCode?: string | number;
  resultDesc?: string;
  responseCode?: string;
  error?: string;
  simulated?: boolean;
}

export interface PendingCheckout {
  checkoutRequestId: string;
  phone: string;
  amount: number;
  purpose: string;
  donorName: string;
  email?: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  mpesaReceipt?: string;
  createdAt: number;
}

export const pendingCheckouts = new Map<string, PendingCheckout>();

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Normalizes any Kenyan phone number to 254XXXXXXXXX format
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return cleaned;
  }
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `254${cleaned.slice(1)}`;
  }
  if (cleaned.length === 9) {
    return `254${cleaned}`;
  }
  return cleaned;
}

/**
 * Validates whether a phone number is a valid Kenyan mobile number
 */
export function isValidKenyanPhone(phone: string): boolean {
  const norm = normalizePhoneNumber(phone);
  // Safaricom, Airtel, Telkom (starts with 254 7XX or 254 1XX, 12 digits)
  return /^254[17]\d{8}$/.test(norm);
}

/**
 * Formats date into Daraja Timestamp (YYYYMMDDHHmmss)
 */
function getDarajaTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

/**
 * Retrieves base URL for Daraja API based on environment
 */
export function getDarajaBaseUrl(): string {
  const env = process.env.DARAJA_ENVIRONMENT?.toLowerCase() || "sandbox";
  return env === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

/**
 * Obtains an OAuth 2.0 Access Token from Safaricom Daraja with in-memory caching
 */
export async function getDarajaAccessToken(): Promise<string | null> {
  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret || consumerKey === "your_daraja_consumer_key") {
    // Return null to signal simulation mode when credentials not configured yet
    return null;
  }

  // Return cached token if valid for at least another 2 minutes
  if (cachedToken && cachedToken.expiresAt > Date.now() + 120 * 1000) {
    return cachedToken.token;
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const url = `${getDarajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Daraja OAuth failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const expiresIn = parseInt(data.expires_in, 10) || 3599;

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return data.access_token;
}

/**
 * Initiates an M-Pesa STK Push (Lipa Na M-Pesa Online)
 */
export async function initiateStkPush(params: StkPushParams): Promise<StkPushResponse> {
  const normalizedPhone = normalizePhoneNumber(params.phone);
  const amount = Math.round(params.amount);

  if (amount < 1) {
    return { success: false, error: "Minimum donation or payment amount is KES 1" };
  }

  if (!isValidKenyanPhone(normalizedPhone)) {
    return { success: false, error: "Invalid Kenyan phone number format (e.g. 0712345678)" };
  }

  const shortcode = process.env.DARAJA_BUSINESS_SHORTCODE || "174379";
  const passkey =
    process.env.DARAJA_PASSKEY ||
    "bfb279f9aa9bdbaca158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919e07143c01f337e62493fe04c044f24";
  const callbackSecret = process.env.DARAJA_CALLBACK_SECRET || "cucaso_dev_daraja_callback_secret_token_2026";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const callbackUrl =
    params.callbackUrl ||
    `${appUrl}/api/daraja/stk-callback?token=${encodeURIComponent(callbackSecret)}`;

  let accessToken: string | null = null;
  try {
    accessToken = await getDarajaAccessToken();
  } catch (err: any) {
    console.warn("Daraja token acquisition failed, fallback to simulation:", err.message);
  }

  // SIMULATION MODE (if developer credentials aren't live yet)
  if (!accessToken) {
    const mockCheckoutId = `ws_CO_SIM_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    console.log(`[Daraja STK SIMULATION] Prompting KES ${amount} to ${normalizedPhone} (Ref: ${params.accountReference})`);
    return {
      success: true,
      checkoutRequestId: mockCheckoutId,
      merchantRequestId: `MR_${Date.now()}`,
      responseCode: "0",
      responseDescription: "Success. Request accepted for processing (Dev Simulation)",
      customerMessage: `Success! Please enter your M-Pesa PIN on phone ${normalizedPhone}.`,
      simulated: true,
    };
  }

  // LIVE / SANDBOX DARAJA REQUEST
  const timestamp = getDarajaTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: normalizedPhone,
    PartyB: shortcode,
    PhoneNumber: normalizedPhone,
    CallBackURL: callbackUrl,
    AccountReference: params.accountReference.slice(0, 12),
    TransactionDesc: (params.transactionDesc || "CUCASO Giving").slice(0, 13),
  };

  const response = await fetch(`${getDarajaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const resJson = await response.json();

  if (resJson.ResponseCode === "0") {
    return {
      success: true,
      checkoutRequestId: resJson.CheckoutRequestID,
      merchantRequestId: resJson.MerchantRequestID,
      responseCode: resJson.ResponseCode,
      responseDescription: resJson.ResponseDescription,
      customerMessage: resJson.CustomerMessage,
      simulated: false,
    };
  }

  return {
    success: false,
    error: resJson.errorMessage || resJson.ResponseDescription || "Failed to initiate M-Pesa STK Push",
    responseCode: resJson.ResponseCode,
  };
}

/**
 * Queries the status of an ongoing STK Push request
 */
export async function queryStkPushStatus(checkoutRequestId: string): Promise<StkQueryResponse> {
  if (checkoutRequestId.startsWith("ws_CO_SIM_")) {
    return {
      success: true,
      resultCode: 0,
      resultDesc: "The service request has been accepted successfully (Simulation).",
      simulated: true,
    };
  }

  let accessToken: string | null = null;
  try {
    accessToken = await getDarajaAccessToken();
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  if (!accessToken) {
    return { success: false, error: "Daraja credentials unavailable for query" };
  }

  const shortcode = process.env.DARAJA_BUSINESS_SHORTCODE || "174379";
  const passkey = process.env.DARAJA_PASSKEY || "";
  const timestamp = getDarajaTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  const response = await fetch(`${getDarajaBaseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
    cache: "no-store",
  });

  const resJson = await response.json();
  return {
    success: resJson.ResponseCode === "0",
    resultCode: resJson.ResultCode,
    resultDesc: resJson.ResultDesc,
    responseCode: resJson.ResponseCode,
    error: resJson.errorMessage,
  };
}
