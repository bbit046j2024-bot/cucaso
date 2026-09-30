/**
 * printHtml — Opens a hidden window, renders styled HTML into it, and triggers print.
 * This avoids the blank-page issue caused by window.print() on dark-themed React pages
 * where browsers strip background colours and navigation elements clutter the output.
 *
 * @param html   Full inner-body HTML string to print
 * @param title  Window/document title (appears in the print header)
 */
export function printHtml(html: string, title = "CUCASO Document") {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    // Popup blocked — fall back gracefully
    alert("Please allow pop-ups for this site to print/save as PDF.");
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    /* ── Reset ─────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      color: #1e293b;
      background: #fff;
      padding: 32px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 12mm 14mm; size: A4; }
    }

    /* ── Utility classes used by the templates ── */
    .text-xs    { font-size: 11px; }
    .text-sm    { font-size: 12px; }
    .text-base  { font-size: 14px; }
    .text-lg    { font-size: 16px; }
    .text-xl    { font-size: 20px; }
    .text-2xl   { font-size: 24px; }
    .font-bold  { font-weight: 700; }
    .font-black { font-weight: 900; }
    .uppercase  { text-transform: uppercase; }
    .tracking-wider { letter-spacing: 0.06em; }

    /* Pass card dark theme */
    .pass-card {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%);
      color: #f8fafc;
      border-radius: 20px;
      padding: 32px;
      max-width: 720px;
      margin: 0 auto;
      border: 2px dashed #14b8a6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .pass-card .label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #94a3b8;
    }
    .pass-card .value { color: #f1f5f9; font-weight: 600; }
    .pass-card .value-lg { color: #ffffff; font-weight: 900; font-size: 22px; }
    .pass-card .divider { border-top: 1px solid rgba(255,255,255,0.12); margin: 16px 0; }
    .pass-card .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .pass-card .badge { background: #10b981; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; letter-spacing: 0.06em; text-transform: uppercase; }
    .pass-card .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .pass-card .footer-row { display: flex; justify-content: space-between; font-size: 10px; color: #64748b; padding-top: 16px; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.12); }
    .pass-card .institution { font-weight: 900; font-size: 20px; color: #ffffff; }
    .pass-card .chapter    { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .pass-card .official   { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #fbbf24; margin-bottom: 2px; }

    /* Invoice / document card */
    .doc-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 40px;
      max-width: 760px;
      margin: 0 auto;
    }
    .doc-card h1 { font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 4px; }
    .doc-card .subtitle { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.07em; margin-bottom: 20px; }
    .doc-card table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
    .doc-card table th { text-align: left; padding: 8px 12px; background: #f8fafc; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.06em; border-bottom: 2px solid #e2e8f0; }
    .doc-card table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .doc-card .kv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .doc-card .kv-item .key { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .doc-card .kv-item .val { font-size: 13px; font-weight: 700; color: #0f172a; }
    .doc-card .total-row { background: #f8fafc; font-weight: 900; font-size: 14px; }
    .doc-card .paid-row td { color: #059669; }
    .doc-card .balance-row td { color: #92400e; font-weight: 900; }
    .doc-card .watermark { text-align: center; margin-top: 32px; font-size: 10px; color: #cbd5e1; }
    .doc-card .header-logo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 2px solid #0f172a; padding-bottom: 16px; }
    .doc-card .org-name { font-size: 16px; font-weight: 900; color: #0f172a; }
    .doc-card .org-sub  { font-size: 10px; color: #64748b; }

    /* Highlight box */
    .highlight-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 16px; margin: 16px 0; font-size: 12px; color: #14532d; }
    .highlight-box strong { font-weight: 800; }
    .amber-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin: 16px 0; font-size: 12px; color: #78350f; }
  </style>
</head>
<body>
  ${html}
  <script>
    window.addEventListener("load", function() {
      setTimeout(function() { window.print(); }, 200);
    });
  <\/script>
</body>
</html>`);
  win.document.close();
}

/**
 * Builds and prints a CUCASO Delegate Rally Pass.
 */
export function printRallyPass(data: {
  institutionName: string;
  chapterName: string;
  logoUrl?: string | null;
  fullName: string;
  role: string;
  department?: string | null;
  status: string;
  admissionOrIdNumber: string;
  rallyTitle: string;
  rallyDates: string;
  venueName: string;
  venueLocation: string;
  refId: string;
}) {
  const logoHtml = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="Logo" style="width:48px;height:48px;object-fit:cover;border-radius:10px;" />`
    : `<div style="width:48px;height:48px;background:#14b8a6;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:14px;">SDA</div>`;

  const html = `
<div class="pass-card">
  <div class="header">
    <div style="display:flex;align-items:center;gap:14px;">
      ${logoHtml}
      <div>
        <div class="official">Official Rally Pass</div>
        <div class="institution">${data.institutionName}</div>
        <div class="chapter">${data.chapterName}</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div class="badge">${data.status}</div>
      <div style="font-size:10px;color:#64748b;margin-top:6px;font-family:monospace;">${data.admissionOrIdNumber}</div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="grid2">
    <div>
      <div class="label">Delegate Name</div>
      <div class="value-lg">${data.fullName}</div>
    </div>
    <div>
      <div class="label">Role / Faculty</div>
      <div class="value">${data.role} • ${data.department || "General"}</div>
    </div>
    <div>
      <div class="label">Rally Dates</div>
      <div class="value">📅 ${data.rallyDates}</div>
    </div>
    <div>
      <div class="label">Venue</div>
      <div class="value">📍 ${data.venueName}, ${data.venueLocation}</div>
    </div>
  </div>

  <div class="footer-row">
    <span>Source: Self-Registered via Institutional Link</span>
    <span style="font-family:monospace;">Ref: ${data.refId}</span>
  </div>
</div>
<p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:20px;">
  CUCASO — Coastal Universities &amp; Colleges Adventist Students Organization
</p>`;

  printHtml(html, `CUCASO Rally Pass — ${data.fullName}`);
}

/**
 * Builds and prints a CUCASO Chapter Invoice.
 */
export function printInvoice(data: {
  invoiceNumber: string;
  institutionName: string;
  chapterCode: string;
  paymentReference: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: string;
  rallyTitle?: string;
}) {
  const fmt = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
  const pct = Math.min(100, Math.round(((data.amountPaid || 0) / (data.amountDue || 1)) * 100));
  const statusColor = data.status === "PAID" ? "#059669" : data.amountPaid > 0 ? "#2563eb" : "#d97706";

  const html = `
<div class="doc-card">
  <div class="header-logo">
    <div>
      <div class="org-name">CUCASO</div>
      <div class="org-sub">Coastal Universities &amp; Colleges Adventist Students Organization</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:700;">Official Invoice</div>
      <div style="font-size:20px;font-weight:900;color:#0f172a;">${data.invoiceNumber}</div>
      <div style="display:inline-block;padding:3px 12px;border-radius:999px;font-size:11px;font-weight:800;margin-top:4px;background:${statusColor}22;color:${statusColor};">${data.status}</div>
    </div>
  </div>

  <div class="kv-grid">
    <div class="kv-item">
      <div class="key">Billed Institution</div>
      <div class="val">${data.institutionName}</div>
    </div>
    <div class="kv-item">
      <div class="key">Chapter Code</div>
      <div class="val">${data.chapterCode}</div>
    </div>
    <div class="kv-item">
      <div class="key">Payment Reference (M-Pesa Account No.)</div>
      <div class="val" style="color:#0d9488;font-family:monospace;font-size:15px;">${data.paymentReference}</div>
    </div>
    <div class="kv-item">
      <div class="key">Due Date</div>
      <div class="val">${data.dueDate}</div>
    </div>
    ${data.rallyTitle ? `<div class="kv-item" style="grid-column:1/-1;">
      <div class="key">Rally / Event</div>
      <div class="val">${data.rallyTitle}</div>
    </div>` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right;">Amount (KES)</th>
      </tr>
    </thead>
    <tbody>
      <tr class="total-row">
        <td>Total Capability Fee</td>
        <td style="text-align:right;font-weight:900;">${fmt(data.amountDue)}</td>
      </tr>
      <tr class="paid-row">
        <td>Remitted &amp; Reconciled</td>
        <td style="text-align:right;">- ${fmt(data.amountPaid)}</td>
      </tr>
      <tr class="balance-row">
        <td><strong>Outstanding Balance</strong></td>
        <td style="text-align:right;"><strong>${fmt(data.balance)}</strong></td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top:16px;">
    <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:6px;">
      <span>Payment Progress</span><span>${pct}% Settled</span>
    </div>
    <div style="width:100%;height:8px;background:#f1f5f9;border-radius:999px;overflow:hidden;">
      <div style="height:100%;width:${pct}%;background:#059669;border-radius:999px;"></div>
    </div>
  </div>

  <div class="highlight-box" style="margin-top:24px;">
    <strong>Payment Instructions:</strong> Go to M-PESA › Lipa na M-PESA › Paybill › Business No: <strong>CUCASO Paybill</strong> › Account No: <strong>${data.paymentReference}</strong>. Remittance is automatically matched to this invoice.
  </div>

  <div class="watermark">
    Generated by CUCASO Portal • ${new Date().toLocaleString("en-KE")} • This is an official CUCASO financial document.
  </div>
</div>`;

  printHtml(html, `Invoice ${data.invoiceNumber} — ${data.institutionName}`);
}