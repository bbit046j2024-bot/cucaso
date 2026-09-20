import fs from "fs";
import path from "path";
import { 
  Chapter, 
  Rally, 
  Attendee, 
  Invoice, 
  Payment, 
  ChapterApplication, 
  CostItem, 
  AuditLogEntry, 
  ExecutiveLeader, 
  InstitutionalHead,
  CoastalAreaPreset
} from "@/types";
import { 
  MEMBER_CHAPTERS as INITIAL_CHAPTERS, 
  CURRENT_RALLY as INITIAL_RALLY,
  INVOICES as INITIAL_INVOICES,
  RALLY_COST_ITEMS as INITIAL_COST_ITEMS,
} from "@/lib/data";

export interface DatabaseSchema {
  chapters: Chapter[];
  rallies: Rally[];
  attendees: Attendee[];
  invoices: Invoice[];
  payments: Payment[];
  applications: ChapterApplication[];
  costItems: CostItem[];
  auditLogs: AuditLogEntry[];
  leaders: ExecutiveLeader[];
  institutionalHeads: InstitutionalHead[];
  gallery: typeof INITIAL_GALLERY;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "cucaso.json");

// Ensure enriched coordinates and mapPositions for initial chapters
const ENRICHED_INITIAL_CHAPTERS: Chapter[] = INITIAL_CHAPTERS.map((ch) => {
  const coordinatesMap: Record<string, { lat: number; lng: number; top: number; left: number }> = {
    "ch-tum": { lat: -4.0326, lng: 39.6642, top: 48, left: 43 }, // Tudor / Kisauni
    "ch-pwani": { lat: -3.6305, lng: 39.8499, top: 28, left: 54 }, // Kilifi
    "ch-mpoly": { lat: -4.0628, lng: 39.6631, top: 54, left: 40 }, // Mombasa Poly Ganjoni
    "ch-kmtc": { lat: -4.0489, lng: 39.6738, top: 50, left: 44 }, // KMTC Mombasa
    "ch-diani": { lat: -4.2797, lng: 39.5847, top: 72, left: 34 }, // Diani Kwale
    "ch-ttu": { lat: -3.3974, lng: 38.5562, top: 38, left: 20 }, // Voi Taita Taveta
    "ch-garissa": { lat: -2.3500, lng: 39.6500, top: 12, left: 48 }, // Garissa Liaison
    "ch-kwale": { lat: -4.1744, lng: 39.4521, top: 64, left: 30 }, // Kwale Matuga
    "ch-cgh": { lat: -4.0689, lng: 39.6789, top: 56, left: 43 }, // Coast Girls Kizingo
    "ch-mss": { lat: -4.0531, lng: 39.6685, top: 52, left: 42 }, // Mombasa Sec Mvita
    "ch-kca": { lat: -3.9452, lng: 39.7431, top: 40, left: 48 }, // Kilifi Mtwapa
    "ch-mal": { lat: -3.2192, lng: 40.1169, top: 18, left: 62 }, // Malindi High
  };

  const pos = coordinatesMap[ch.id] || { lat: -4.0435, lng: 39.6682, top: 50, left: 45 };

  return {
    ...ch,
    coordinates: ch.coordinates || { lat: pos.lat, lng: pos.lng },
    mapPosition: ch.mapPosition || { top: pos.top, left: pos.left },
  };
});

// Initialize database file
function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      chapters: ENRICHED_INITIAL_CHAPTERS,
      rallies: [INITIAL_RALLY],
      attendees: [],           // Start empty — added by real chapter reps
      invoices: INITIAL_INVOICES,
      payments: [],            // Start empty — recorded as actual payments arrive
      applications: [],        // Start empty — submitted by real institutions
      costItems: INITIAL_COST_ITEMS,
      auditLogs: [],           // Start empty — populated by real actions
      leaders: [],
      institutionalHeads: [],
      gallery: [],
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading database file, recreating...", error);
    const initialData: DatabaseSchema = {
      chapters: ENRICHED_INITIAL_CHAPTERS,
      rallies: [INITIAL_RALLY],
      attendees: [],
      invoices: INITIAL_INVOICES,
      payments: [],
      applications: [],
      costItems: INITIAL_COST_ITEMS,
      auditLogs: [],
      leaders: [],
      institutionalHeads: [],
      gallery: [],
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}

// Save database
export function saveDatabase(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getDatabase(): DatabaseSchema {
  return initDatabase();
}

// -------------------------------------------------------------
// CHAPTERS OPERATIONS
// -------------------------------------------------------------
export function getAllChapters(): Chapter[] {
  const db = getDatabase();
  return db.chapters;
}

export function getChapterById(id: string): Chapter | null {
  const db = getDatabase();
  return db.chapters.find((c) => c.id === id) || null;
}

export function createChapter(chapterData: Partial<Chapter>): Chapter {
  const db = getDatabase();
  const id = chapterData.id || `ch-${Date.now().toString(36)}`;
  const newChapter: Chapter = {
    id,
    code: chapterData.code || `CHAP-${db.chapters.length + 1}`,
    institutionName: chapterData.institutionName || "New Institution",
    chapterName: chapterData.chapterName || "New SDA Chapter",
    type: chapterData.type || "COLLEGE",
    sector: chapterData.sector || "PUBLIC",
    location: chapterData.location || "Mombasa Coast",
    status: chapterData.status || "APPROVED",
    tierId: chapterData.tierId || "TIER_3",
    patronName: chapterData.patronName || "",
    patronPhone: chapterData.patronPhone || "",
    patronEmail: chapterData.patronEmail || "",
    repName: chapterData.repName || "",
    repPhone: chapterData.repPhone || "",
    treasurerName: chapterData.treasurerName || "",
    treasurerPhone: chapterData.treasurerPhone || "",
    approximateMembers: chapterData.approximateMembers || 150,
    attendeesCount: chapterData.attendeesCount || 100,
    coordinates: chapterData.coordinates || { lat: -4.0435, lng: 39.6682 },
    mapPosition: chapterData.mapPosition || { top: 50, left: 45 },
    createdAt: chapterData.createdAt || new Date().toISOString().split("T")[0],
  };

  db.chapters.push(newChapter);

  // Add audit log
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: "Executive Council / Admin",
    role: "SUPER_ADMIN",
    action: "CHAPTER_CREATED",
    target: newChapter.code,
    details: `Created new member chapter: ${newChapter.institutionName} (${newChapter.code})`,
    status: "SUCCESS",
  });

  saveDatabase(db);
  return newChapter;
}

export function updateChapter(id: string, updates: Partial<Chapter>): Chapter | null {
  const db = getDatabase();
  const index = db.chapters.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const existing = db.chapters[index];
  const updated: Chapter = {
    ...existing,
    ...updates,
    coordinates: updates.coordinates || existing.coordinates,
    mapPosition: updates.mapPosition || existing.mapPosition,
  };

  db.chapters[index] = updated;

  // Add audit log
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: "Executive Council / Admin",
    role: "SUPER_ADMIN",
    action: "CHAPTER_UPDATED",
    target: id,
    details: `Updated chapter details and map coordinates for ${updated.institutionName} (${updated.location})`,
    status: "SUCCESS",
  });

  saveDatabase(db);
  return updated;
}

export function deleteChapter(id: string): boolean {
  const db = getDatabase();
  const initialLength = db.chapters.length;
  db.chapters = db.chapters.filter((c) => c.id !== id);
  if (db.chapters.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// RALLY OPERATIONS
// -------------------------------------------------------------
export function getCurrentRally(): Rally {
  const db = getDatabase();
  return db.rallies[0] || INITIAL_RALLY;
}

export function updateRally(id: string, updates: Partial<Rally>): Rally | null {
  const db = getDatabase();
  const index = db.rallies.findIndex((r) => r.id === id);
  if (index === -1) return null;

  db.rallies[index] = { ...db.rallies[index], ...updates };
  saveDatabase(db);
  return db.rallies[index];
}

// -------------------------------------------------------------
// ATTENDEE OPERATIONS
// -------------------------------------------------------------
export function getAttendees(chapterId?: string): Attendee[] {
  const db = getDatabase();
  if (chapterId) {
    return db.attendees.filter((a) => a.chapterId === chapterId);
  }
  return db.attendees;
}

export function createAttendee(attendeeData: Partial<Attendee>): Attendee {
  const db = getDatabase();
  const newAttendee: Attendee = {
    id: attendeeData.id || `att-${Date.now().toString(36)}`,
    chapterId: attendeeData.chapterId || "ch-tum",
    rallyId: attendeeData.rallyId || "rally-cur-2026",
    fullName: attendeeData.fullName || "New Delegate",
    admissionOrIdNumber: attendeeData.admissionOrIdNumber || "REG-001",
    department: attendeeData.department || "General",
    gender: attendeeData.gender || "MALE",
    ageCategory: attendeeData.ageCategory || "ADULT",
    role: attendeeData.role || "DELEGATE",
    dietaryRequirements: attendeeData.dietaryRequirements || "Standard",
    guardianName: attendeeData.guardianName,
    guardianPhone: attendeeData.guardianPhone,
    consentGiven: attendeeData.consentGiven ?? true,
    status: attendeeData.status || "CONFIRMED",
    createdAt: new Date().toISOString(),
  };

  db.attendees.push(newAttendee);

  // Update chapter attendee count
  const ch = db.chapters.find((c) => c.id === newAttendee.chapterId);
  if (ch) {
    ch.attendeesCount = (ch.attendeesCount || 0) + 1;
  }

  saveDatabase(db);
  return newAttendee;
}

export function deleteAttendee(id: string): boolean {
  const db = getDatabase();
  const att = db.attendees.find((a) => a.id === id);
  if (!att) return false;

  db.attendees = db.attendees.filter((a) => a.id !== id);
  const ch = db.chapters.find((c) => c.id === att.chapterId);
  if (ch && (ch.attendeesCount || 0) > 0) {
    ch.attendeesCount = (ch.attendeesCount || 1) - 1;
  }

  saveDatabase(db);
  return true;
}

// -------------------------------------------------------------
// APPLICATION OPERATIONS
// -------------------------------------------------------------
export function getApplications(): ChapterApplication[] {
  const db = getDatabase();
  return db.applications;
}

export function createApplication(appData: Partial<ChapterApplication>): ChapterApplication {
  const db = getDatabase();
  const newApp: ChapterApplication = {
    id: `app-${Date.now().toString(36)}`,
    institutionName: appData.institutionName || "",
    chapterName: appData.chapterName || "",
    type: appData.type || "COLLEGE",
    sector: appData.sector || "PUBLIC",
    location: appData.location || "",
    patronName: appData.patronName || "",
    patronPhone: appData.patronPhone || "",
    patronEmail: appData.patronEmail || "",
    chairpersonName: appData.chairpersonName || "",
    chairpersonPhone: appData.chairpersonPhone || "",
    chairpersonEmail: appData.chairpersonEmail || "",
    treasurerName: appData.treasurerName || "",
    treasurerPhone: appData.treasurerPhone || "",
    approxMembers: appData.approxMembers || appData.approximateMembers || 50,
    approximateMembers: appData.approximateMembers || appData.approxMembers || 50,
    endorsementDocument: appData.endorsementDocument || "endorsement.pdf",
    status: "SUBMITTED",
    submittedAt: new Date().toISOString().split("T")[0],
  };

  db.applications.unshift(newApp);
  saveDatabase(db);
  return newApp;
}

export function updateApplication(id: string, updates: Partial<ChapterApplication>): ChapterApplication | null {
  const db = getDatabase();
  const index = db.applications.findIndex((a) => a.id === id);
  if (index === -1) return null;

  db.applications[index] = { ...db.applications[index], ...updates };

  // If approved, create the chapter in the database automatically
  if (updates.status === "APPROVED" && !db.chapters.some((c) => c.institutionName === db.applications[index].institutionName)) {
    const app = db.applications[index];
    createChapter({
      institutionName: app.institutionName,
      chapterName: app.chapterName,
      type: app.type,
      sector: app.sector,
      location: app.location,
      status: "APPROVED",
      tierId: app.assignedTier || "TIER_3",
      patronName: app.patronName,
      patronPhone: app.patronPhone,
      patronEmail: app.patronEmail,
      repName: app.chairpersonName,
      repPhone: app.chairpersonPhone,
      approximateMembers: app.approximateMembers,
      attendeesCount: Math.round(app.approximateMembers * 0.7),
      coordinates: { lat: -4.0435, lng: 39.6682 },
      mapPosition: { top: 52, left: 44 },
    });
  }

  saveDatabase(db);
  return db.applications[index];
}

// -------------------------------------------------------------
// INVOICES & PAYMENTS
// -------------------------------------------------------------
export function getInvoices(): Invoice[] {
  const db = getDatabase();
  return db.invoices;
}

export function getPayments(): Payment[] {
  const db = getDatabase();
  return db.payments;
}

export function createPayment(payData: Partial<Payment>): Payment {
  const db = getDatabase();
  const newPayment: Payment = {
    id: `pay-${Date.now().toString(36)}`,
    invoiceId: payData.invoiceId || "inv-1",
    amount: payData.amount || 50000,
    method: payData.method || "MPESA_DARAJA",
    mpesaReceiptNumber: payData.mpesaReceiptNumber || `QBR${Math.floor(100000 + Math.random() * 900000)}`,
    payerName: payData.payerName || "Anonymous Payer",
    payerPhone: payData.payerPhone || "+254 700 000 000",
    reference: payData.reference || "RALLY-FEE",
    status: payData.status || "MATCHED",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
  };

  db.payments.unshift(newPayment);

  // Update invoice balance
  const inv = db.invoices.find((i) => i.id === newPayment.invoiceId);
  if (inv) {
    inv.amountPaid += newPayment.amount;
    inv.balance = Math.max(0, inv.amountDue - inv.amountPaid);
    if (inv.balance === 0) {
      inv.status = "PAID";
    } else if (inv.amountPaid > 0) {
      inv.status = "PARTIAL";
    }
  }

  saveDatabase(db);
  return newPayment;
}

// -------------------------------------------------------------
// GENERAL STATS & SUMMARY
// -------------------------------------------------------------
export function getSystemStats() {
  const db = getDatabase();
  const totalChapters = db.chapters.length;
  const approvedChapters = db.chapters.filter((c) => c.status === "APPROVED").length;
  const totalAttendees = db.chapters.reduce((sum, c) => sum + (c.attendeesCount || 0), 0);
  const totalInvoiced = db.invoices.reduce((sum, i) => sum + i.amountDue, 0);
  const totalCollected = db.payments.filter((p) => p.status === "MATCHED").reduce((sum, p) => sum + p.amount, 0);
  const pendingApplications = db.applications.filter((a) => a.status === "SUBMITTED").length;

  return {
    totalChapters,
    approvedChapters,
    totalAttendees,
    totalInvoiced,
    totalCollected,
    pendingApplications,
    rally: db.rallies[0],
    lastUpdated: db.updatedAt,
  };
}
