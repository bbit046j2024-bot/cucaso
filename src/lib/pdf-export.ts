import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./utils";
import type { Invoice, Payment, Chapter, Attendee, AuditLogEntry, CostItem, Rally } from "@/types";

// ── Colors ──────────────────────────────────────────────────────────────────
const COLOR_NAVY = [15, 23, 42] as [number, number, number]; // #0f172a
const COLOR_TEAL = [13, 148, 136] as [number, number, number]; // #0d9488
const COLOR_AMBER = [217, 119, 6] as [number, number, number]; // #d97706
const COLOR_EMERALD = [16, 185, 129] as [number, number, number]; // #10b981
const COLOR_SLATE = [100, 116, 139] as [number, number, number]; // #64748b
const COLOR_LIGHT_BG = [248, 250, 252] as [number, number, number]; // #f8fafc

/**
 * Standard branded header for all official CUCASO documents
 */
function drawHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  badgeText?: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header stripe
  doc.setFillColor(...COLOR_NAVY);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Accent bar
  doc.setFillColor(...COLOR_TEAL);
  doc.rect(0, 28, pageWidth, 2, "F");

  // Organization Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("COASTAL UNIVERSITIES & COLLEGES ADVENTIST STUDENTS ORGANIZATION (CUCASO)", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Seventh-day Adventist Church · East Kenya Union Conference · Coastal Region Secretariat", 14, 18);
  doc.text(`Official Document · Generated on: ${new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, 14, 23);

  // Document Title Section
  let curY = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_NAVY);
  doc.text(title, 14, curY);

  if (badgeText) {
    const titleWidth = doc.getTextWidth(title);
    const badgeX = 14 + titleWidth + 6;
    doc.setFillColor(...COLOR_TEAL);
    doc.roundedRect(badgeX, curY - 5, doc.getTextWidth(badgeText) + 8, 7, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, badgeX + 4, curY);
  }

  curY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_SLATE);
  doc.text(subtitle, 14, curY);

  return curY + 6;
}

/**
 * Standard branded footer with page numbers
 */
function drawFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("CUCASO Executive Council & Central Treasury · Confidential & Official Record", 14, pageHeight - 8);

    const pageStr = `Page ${i} of ${pageCount}`;
    doc.text(pageStr, pageWidth - 14 - doc.getTextWidth(pageStr), pageHeight - 8);
  }
}

/**
 * Draw a row of KPI summary cards
 */
function drawKpiCards(
  doc: jsPDF,
  startY: number,
  cards: { label: string; value: string; color?: [number, number, number] }[]
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const cardGap = 4;
  const totalMargin = 28; // 14 on each side
  const availableWidth = pageWidth - totalMargin;
  const cardWidth = (availableWidth - cardGap * (cards.length - 1)) / cards.length;
  const cardHeight = 18;

  cards.forEach((card, idx) => {
    const x = 14 + idx * (cardWidth + cardGap);
    doc.setFillColor(...COLOR_LIGHT_BG);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_SLATE);
    doc.text(card.label.toUpperCase(), x + 4, startY + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...(card.color || COLOR_NAVY));
    doc.text(card.value, x + 4, startY + 13.5);
  });

  return startY + cardHeight + 8;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CHAPTER FINANCIAL SUMMARY & LEDGER PDF
// ─────────────────────────────────────────────────────────────────────────────
export interface FinancialSummaryData {
  chapters: Chapter[];
  invoices: Invoice[];
  payments?: Payment[];
  rallyTitle?: string;
}

export function exportChapterFinancialSummaryPDF(data: FinancialSummaryData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const totalInvoiced = data.invoices.reduce((s, i) => s + (i.amountDue || 0), 0);
  const totalCollected = data.invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const totalBalance = Math.max(0, totalInvoiced - totalCollected);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  let y = drawHeader(
    doc,
    "Chapter Financial Ledger & Collection Summary",
    `Official council record of capability fee invoices, remittances, and outstanding balances · ${data.rallyTitle || "Annual Rally 2026"}`,
    "FINANCIAL AUDIT"
  );

  y = drawKpiCards(doc, y, [
    { label: "Total Invoiced (KES)", value: formatCurrency(totalInvoiced), color: COLOR_NAVY },
    { label: "Total Collected (KES)", value: formatCurrency(totalCollected), color: COLOR_EMERALD },
    { label: "Total Outstanding Balance", value: formatCurrency(totalBalance), color: COLOR_AMBER },
    { label: "Collection Rate", value: `${collectionRate}% Settled`, color: collectionRate >= 80 ? COLOR_EMERALD : COLOR_AMBER },
    { label: "Active Chapters", value: `${data.chapters.length} Chapters`, color: COLOR_NAVY },
  ]);

  const tableRows = data.chapters.map((ch, idx) => {
    const inv = data.invoices.find((i) => i.chapterId === ch.id);
    const due = inv?.amountDue || 0;
    const paid = inv?.amountPaid || 0;
    const balance = inv ? inv.balance : due;
    const status = inv ? inv.status : "UNPAID";

    return [
      idx + 1,
      ch.code,
      ch.institutionName,
      ch.chapterName || ch.institutionName,
      ch.tierId || "TIER_3",
      ch.attendeesCount || 0,
      inv?.paymentReference || `CUCASO-${ch.code}`,
      due > 0 ? due.toLocaleString("en-KE") : "—",
      paid > 0 ? paid.toLocaleString("en-KE") : "0",
      balance > 0 ? balance.toLocaleString("en-KE") : "0",
      status,
    ];
  });

  // Add Grand Total Row
  tableRows.push([
    "",
    "TOTAL",
    "All Chapters Aggregated",
    "",
    "",
    data.chapters.reduce((s, c) => s + (c.attendeesCount || 0), 0),
    "—",
    totalInvoiced.toLocaleString("en-KE"),
    totalCollected.toLocaleString("en-KE"),
    totalBalance.toLocaleString("en-KE"),
    `${collectionRate}%`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
      "#",
      "Code",
      "Institution",
      "Chapter Name",
      "Tier",
      "Delegates",
      "Payment Ref",
      "Invoiced (KES)",
      "Collected (KES)",
      "Balance (KES)",
      "Status",
    ]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: COLOR_NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { fontStyle: "bold", halign: "center", cellWidth: 16 },
      2: { cellWidth: 50 },
      3: { cellWidth: 38 },
      4: { halign: "center", cellWidth: 16 },
      5: { halign: "center", cellWidth: 16 },
      6: { fontStyle: "bold", halign: "center", cellWidth: 26 },
      7: { halign: "right", fontStyle: "bold", cellWidth: 26 },
      8: { halign: "right", fontStyle: "bold", textColor: COLOR_EMERALD, cellWidth: 26 },
      9: { halign: "right", fontStyle: "bold", textColor: COLOR_AMBER, cellWidth: 26 },
      10: { halign: "center", fontStyle: "bold", cellWidth: 18 },
    },
    didParseCell: (dataCell) => {
      // Highlight total row
      if (dataCell.row.index === tableRows.length - 1) {
        dataCell.cell.styles.fontStyle = "bold";
        dataCell.cell.styles.fillColor = [241, 245, 249];
        dataCell.cell.styles.textColor = COLOR_NAVY;
      }
      // Color status
      if (dataCell.section === "body" && dataCell.column.index === 10) {
        const val = String(dataCell.cell.raw);
        if (val === "PAID") dataCell.cell.styles.textColor = COLOR_EMERALD;
        else if (val === "PARTIAL") dataCell.cell.styles.textColor = [37, 99, 235];
        else if (val === "UNPAID") dataCell.cell.styles.textColor = [225, 29, 72];
      }
    },
    margin: { left: 14, right: 14 },
  });

  drawFooter(doc);
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`CUCASO_Financial_Ledger_${dateStr}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ATTENDEE MASTER REGISTER PDF
// ─────────────────────────────────────────────────────────────────────────────
export interface AttendeeMasterData {
  attendees: Attendee[];
  chapters: Chapter[];
  rallyTitle?: string;
}

export function exportAttendeeMasterRegisterPDF(data: AttendeeMasterData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const totalAttendees = data.attendees.length;
  const confirmedCount = data.attendees.filter((a) => a.status === "CONFIRMED").length;
  const chapterMap = new Map(data.chapters.map((c) => [c.id, c.institutionName]));

  let y = drawHeader(
    doc,
    "Attendee Master Register & Delegate Roster",
    `Comprehensive delegate roster, dietary requirements, and accreditation statuses · ${data.rallyTitle || "Annual Rally 2026"}`,
    "DELEGATES"
  );

  y = drawKpiCards(doc, y, [
    { label: "Total Registered Delegates", value: `${totalAttendees}`, color: COLOR_NAVY },
    { label: "Confirmed / Accredited", value: `${confirmedCount}`, color: COLOR_EMERALD },
    { label: "Pending Accreditation", value: `${totalAttendees - confirmedCount}`, color: COLOR_AMBER },
    { label: "Participating Chapters", value: `${data.chapters.length}`, color: COLOR_NAVY },
  ]);

  const tableRows = data.attendees.map((att, idx) => {
    const instName = chapterMap.get(att.chapterId) || att.chapterId || "Independent";
    return [
      idx + 1,
      att.fullName,
      att.admissionOrIdNumber || "—",
      instName,
      att.department || "General",
      att.gender || "—",
      att.ageCategory || "ADULT",
      att.role || "DELEGATE",
      att.dietaryRequirements || "Standard",
      att.status || "CONFIRMED",
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [[
      "#",
      "Full Name",
      "Admission / ID",
      "Institution",
      "Faculty / Dept",
      "Gender",
      "Category",
      "Role",
      "Dietary / Medical",
      "Status",
    ]],
    body: tableRows.length > 0 ? tableRows : [["—", "No delegates registered yet", "—", "—", "—", "—", "—", "—", "—", "—"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { fontStyle: "bold", cellWidth: 42 },
      2: { fontStyle: "bold", cellWidth: 26 },
      3: { cellWidth: 48 },
      4: { cellWidth: 32 },
      5: { halign: "center", cellWidth: 16 },
      6: { halign: "center", cellWidth: 18 },
      7: { halign: "center", cellWidth: 20 },
      8: { cellWidth: 36 },
      9: { halign: "center", fontStyle: "bold", cellWidth: 22 },
    },
    didParseCell: (dataCell) => {
      if (dataCell.section === "body" && dataCell.column.index === 9) {
        const val = String(dataCell.cell.raw);
        if (val === "CONFIRMED") dataCell.cell.styles.textColor = COLOR_EMERALD;
        else dataCell.cell.styles.textColor = COLOR_AMBER;
      }
    },
    margin: { left: 14, right: 14 },
  });

  drawFooter(doc);
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`CUCASO_Attendee_Master_Register_${dateStr}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CAPABILITY FEE DISTRIBUTION & COST ENGINE AUDIT PDF
// ─────────────────────────────────────────────────────────────────────────────
export interface CapabilityFeeData {
  chapterFees: Array<{
    chapterId: string;
    attendeeCount: number;
    weightBasisPoints: number;
    finalFeeKes: number;
  }>;
  chapters: Chapter[];
  rallyTitle?: string;
  totalBudget?: number;
}

export function exportCapabilityFeeDistributionPDF(data: CapabilityFeeData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const totalAssessed = data.chapterFees.reduce((s, cf) => s + (cf.finalFeeKes || 0), 0);
  const totalAttendees = data.chapterFees.reduce((s, cf) => s + (cf.attendeeCount || 0), 0);
  const avgCostPerHead = totalAttendees > 0 ? Math.round(totalAssessed / totalAttendees) : 0;

  let y = drawHeader(
    doc,
    "Capability Fee Distribution & Cost Allocation",
    `Automated cost engine output: capability weights, delegates, and assigned quotas · ${data.rallyTitle || "Annual Rally 2026"}`,
    "COST ENGINE"
  );

  y = drawKpiCards(doc, y, [
    { label: "Total Budget Assessed", value: formatCurrency(totalAssessed), color: COLOR_NAVY },
    { label: "Assessed Delegates", value: `${totalAttendees} Heads`, color: COLOR_TEAL },
    { label: "Cost-to-Serve / Head", value: formatCurrency(avgCostPerHead), color: COLOR_AMBER },
  ]);

  const chapterMap = new Map(data.chapters.map((c) => [c.id, c]));

  const tableRows = data.chapterFees.map((cf, idx) => {
    const ch = chapterMap.get(cf.chapterId);
    const weightPct = ((cf.weightBasisPoints || 10000) / 100).toFixed(1);
    const sharePct = totalAssessed > 0 ? ((cf.finalFeeKes / totalAssessed) * 100).toFixed(1) : "0.0";

    return [
      idx + 1,
      ch?.code || cf.chapterId,
      ch?.institutionName || "Chapter",
      ch?.tierId || "TIER_3",
      `${weightPct}%`,
      cf.attendeeCount,
      cf.finalFeeKes.toLocaleString("en-KE"),
      `${sharePct}%`,
    ];
  });

  tableRows.push([
    "",
    "TOTAL",
    "All Chapters Aggregated",
    "—",
    "—",
    totalAttendees,
    totalAssessed.toLocaleString("en-KE"),
    "100.0%",
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
      "#",
      "Code",
      "Institution Name",
      "Tier",
      "Tier Weight",
      "Delegates",
      "Assigned Fee (KES)",
      "Budget Share",
    ]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: COLOR_NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { fontStyle: "bold", halign: "center", cellWidth: 20 },
      2: { cellWidth: 65 },
      3: { halign: "center", cellWidth: 20 },
      4: { halign: "center", cellWidth: 20 },
      5: { halign: "center", fontStyle: "bold", cellWidth: 18 },
      6: { halign: "right", fontStyle: "bold", cellWidth: 28 },
      7: { halign: "center", fontStyle: "bold", cellWidth: 20 },
    },
    didParseCell: (dataCell) => {
      if (dataCell.row.index === tableRows.length - 1) {
        dataCell.cell.styles.fontStyle = "bold";
        dataCell.cell.styles.fillColor = [241, 245, 249];
        dataCell.cell.styles.textColor = COLOR_NAVY;
      }
    },
    margin: { left: 14, right: 14 },
  });

  drawFooter(doc);
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`CUCASO_Capability_Fee_Distribution_${dateStr}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. M-PESA RECONCILIATION & TREASURY AUDIT PDF
// ─────────────────────────────────────────────────────────────────────────────
export interface MpesaReconciliationData {
  payments: Payment[];
  invoices?: Invoice[];
  rallyTitle?: string;
}

export function exportMpesaReconciliationPDF(data: MpesaReconciliationData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const totalReceived = data.payments.reduce((s, p) => s + (p.amount || 0), 0);
  const matchedAmount = data.payments.filter((p) => p.status === "MATCHED").reduce((s, p) => s + (p.amount || 0), 0);
  const unmatchedAmount = data.payments.filter((p) => p.status === "UNMATCHED").reduce((s, p) => s + (p.amount || 0), 0);

  let y = drawHeader(
    doc,
    "M-Pesa Daraja & Bank Remittance Settlement Report",
    `Automated Paybill callbacks, matched remittances, and audit trace · ${data.rallyTitle || "Annual Rally 2026"}`,
    "TREASURY"
  );

  y = drawKpiCards(doc, y, [
    { label: "Total Remittances Received", value: formatCurrency(totalReceived), color: COLOR_NAVY },
    { label: "Matched to Invoices", value: formatCurrency(matchedAmount), color: COLOR_EMERALD },
    { label: "Unmatched / Pending Review", value: formatCurrency(unmatchedAmount), color: COLOR_AMBER },
    { label: "Transaction Count", value: `${data.payments.length} Payments`, color: COLOR_TEAL },
  ]);

  const tableRows = data.payments.map((p, idx) => {
    return [
      idx + 1,
      p.mpesaReceiptNumber || p.reference || "—",
      p.payerName || "Anonymous Remitter",
      p.payerPhone || "—",
      p.reference || "—",
      p.method || "MPESA_C2B",
      p.amount.toLocaleString("en-KE"),
      p.timestamp ? p.timestamp.substring(0, 16).replace("T", " ") : "—",
      p.status,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [[
      "#",
      "Receipt / Ref",
      "Payer Name",
      "Payer Phone",
      "Account Ref",
      "Channel",
      "Amount (KES)",
      "Date & Time",
      "Reconciliation",
    ]],
    body: tableRows.length > 0 ? tableRows : [["—", "No payments recorded yet", "—", "—", "—", "—", "—", "—", "—"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { fontStyle: "bold", cellWidth: 32 },
      2: { fontStyle: "bold", cellWidth: 45 },
      3: { fontStyle: "bold", cellWidth: 26 },
      4: { fontStyle: "bold", cellWidth: 32 },
      5: { halign: "center", cellWidth: 25 },
      6: { halign: "right", fontStyle: "bold", textColor: COLOR_EMERALD, cellWidth: 28 },
      7: { cellWidth: 34 },
      8: { halign: "center", fontStyle: "bold", cellWidth: 26 },
    },
    didParseCell: (dataCell) => {
      if (dataCell.section === "body" && dataCell.column.index === 8) {
        const val = String(dataCell.cell.raw);
        if (val === "MATCHED") dataCell.cell.styles.textColor = COLOR_EMERALD;
        else if (val === "UNMATCHED") dataCell.cell.styles.textColor = [225, 29, 72];
        else dataCell.cell.styles.textColor = COLOR_AMBER;
      }
    },
    margin: { left: 14, right: 14 },
  });

  drawFooter(doc);
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`CUCASO_Mpesa_Reconciliation_Report_${dateStr}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. RALLY PROGRAMME & LOGISTICS SPECIFICATION PDF
// ─────────────────────────────────────────────────────────────────────────────
export interface RallyLogisticsData {
  rally?: Rally | null;
  costItems?: CostItem[];
  chapters?: Chapter[];
  attendeesCount?: number;
}

export function exportRallyLogisticsPDF(data: RallyLogisticsData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const rally = data.rally;
  const costItems = data.costItems || [];
  const fixedTotal = costItems.filter((c) => c.type === "FIXED").reduce((s, c) => s + c.amount, 0);
  const perHeadItems = costItems.filter((c) => c.type === "PER_HEAD");
  const totalHeadCount = data.attendeesCount || 200;
  const perHeadTotal = perHeadItems.reduce((s, c) => s + c.amount * totalHeadCount, 0);
  const totalBudget = fixedTotal + perHeadTotal;

  let y = drawHeader(
    doc,
    "Rally Programme & Logistics Operations Specification",
    `Physical deployment schedule, venue layout, catering quantities, and security protocol · ${rally?.title || "Annual Rally 2026"}`,
    "OPERATIONS"
  );

  y = drawKpiCards(doc, y, [
    { label: "Target Capacity", value: `${rally?.capacity || 1000} Delegates`, color: COLOR_NAVY },
    { label: "Fixed Logistics Total", value: formatCurrency(fixedTotal), color: COLOR_TEAL },
    { label: "Per-Head Catering & Kits", value: formatCurrency(perHeadTotal), color: COLOR_AMBER },
    { label: "Total Operations Budget", value: formatCurrency(totalBudget), color: COLOR_NAVY },
  ]);

  // Event Details Box
  doc.setFillColor(...COLOR_LIGHT_BG);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 30, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_NAVY);
  doc.text("EVENT SPECIFICATIONS & VENUE LIAISON", 18, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_SLATE);
  doc.text(`Event Title: ${rally?.title || "CUCASO Annual Rally 2026"}`, 18, y + 12);
  doc.text(`Spiritual Theme: "${rally?.theme || "Standing on the Promises of God"}"`, 18, y + 17);
  doc.text(`Venue Location: ${rally?.venueName || "Coast Regional Grounds"}, ${rally?.venueLocation || "Mombasa County"}`, 18, y + 22);
  doc.text(`Dates: ${rally?.startDate || "TBA"} to ${rally?.endDate || "TBA"} · Permitted Capacity: ${rally?.capacity || 1000} attendees`, 18, y + 27);

  y += 35;

  const tableRows = costItems.map((item, idx) => {
    const impact = item.type === "FIXED"
      ? item.amount
      : item.type === "PER_HEAD"
      ? item.amount * totalHeadCount
      : item.amount * (item.quantity ?? 1);

    return [
      idx + 1,
      item.name,
      item.category,
      item.type === "FIXED" ? "FIXED" : item.type === "PER_HEAD" ? "PER HEAD" : "PER VEHICLE",
      item.type === "FIXED" ? "1" : item.type === "PER_HEAD" ? `${totalHeadCount} delegates` : `${item.quantity ?? 1} units`,
      item.amount.toLocaleString("en-KE"),
      impact.toLocaleString("en-KE"),
      item.notes || "Standard provision",
    ];
  });

  tableRows.push([
    "",
    "TOTAL LOGISTICS EXPENDITURE",
    "—",
    "—",
    "—",
    "—",
    totalBudget.toLocaleString("en-KE"),
    "Approved by Council",
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
      "#",
      "Logistics Line Item",
      "Category",
      "Cost Type",
      "Quantity",
      "Rate (KES)",
      "Impact (KES)",
      "Operational Notes",
    ]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: COLOR_NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { fontStyle: "bold", cellWidth: 46 },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "center", cellWidth: 20 },
      4: { halign: "center", cellWidth: 22 },
      5: { halign: "right", cellWidth: 20 },
      6: { halign: "right", fontStyle: "bold", textColor: COLOR_NAVY, cellWidth: 22 },
      7: { cellWidth: 22 },
    },
    didParseCell: (dataCell) => {
      if (dataCell.row.index === tableRows.length - 1) {
        dataCell.cell.styles.fontStyle = "bold";
        dataCell.cell.styles.fillColor = [241, 245, 249];
        dataCell.cell.styles.textColor = COLOR_NAVY;
      }
    },
    margin: { left: 14, right: 14 },
  });

  drawFooter(doc);
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`CUCASO_Rally_Programme_Logistics_${dateStr}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. COUNCIL GOVERNANCE AUDIT TRAIL PDF
// ─────────────────────────────────────────────────────────────────────────────
export interface CouncilAuditData {
  auditLogs: AuditLogEntry[];
  rallyTitle?: string;
}

export function exportCouncilAuditPDF(data: CouncilAuditData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = drawHeader(
    doc,
    "Council Governance & Administrative Audit Trail",
    `Immutable log of approval actions, fee recalibrations, and executive decisions · ${data.rallyTitle || "Annual Rally 2026"}`,
    "GOVERNANCE"
  );

  y = drawKpiCards(doc, y, [
    { label: "Total Audit Events Logged", value: `${data.auditLogs.length} Events`, color: COLOR_NAVY },
    { label: "Audit Mechanism", value: "Tamper-Evident SHA-256", color: COLOR_TEAL },
    { label: "Compliance Status", value: "Verified Active", color: COLOR_EMERALD },
  ]);

  const tableRows = data.auditLogs.map((l, idx) => {
    return [
      idx + 1,
      l.timestamp ? l.timestamp.substring(0, 16).replace("T", " ") : "—",
      l.actor || "Council Member",
      l.role || "OFFICER",
      l.action || "ACTION",
      l.target || "SYSTEM",
      l.details || "—",
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [[
      "#",
      "Timestamp",
      "Actor",
      "Role",
      "Action",
      "Target",
      "Resolution / Details",
    ]],
    body: tableRows.length > 0 ? tableRows : [["—", "No audit logs recorded yet", "—", "—", "—", "—", "—"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { cellWidth: 26 },
      2: { fontStyle: "bold", cellWidth: 32 },
      3: { halign: "center", cellWidth: 20 },
      4: { fontStyle: "bold", cellWidth: 30 },
      5: { cellWidth: 26 },
      6: { cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });

  drawFooter(doc);
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`CUCASO_Council_Governance_Audit_${dateStr}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SINGLE CHAPTER OFFICIAL INVOICE PDF
// ─────────────────────────────────────────────────────────────────────────────
export interface SingleInvoicePdfData {
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
}

export function exportSingleInvoicePDF(data: SingleInvoicePdfData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header banner
  doc.setFillColor(...COLOR_NAVY);
  doc.rect(0, 0, pageWidth, 34, "F");
  doc.setFillColor(...COLOR_TEAL);
  doc.rect(0, 34, pageWidth, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("CUCASO CENTRAL TREASURY", 16, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Coastal Universities & Colleges Adventist Students Organization", 16, 20);
  doc.text("Seventh-day Adventist Church · East Kenya Union Conference", 16, 26);

  // Invoice title & badge on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const invNumStr = data.invoiceNumber || "INVOICE";
  doc.text(invNumStr, pageWidth - 16 - doc.getTextWidth(invNumStr), 15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const statusColor = data.status === "PAID" ? COLOR_EMERALD : data.amountPaid > 0 ? [37, 99, 235] : COLOR_AMBER;
  const statusStr = `STATUS: ${data.status}`;
  doc.setTextColor(...(statusColor as [number, number, number]));
  doc.text(statusStr, pageWidth - 16 - doc.getTextWidth(statusStr), 25);

  // Bill To & Metadata Grid
  let y = 48;
  doc.setFillColor(...COLOR_LIGHT_BG);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, y, 86, 38, 3, 3, "FD");
  doc.roundedRect(108, y, 86, 38, 3, 3, "FD");

  // Left card: Billed Chapter
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_SLATE);
  doc.text("BILLED INSTITUTION / CHAPTER", 20, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_NAVY);
  doc.text(data.institutionName, 20, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_SLATE);
  doc.text(`Chapter Code: ${data.chapterCode}`, 20, y + 21);
  doc.text(`Event: ${data.rallyTitle || "Annual Rally 2026"}`, 20, y + 27);

  // Right card: Payment Account details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_SLATE);
  doc.text("PAYMENT REFERENCE & DUE DATE", 112, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_TEAL);
  doc.text(data.paymentReference, 112, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_SLATE);
  doc.text(`Due Date: ${data.dueDate || "Before Rally Start"}`, 112, y + 21);
  doc.text("Channel: Lipa na M-Pesa Paybill / Bank EFT", 112, y + 27);

  y += 46;

  // Itemized breakdown table
  const pct = Math.min(100, Math.round(((data.amountPaid || 0) / (data.amountDue || 1)) * 100));

  autoTable(doc, {
    startY: y,
    head: [["Description", "Council Authorization", "Amount (KES)"]],
    body: [
      [
        `Chapter Capability Assessment Fee\nAssessed rally registration and operational contribution for ${data.institutionName}`,
        "Approved by Executive Council",
        data.amountDue.toLocaleString("en-KE"),
      ],
      [
        "Less: Verified Remittances & M-Pesa Payments",
        data.amountPaid > 0 ? "Matched & Reconciled" : "No Payments Recorded",
        `- ${data.amountPaid.toLocaleString("en-KE")}`,
      ],
      [
        "NET OUTSTANDING BALANCE",
        `${pct}% Settled`,
        data.balance.toLocaleString("en-KE"),
      ],
    ],
    theme: "plain",
    headStyles: {
      fillColor: COLOR_NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 105 },
      1: { halign: "center", cellWidth: 45 },
      2: { halign: "right", fontStyle: "bold", cellWidth: 28 },
    },
    didParseCell: (dataCell) => {
      if (dataCell.row.index === 2) {
        dataCell.cell.styles.fontStyle = "bold";
        dataCell.cell.styles.fillColor = [254, 243, 199];
        dataCell.cell.styles.textColor = COLOR_AMBER;
      }
    },
    margin: { left: 16, right: 16 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Lipa na M-Pesa Instructions Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(16, finalY, pageWidth - 32, 30, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20, 83, 45);
  doc.text("M-PESA PAYMENT INSTRUCTIONS", 20, finalY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(20, 83, 45);
  doc.text("1. Go to M-PESA on your phone › Lipa na M-PESA › Paybill", 20, finalY + 13);
  doc.text("2. Business Number: CUCASO Official Paybill (as announced by Treasury)", 20, finalY + 18);
  doc.text(`3. Account Number: ${data.paymentReference} (Your payment will be automatically matched to this invoice)`, 20, finalY + 23);

  // Signatures
  const sigY = finalY + 44;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);

  doc.line(20, sigY, 80, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_NAVY);
  doc.text("Central Treasurer", 20, sigY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_SLATE);
  doc.text("CUCASO Executive Council", 20, sigY + 9);

  doc.line(pageWidth - 80, sigY, pageWidth - 20, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_NAVY);
  doc.text("Council Chairperson", pageWidth - 80, sigY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_SLATE);
  doc.text("CUCASO Executive Council", pageWidth - 80, sigY + 9);

  drawFooter(doc);
  doc.save(`Invoice_${data.invoiceNumber || data.chapterCode}_${data.chapterCode}.pdf`);
}

/**
 * 8. Export Alumni Master Register / Directory PDF
 */
export function exportAlumniDirectoryPDF(data: {
  alumni: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    institutionGraduated: string;
    graduationYear: string;
    profession?: string;
    areasOfInterest?: string[];
    status: string;
    createdAt?: string;
  }>;
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const curY = drawHeader(
    doc,
    "Alumni Network Master Directory",
    "Adventist Graduates, Mentors, Career Advisors, and Associate Members",
    "COUNCIL ARCHIVE"
  );

  // Summary Metrics
  const total = data.alumni.length;
  const approved = data.alumni.filter(a => a.status === "APPROVED").length;
  const pending = data.alumni.filter(a => a.status === "PENDING").length;

  const afterCards = drawKpiCards(doc, curY, [
    { label: "Total Registered Alumni", value: `${total} Graduates`, color: COLOR_NAVY },
    { label: "Active / Approved", value: `${approved} Members`, color: COLOR_EMERALD },
    { label: "Pending Secretariat Review", value: `${pending} Pending`, color: COLOR_AMBER },
  ]);

  const rows = data.alumni.map((a, idx) => [
    idx + 1,
    a.fullName,
    a.institutionGraduated,
    a.graduationYear,
    a.profession || "—",
    a.phone,
    (a.areasOfInterest || []).slice(0, 2).join(", ") || "—",
    a.status,
  ]);

  autoTable(doc, {
    startY: afterCards + 4,
    head: [["#", "Full Name", "Alma Mater", "Class", "Profession", "Phone", "Key Interests", "Status"]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: COLOR_NAVY,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 35, fontStyle: "bold" },
      2: { cellWidth: 28 },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 26 },
      5: { cellWidth: 24 },
      6: { cellWidth: 32 },
      7: { cellWidth: 16, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 7) {
        if (data.cell.raw === "APPROVED") {
          data.cell.styles.textColor = COLOR_EMERALD;
        } else if (data.cell.raw === "PENDING") {
          data.cell.styles.textColor = COLOR_AMBER;
        }
      }
    },
  });

  drawFooter(doc);
  doc.save(`CUCASO_Alumni_Directory_${new Date().toISOString().split("T")[0]}.pdf`);
}

