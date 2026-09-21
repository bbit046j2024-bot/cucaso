/**
 * CUCASO Database Layer — Prisma / TiDB Cloud
 * Type-safe Prisma queries mapping cleanly to frontend types.
 */
import { prisma } from "@/lib/prisma";
import {
  Chapter,
  Rally,
  Attendee,
  Invoice,
  Payment,
  ChapterApplication,
  UserAccount,
} from "@/types";
import {
  MEMBER_CHAPTERS as INITIAL_CHAPTERS,
  CURRENT_RALLY as INITIAL_RALLY,
} from "@/lib/data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapChapter(ch: any): Chapter {
  const latestTier = ch.tierHistory?.[0]?.tierId || "TIER_3";
  const attendeeCount = ch.attendees ? ch.attendees.length : (ch._count?.attendees ?? 0);
  return {
    id: ch.id,
    code: ch.code,
    institutionName: ch.institution?.name || "Institution",
    chapterName: ch.name,
    type: (ch.institution?.type || "COLLEGE") as Chapter["type"],
    sector: (ch.institution?.sector || "PUBLIC") as Chapter["sector"],
    location: ch.institution?.location || "Mombasa",
    status: ch.status as Chapter["status"],
    tierId: latestTier,
    patronName: ch.patronName ?? undefined,
    patronPhone: ch.patronPhone ?? undefined,
    patronEmail: ch.patronEmail ?? undefined,
    repName: ch.repName ?? undefined,
    repPhone: ch.repPhone ?? undefined,
    treasurerName: ch.treasurerName ?? undefined,
    treasurerPhone: ch.treasurerPhone ?? undefined,
    approximateMembers: ch.approximateMembers ?? 0,
    attendeesCount: attendeeCount,
    coordinates: ch.lat != null && ch.lng != null ? { lat: ch.lat, lng: ch.lng } : undefined,
    mapPosition: ch.mapTop != null && ch.mapLeft != null ? { top: ch.mapTop, left: ch.mapLeft } : undefined,
    logoUrl: ch.logoUrl ?? undefined,
    createdAt: ch.createdAt instanceof Date ? ch.createdAt.toISOString().split("T")[0] : String(ch.createdAt || ""),
  };
}

function mapAttendee(att: any): Attendee {
  return {
    id: att.id,
    rallyId: att.rallyId,
    chapterId: att.chapterId,
    fullName: att.fullName,
    admissionOrIdNumber: att.admissionOrIdNumber,
    department: att.department ?? undefined,
    gender: att.gender as Attendee["gender"],
    ageCategory: att.ageCategory as Attendee["ageCategory"],
    phone: att.phone ?? undefined,
    emergencyContactName: att.emergencyContactName,
    emergencyContactPhone: att.emergencyContactPhone,
    dietaryRequirements: att.dietaryRequirements ?? undefined,
    accommodationNeeded: att.accommodationNeeded ?? false,
    transportNeeded: att.transportNeeded ?? false,
    role: att.role as Attendee["role"],
    status: att.status as Attendee["status"],
    registrationDate: att.createdAt instanceof Date ? att.createdAt.toISOString().split("T")[0] : String(att.createdAt || ""),
    registrationSource: (att.registrationSource || "ADMIN") as Attendee["registrationSource"],
    guardianConsent: att.guardianConsent
      ? {
          guardianName: att.guardianConsent.guardianName,
          guardianPhone: att.guardianConsent.guardianPhone,
          consentGiven: att.guardianConsent.consentGiven,
          consentDate: att.guardianConsent.consentDate instanceof Date
            ? att.guardianConsent.consentDate.toISOString().split("T")[0]
            : String(att.guardianConsent.consentDate || ""),
        }
      : undefined,
  };
}

function mapInvoice(inv: any): Invoice {
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    rallyId: inv.rallyId,
    chapterId: inv.chapterId,
    institutionName: inv.chapter?.institution?.name || inv.chapter?.name || "Chapter",
    amountDue: inv.totalDueKes ?? inv.baseAmountKes ?? 0,
    amountPaid: inv.amountPaidKes ?? 0,
    balance: inv.balanceKes ?? ((inv.totalDueKes ?? 0) - (inv.amountPaidKes ?? 0)),
    paymentReference: inv.paymentReference,
    dueDate: inv.dueDate instanceof Date ? inv.dueDate.toISOString().split("T")[0] : String(inv.dueDate || ""),
    status: inv.status as Invoice["status"],
  };
}

function mapPayment(pay: any): Payment {
  return {
    id: pay.id,
    invoiceId: pay.invoiceId || "",
    chapterId: pay.invoice?.chapterId || "",
    reference: pay.accountReference || pay.mpesaReceiptNumber || "PAYMENT",
    amount: pay.amountKes ?? 0,
    method: (pay.channel || "MPESA_C2B") as Payment["method"],
    mpesaReceiptNumber: pay.mpesaReceiptNumber ?? undefined,
    payerName: pay.senderName ?? undefined,
    payerPhone: pay.senderPhone ?? undefined,
    status: pay.status as Payment["status"],
    timestamp: pay.transactionTime instanceof Date
      ? pay.transactionTime.toISOString().replace("T", " ").slice(0, 19)
      : pay.createdAt instanceof Date
      ? pay.createdAt.toISOString().replace("T", " ").slice(0, 19)
      : String(pay.createdAt || ""),
  };
}

function mapApplication(app: any): ChapterApplication {
  return {
    id: app.id,
    institutionName: app.institutionName,
    chapterName: app.chapterName,
    type: app.institutionType as ChapterApplication["type"],
    sector: app.sector as ChapterApplication["sector"],
    location: app.location,
    patronName: app.patronName,
    patronPhone: app.patronPhone,
    patronEmail: app.patronEmail,
    chairpersonName: app.chairpersonName ?? "",
    chairpersonPhone: app.chairpersonPhone ?? "",
    chairpersonEmail: app.chairpersonEmail ?? "",
    treasurerName: app.treasurerName ?? "",
    treasurerPhone: app.treasurerPhone ?? "",
    approxMembers: app.approxMembers,
    approximateMembers: app.approxMembers,
    endorsementDocument: app.endorsementUrl || "endorsement.pdf",
    status: app.status as ChapterApplication["status"],
    assignedTier: app.assignedTierId ?? undefined,
    submittedAt: app.createdAt instanceof Date ? app.createdAt.toISOString().split("T")[0] : String(app.createdAt || ""),
    notes: app.notes ?? undefined,
  };
}

// ─── CHAPTERS ────────────────────────────────────────────────────────────────

export async function getAllChapters(): Promise<Chapter[]> {
  const chapters = await prisma.chapter.findMany({
    include: {
      institution: true,
      tierHistory: {
        orderBy: { effectiveAt: "desc" },
        take: 1,
      },
      _count: {
        select: { attendees: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return chapters.map(mapChapter);
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      institution: true,
      tierHistory: {
        orderBy: { effectiveAt: "desc" },
        take: 1,
      },
      _count: {
        select: { attendees: true },
      },
    },
  });
  return chapter ? mapChapter(chapter) : null;
}

export async function createChapter(chapterData: Partial<Chapter>): Promise<Chapter> {
  const instName = chapterData.institutionName || "New Institution";
  let institution = await prisma.institution.findFirst({ where: { name: instName } });
  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        name: instName,
        type: (chapterData.type || "COLLEGE") as any,
        sector: (chapterData.sector || "PUBLIC") as any,
        location: chapterData.location || "Mombasa Coast",
      },
    });
  }

  const id = chapterData.id || `ch-${Date.now().toString(36)}`;
  const created = await prisma.chapter.create({
    data: {
      id,
      code: chapterData.code || `CHAP-${Date.now().toString(36).toUpperCase()}`,
      institutionId: institution.id,
      name: chapterData.chapterName || `${instName} SDA Chapter`,
      status: (chapterData.status || "APPROVED") as any,
      patronName: chapterData.patronName ?? null,
      patronPhone: chapterData.patronPhone ?? null,
      patronEmail: chapterData.patronEmail ?? null,
      repName: chapterData.repName ?? null,
      repPhone: chapterData.repPhone ?? null,
      treasurerName: chapterData.treasurerName ?? null,
      treasurerPhone: chapterData.treasurerPhone ?? null,
      approximateMembers: chapterData.approximateMembers ?? 150,
      lat: chapterData.coordinates?.lat ?? -4.0435,
      lng: chapterData.coordinates?.lng ?? 39.6682,
      mapTop: chapterData.mapPosition?.top ?? 50,
      mapLeft: chapterData.mapPosition?.left ?? 45,
      logoUrl: chapterData.logoUrl ?? null,
    },
    include: {
      institution: true,
    },
  });

  const tierId = chapterData.tierId || "TIER_3";
  const tierExists = await prisma.capabilityTier.findUnique({ where: { id: tierId } });
  if (tierExists) {
    await prisma.chapterTier.create({
      data: {
        chapterId: created.id,
        tierId: tierExists.id,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actor: "Executive Council / Admin",
      action: "CHAPTER_CREATED",
      entityType: "Chapter",
      entityId: created.id,
      afterJson: JSON.stringify({ code: created.code, name: created.name }),
    },
  });

  return (await getChapterById(created.id))!;
}

export async function updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
  const existing = await getChapterById(id);
  if (!existing) return null;

  if (updates.institutionName || updates.location || updates.type || updates.sector) {
    const chRow = await prisma.chapter.findUnique({ where: { id } });
    if (chRow?.institutionId) {
      await prisma.institution.update({
        where: { id: chRow.institutionId },
        data: {
          ...(updates.institutionName ? { name: updates.institutionName } : {}),
          ...(updates.location ? { location: updates.location } : {}),
          ...(updates.type ? { type: updates.type as any } : {}),
          ...(updates.sector ? { sector: updates.sector as any } : {}),
        },
      });
    }
  }

  await prisma.chapter.update({
    where: { id },
    data: {
      ...(updates.chapterName ? { name: updates.chapterName } : {}),
      ...(updates.status ? { status: updates.status as any } : {}),
      ...(updates.patronName !== undefined ? { patronName: updates.patronName } : {}),
      ...(updates.patronPhone !== undefined ? { patronPhone: updates.patronPhone } : {}),
      ...(updates.patronEmail !== undefined ? { patronEmail: updates.patronEmail } : {}),
      ...(updates.repName !== undefined ? { repName: updates.repName } : {}),
      ...(updates.repPhone !== undefined ? { repPhone: updates.repPhone } : {}),
      ...(updates.treasurerName !== undefined ? { treasurerName: updates.treasurerName } : {}),
      ...(updates.treasurerPhone !== undefined ? { treasurerPhone: updates.treasurerPhone } : {}),
      ...(updates.approximateMembers !== undefined ? { approximateMembers: updates.approximateMembers } : {}),
      ...(updates.coordinates ? { lat: updates.coordinates.lat, lng: updates.coordinates.lng } : {}),
      ...(updates.mapPosition ? { mapTop: updates.mapPosition.top, mapLeft: updates.mapPosition.left } : {}),
      ...(updates.logoUrl !== undefined ? { logoUrl: updates.logoUrl } : {}),
    },
  });

  if (updates.tierId) {
    const tierExists = await prisma.capabilityTier.findUnique({ where: { id: updates.tierId } });
    if (tierExists) {
      await prisma.chapterTier.create({
        data: {
          chapterId: id,
          tierId: tierExists.id,
        },
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      actor: "Executive Council / Admin",
      action: "CHAPTER_UPDATED",
      entityType: "Chapter",
      entityId: id,
      afterJson: JSON.stringify({ id, updates }),
    },
  });

  return getChapterById(id);
}

export async function deleteChapter(id: string): Promise<boolean> {
  try {
    await prisma.chapterTier.deleteMany({ where: { chapterId: id } });
    await prisma.attendee.deleteMany({ where: { chapterId: id } });
    await prisma.invoice.deleteMany({ where: { chapterId: id } });
    await prisma.rallyChapterParticipation.deleteMany({ where: { chapterId: id } });
    await prisma.chapter.delete({ where: { id } });
    return true;
  } catch (err) {
    console.error("Delete chapter failed:", err);
    return false;
  }
}

// ─── RALLY ───────────────────────────────────────────────────────────────────

export async function getCurrentRally(): Promise<Rally> {
  const rally = await prisma.rally.findFirst({
    include: { venue: true },
    orderBy: { createdAt: "desc" },
  });

  if (!rally) return INITIAL_RALLY;

  return {
    id: rally.id,
    code: rally.code,
    title: rally.title,
    theme: rally.theme ?? "",
    venueName: rally.venue.name,
    venueLocation: rally.venue.location,
    capacity: rally.capacity,
    startDate: rally.startDate.toISOString().split("T")[0],
    endDate: rally.endDate.toISOString().split("T")[0],
    registrationDeadline: rally.registrationDeadline.toISOString().split("T")[0],
    paymentDeadline: rally.paymentDeadline.toISOString().split("T")[0],
    feeLockDate: rally.feeLockDate.toISOString().split("T")[0],
    state: rally.state as Rally["state"],
    allocationMode: rally.allocationMode as Rally["allocationMode"],
    contingencyPercent: Math.round(rally.contingencyBasisPoints / 100),
  };
}

// ─── ATTENDEES ───────────────────────────────────────────────────────────────

export async function getAttendees(chapterId?: string): Promise<Attendee[]> {
  const list = await prisma.attendee.findMany({
    where: chapterId ? { chapterId } : undefined,
    include: { guardianConsent: true },
    orderBy: { createdAt: "desc" },
  });
  return list.map(mapAttendee);
}

export async function checkAttendee(admissionOrIdNumber: string, rallyId?: string): Promise<Attendee | null> {
  let targetRallyId = rallyId;
  if (!targetRallyId) {
    const rally = await prisma.rally.findFirst({ orderBy: { createdAt: "desc" } });
    targetRallyId = rally?.id || "rally-cur-2026";
  }
  const cleanId = admissionOrIdNumber.trim().toUpperCase();
  const att = await prisma.attendee.findFirst({
    where: {
      rallyId: targetRallyId,
      admissionOrIdNumber: cleanId,
    },
    include: { guardianConsent: true },
  });
  if (!att) return null;
  return mapAttendee(att);
}

export async function createAttendee(attendeeData: Partial<Attendee>): Promise<Attendee> {
  let rallyId = attendeeData.rallyId;
  if (!rallyId) {
    const rally = await prisma.rally.findFirst({ orderBy: { createdAt: "desc" } });
    rallyId = rally?.id || "rally-cur-2026";
  }

  const cleanAdmission = (attendeeData.admissionOrIdNumber || `REG-${Date.now().toString(36).toUpperCase()}`).trim().toUpperCase();

  // Check if attendee is already registered
  const existing = await prisma.attendee.findFirst({
    where: {
      rallyId,
      admissionOrIdNumber: cleanAdmission,
    },
    include: { guardianConsent: true },
  });

  if (existing) {
    throw new Error(`Attendee with ID/Admission '${cleanAdmission}' is already registered for this rally.`);
  }

  const created = await prisma.attendee.create({
    data: {
      rallyId,
      chapterId: attendeeData.chapterId || "ch-tum",
      fullName: attendeeData.fullName || "New Delegate",
      admissionOrIdNumber: cleanAdmission,
      department: attendeeData.department ?? null,
      gender: (attendeeData.gender || "MALE") as any,
      ageCategory: (attendeeData.ageCategory || "ADULT") as any,
      phone: attendeeData.phone ?? null,
      emergencyContactName: attendeeData.emergencyContactName || "Emergency Contact",
      emergencyContactPhone: attendeeData.emergencyContactPhone || "+254 700 000 000",
      dietaryRequirements: attendeeData.dietaryRequirements ?? null,
      accommodationNeeded: attendeeData.accommodationNeeded ?? false,
      transportNeeded: attendeeData.transportNeeded ?? false,
      role: (attendeeData.role || "DELEGATE") as any,
      status: (attendeeData.status || "CONFIRMED") as any,
      registrationSource: attendeeData.registrationSource || "ADMIN",
      guardianConsent: attendeeData.guardianConsent
        ? {
            create: {
              guardianName: attendeeData.guardianConsent.guardianName,
              guardianPhone: attendeeData.guardianConsent.guardianPhone,
              consentGiven: attendeeData.guardianConsent.consentGiven,
            },
          }
        : undefined,
    },
    include: { guardianConsent: true },
  });

  // Keep chapter approximate attendee count in sync
  try {
    const count = await prisma.attendee.count({ where: { chapterId: created.chapterId } });
    await prisma.chapter.update({
      where: { id: created.chapterId },
      data: { approximateMembers: Math.max(count, 1) },
    });
  } catch {}

  return mapAttendee(created);
}

export async function deleteAttendee(id: string): Promise<boolean> {
  try {
    const att = await prisma.attendee.findUnique({ where: { id } });
    if (!att) return false;
    await prisma.guardianConsent.deleteMany({ where: { attendeeId: id } });
    await prisma.attendee.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ─── APPLICATIONS ────────────────────────────────────────────────────────────

export async function getApplications(): Promise<ChapterApplication[]> {
  const apps = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
  });
  return apps.map(mapApplication);
}

export async function createApplication(appData: Partial<ChapterApplication>): Promise<ChapterApplication> {
  const created = await prisma.application.create({
    data: {
      institutionName: appData.institutionName || "",
      institutionType: (appData.type || "COLLEGE") as any,
      sector: (appData.sector || "PUBLIC") as any,
      location: appData.location || "",
      chapterName: appData.chapterName || "",
      patronName: appData.patronName || "",
      patronPhone: appData.patronPhone || "",
      patronEmail: appData.patronEmail || "",
      chairpersonName: appData.chairpersonName ?? null,
      chairpersonPhone: appData.chairpersonPhone ?? null,
      chairpersonEmail: appData.chairpersonEmail ?? null,
      treasurerName: appData.treasurerName ?? null,
      treasurerPhone: appData.treasurerPhone ?? null,
      approxMembers: appData.approxMembers || appData.approximateMembers || 50,
      endorsementUrl: appData.endorsementDocument || null,
      status: "SUBMITTED",
      assignedTierId: appData.assignedTier ?? null,
      notes: appData.notes ?? null,
    },
  });
  return mapApplication(created);
}

export async function updateApplication(id: string, updates: Partial<ChapterApplication>): Promise<ChapterApplication | null> {
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) return null;

  const updated = await prisma.application.update({
    where: { id },
    data: {
      ...(updates.status ? { status: updates.status as any } : {}),
      ...(updates.assignedTier ? { assignedTierId: updates.assignedTier } : {}),
      ...(updates.notes ? { notes: updates.notes } : {}),
    },
  });

  if (updates.status === "APPROVED") {
    const instExists = await prisma.institution.findFirst({ where: { name: existing.institutionName } });
    if (!instExists) {
      await createChapter({
        institutionName: existing.institutionName,
        chapterName: existing.chapterName,
        type: existing.institutionType as any,
        sector: existing.sector as any,
        location: existing.location,
        status: "APPROVED",
        tierId: updates.assignedTier || "TIER_3",
        patronName: existing.patronName,
        patronPhone: existing.patronPhone,
        patronEmail: existing.patronEmail,
        repName: existing.chairpersonName ?? undefined,
        repPhone: existing.chairpersonPhone ?? undefined,
        approximateMembers: existing.approxMembers,
        coordinates: { lat: -4.0435, lng: 39.6682 },
        mapPosition: { top: 52, left: 44 },
      });
    }
  }

  return mapApplication(updated);
}

// ─── INVOICES ────────────────────────────────────────────────────────────────

export async function getInvoices(): Promise<Invoice[]> {
  const invoices = await prisma.invoice.findMany({
    include: {
      chapter: {
        include: { institution: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return invoices.map(mapInvoice);
}

export async function upsertChapterInvoice(data: {
  chapterId: string;
  rallyId?: string;
  amountDue: number;
  dueDate?: string;
}): Promise<Invoice> {
  const existing = await prisma.invoice.findFirst({
    where: { chapterId: data.chapterId },
  });

  const rally = await prisma.rally.findFirst();
  const rallyId = data.rallyId || rally?.id || "rally-cur-2026";

  if (existing) {
    const updated = await prisma.invoice.update({
      where: { id: existing.id },
      data: {
        totalDueKes: data.amountDue,
        balanceKes: Math.max(0, data.amountDue - existing.amountPaidKes),
        dueDate: data.dueDate ? new Date(data.dueDate) : existing.dueDate,
        status: existing.amountPaidKes >= data.amountDue ? "PAID" : existing.amountPaidKes > 0 ? "PARTIAL" : "UNPAID",
      },
      include: { chapter: { include: { institution: true } } },
    });
    return mapInvoice(updated);
  }

  const chapter = await prisma.chapter.findUnique({ where: { id: data.chapterId } });
  const code = chapter?.code || data.chapterId.replace("ch-", "").toUpperCase();
  const invNumber = `INV-CUR26-${code}`;

  const created = await prisma.invoice.create({
    data: {
      invoiceNumber: invNumber,
      rallyId,
      chapterId: data.chapterId,
      baseAmountKes: data.amountDue,
      adjustmentKes: 0,
      totalDueKes: data.amountDue,
      amountPaidKes: 0,
      balanceKes: data.amountDue,
      status: "UNPAID",
      paymentReference: `CUCASO-${code}`,
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date("2026-11-10"),
    },
    include: { chapter: { include: { institution: true } } },
  });

  return mapInvoice(created);
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export async function getPayments(): Promise<Payment[]> {
  const payments = await prisma.payment.findMany({
    include: {
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return payments.map(mapPayment);
}

export async function createPayment(payData: Partial<Payment>): Promise<Payment> {
  const invoiceId = payData.invoiceId || "";
  const created = await prisma.payment.create({
    data: {
      invoiceId: invoiceId || null,
      accountReference: payData.reference || "RALLY-FEE",
      amountKes: payData.amount || 50000,
      channel: (payData.method || "MPESA_C2B") as any,
      mpesaReceiptNumber: payData.mpesaReceiptNumber || `QBR${Math.floor(100000 + Math.random() * 900000)}`,
      senderName: payData.payerName ?? null,
      senderPhone: payData.payerPhone ?? null,
      status: (payData.status || "MATCHED") as any,
      transactionTime: new Date(),
    },
    include: { invoice: true },
  });

  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (invoice) {
      const newPaid = invoice.amountPaidKes + created.amountKes;
      const newBalance = Math.max(0, invoice.totalDueKes - newPaid);
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaidKes: newPaid,
          balanceKes: newBalance,
          status: newBalance === 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID",
        },
      });
    }
  }

  return mapPayment(created);
}

// ─── SYSTEM STATS ────────────────────────────────────────────────────────────

export async function getSystemStats() {
  const [totalChapters, approvedChapters, pendingApplications, invoices, payments, rally, totalAttendees] =
    await Promise.all([
      prisma.chapter.count(),
      prisma.chapter.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: "SUBMITTED" } }),
      prisma.invoice.findMany(),
      prisma.payment.findMany({ where: { status: "MATCHED" } }),
      prisma.rally.findFirst({ orderBy: { createdAt: "desc" }, include: { venue: true } }),
      prisma.attendee.count(),
    ]);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalDueKes, 0);
  const totalCollected = payments.reduce((sum, pay) => sum + pay.amountKes, 0);

  return {
    totalChapters,
    approvedChapters,
    totalAttendees,
    totalInvoiced,
    totalCollected,
    pendingApplications,
    rally: rally
      ? {
          id: rally.id,
          code: rally.code,
          title: rally.title,
          theme: rally.theme,
          venueName: rally.venue.name,
          venueLocation: rally.venue.location,
          state: rally.state,
        }
      : null,
    lastUpdated: new Date().toISOString(),
  };
}

const SEED_GALLERY_ITEMS = [
  {
    title: "CUCASO Annual Rally Convocation",
    category: "Rally",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    altText: "CUCASO Annual Rally Convocation",
    date: "2026-11-14",
    location: "Mombasa Sports Complex",
    description: "Uploaded by Communications Dir",
    chapterId: "ch-tum"
  },
  {
    title: "Delegates Worship & Praise Evening",
    category: "Worship",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80",
    altText: "Delegates Worship & Praise Evening",
    date: "2026-11-14",
    location: "Rally 2026",
    description: "Uploaded by Communications Dir",
    chapterId: "ch-pu"
  },
  {
    title: "Executive Council Strategy Summit",
    category: "Leadership",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    altText: "Executive Council Strategy Summit",
    date: "2026-08-20",
    location: "Leadership Retreat",
    description: "Uploaded by Secretary",
    chapterId: null
  },
  {
    title: "Coastal Chapters Joint Fellowship",
    category: "Fellowship",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80",
    altText: "Coastal Chapters Joint Fellowship",
    date: "2026-09-05",
    location: "Joint Fellowship",
    description: "Uploaded by TUM Chapter",
    chapterId: "ch-tum"
  },
  {
    title: "Community Medical Camp & Outreach",
    category: "Community",
    imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80",
    altText: "Community Medical Camp & Outreach",
    date: "2026-07-12",
    location: "Community Outreach",
    description: "Uploaded by Chaplaincy",
    chapterId: "ch-kmttc-msa"
  },
  {
    title: "Sports Gala & Relay Tournament",
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",
    altText: "Sports Gala & Relay Tournament",
    date: "2026-06-18",
    location: "Sports Gala",
    description: "Uploaded by Sports Coordinator",
    chapterId: "ch-ku-msa"
  }
];

export async function getGalleryItems(category?: string) {
  try {
    const count = await prisma.galleryItem.count();
    if (count === 0) {
      for (const item of SEED_GALLERY_ITEMS) {
        await prisma.galleryItem.create({ data: item });
      }
    }

    let whereClause: any = undefined;
    if (category && category !== "All" && category !== "ALL") {
      const lower = category.toLowerCase();
      if (lower.startsWith("rall")) {
        whereClause = { category: { in: ["Rally", "Rallies", "RALLIES"] } };
      } else {
        whereClause = { category: { equals: category } };
      }
    }

    const items = await prisma.galleryItem.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return items;
  } catch (e) {
    console.error("Error fetching gallery items:", e);
    return [];
  }
}

export async function createGalleryItem(data: {
  title: string;
  category: string;
  imageUrl: string;
  altText?: string;
  date?: string;
  location?: string;
  description?: string;
  chapterId?: string;
}) {
  return await prisma.galleryItem.create({
    data: {
      title: data.title,
      category: data.category || "Fellowship",
      imageUrl: data.imageUrl,
      altText: data.altText || data.title,
      date: data.date || new Date().toISOString().split("T")[0],
      location: data.location || "Coastal Kenya",
      description: data.description || null,
      chapterId: data.chapterId || null,
    },
  });
}

export async function deleteGalleryItem(id: string) {
  try {
    await prisma.galleryItem.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ─── LEADERSHIP & COUNCIL DIRECTORY ─────────────────────────────────────────

export async function getLeadership(category?: string) {
  try {
    const items = await prisma.leadership.findMany({
      where: {
        isActive: true,
        ...(category && category !== "ALL" ? { category } : {}),
      },
      orderBy: [
        { positionNumber: "asc" },
        { createdAt: "asc" },
      ],
    });
    return items;
  } catch (e) {
    console.error("Error fetching leadership:", e);
    return [];
  }
}

export async function createLeadership(data: {
  name: string;
  title: string;
  role?: string;
  category?: string;
  institution?: string;
  phone?: string;
  email?: string;
  bio?: string;
  imageUrl?: string;
  positionNumber?: number;
}) {
  return await prisma.leadership.create({
    data: {
      name: data.name,
      title: data.title,
      role: data.role || "OFFICER",
      category: data.category || "CENTRAL_COUNCIL",
      institution: data.institution || "CUCASO Central Council",
      phone: data.phone || null,
      email: data.email || null,
      bio: data.bio || null,
      imageUrl: data.imageUrl || null,
      positionNumber: data.positionNumber ?? 1,
      isActive: true,
    },
  });
}

export async function updateLeadership(
  id: string,
  data: Partial<{
    name: string;
    title: string;
    role: string;
    category: string;
    institution: string;
    phone: string | null;
    email: string | null;
    bio: string | null;
    imageUrl: string | null;
    positionNumber: number;
    isActive: boolean;
  }>
) {
  return await prisma.leadership.update({
    where: { id },
    data,
  });
}

export async function deleteLeadership(id: string) {
  try {
    await prisma.leadership.delete({ where: { id } });
    return true;
  } catch (err) {
    console.error("Error deleting leader:", err);
    return false;
  }
}

export function getDatabase() {
  return {} as any;
}

export function saveDatabase(_data: any) {}

// ─── USER ACCOUNTS & RBAC ───────────────────────────────────────────────────

let IN_MEMORY_USERS: UserAccount[] = [
  {
    id: "usr-1",
    name: "Council Admin",
    email: "admin@cucaso.org",
    phone: "+254 711 000111",
    role: "SUPER_ADMIN",
    roleTitle: "Super Administrator",
    status: "ACTIVE",
    totpEnabled: true,
    lastActive: "Active now",
  },
  {
    id: "usr-2",
    name: "CUCASO Central Treasurer",
    email: "treasurer@cucaso.org",
    phone: "+254 722 333444",
    role: "CENTRAL_TREASURER",
    roleTitle: "Council Treasurer",
    status: "ACTIVE",
    totpEnabled: true,
    lastActive: "1 hour ago",
  },
  {
    id: "usr-3",
    name: "Dr. Beatrice Mwangi",
    email: "secretary@cucaso.org",
    phone: "+254 733 555666",
    role: "SECRETARY",
    roleTitle: "Organization Secretary",
    status: "ACTIVE",
    totpEnabled: true,
    lastActive: "35 mins ago",
  },
  {
    id: "usr-4",
    name: "Pr. Jonathan Kazungu",
    email: "communications@cucaso.org",
    phone: "+254 744 777888",
    role: "COMMUNICATIONS_DIRECTOR",
    roleTitle: "Communication Director",
    status: "ACTIVE",
    totpEnabled: false,
    lastActive: "2 hours ago",
  },
  {
    id: "usr-5",
    name: "David Kiboi",
    email: "kiboi.david@tum.ac.ke",
    phone: "+254 712 345678",
    role: "CHAPTER_REP",
    roleTitle: "Chapter Representative (TUM)",
    chapterId: "ch-tum",
    chapterName: "Technical University of Mombasa",
    status: "ACTIVE",
    totpEnabled: true,
    lastActive: "2 mins ago",
  },
  {
    id: "usr-6",
    name: "Mercy Chebet",
    email: "mercy.c@pu.ac.ke",
    phone: "+254 723 456789",
    role: "CHAPTER_REP",
    roleTitle: "Chapter Representative (Pwani)",
    chapterId: "ch-pwani",
    chapterName: "Pwani University",
    status: "ACTIVE",
    totpEnabled: false,
    lastActive: "18 mins ago",
  },
  {
    id: "usr-7",
    name: "Peter Otieno",
    email: "rep@mmu.ac.ke",
    phone: "+254 734 567890",
    role: "CHAPTER_REP",
    roleTitle: "Chapter Representative (MMU)",
    chapterId: "ch-mmu",
    chapterName: "Multimedia University Coast",
    status: "ACTIVE",
    totpEnabled: false,
    lastActive: "1 day ago",
  },
  {
    id: "usr-8",
    name: "Grace Wanjiru",
    email: "rep@kmtc-msa.ac.ke",
    phone: "+254 745 678901",
    role: "CHAPTER_REP",
    roleTitle: "Chapter Representative (KMTC Mombasa)",
    chapterId: "ch-kmtc-msa",
    chapterName: "KMTC Mombasa Campus",
    status: "ACTIVE",
    totpEnabled: false,
    lastActive: "3 hours ago",
  },
  {
    id: "usr-9",
    name: "Elder Joshua Ndungu",
    email: "observer1@adventist.or.ke",
    phone: "+254 756 789012",
    role: "OBSERVER",
    roleTitle: "Read-Only Observer (Coast Field)",
    status: "ACTIVE",
    totpEnabled: false,
    lastActive: "Yesterday",
  },
  {
    id: "usr-10",
    name: "Dr. Samuel Mutua",
    email: "treasurer2@cucaso.org",
    phone: "+254 767 890123",
    role: "CENTRAL_TREASURER",
    roleTitle: "Deputy Treasurer",
    status: "ACTIVE",
    totpEnabled: true,
    lastActive: "2 days ago",
  },
];

export async function getUsers(role?: string): Promise<UserAccount[]> {
  try {
    const dbUsers = await prisma.user.findMany({
      include: { chapter: { include: { institution: true } } },
      orderBy: { createdAt: "desc" },
    });
    if (dbUsers.length > 0) {
      let mapped = dbUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone ?? undefined,
        role: u.role as any,
        roleTitle: u.role === "SUPER_ADMIN" ? "Super Administrator"
          : u.role === "CENTRAL_TREASURER" ? "Council Treasurer"
          : u.role === "SECRETARY" ? "Organization Secretary"
          : u.role === "CHAPTER_REP" ? `Chapter Representative (${u.chapter?.institution?.name || "Chapter"})`
          : u.role,
        chapterId: u.chapterId ?? undefined,
        chapterName: u.chapter?.institution?.name ?? undefined,
        status: (u.isActive ? "ACTIVE" : "SUSPENDED") as "ACTIVE" | "SUSPENDED",
        totpEnabled: u.totpEnabled,
        lastActive: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
      }));
      if (role) {
        mapped = mapped.filter((u) => u.role === role);
      }
      return mapped;
    }
  } catch (e) {
    console.warn("Prisma user fetch error, using in-memory store:", e);
  }

  if (role) {
    return IN_MEMORY_USERS.filter((u) => u.role === role);
  }
  return IN_MEMORY_USERS;
}

export async function createUser(data: Partial<UserAccount>): Promise<UserAccount> {
  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    name: data.name || "New User",
    email: data.email || `user${Date.now()}@cucaso.org`,
    phone: data.phone || "+254 700 000000",
    role: data.role || "CHAPTER_REP",
    roleTitle: data.roleTitle || (data.role === "SUPER_ADMIN" ? "Super Administrator" : data.role === "CENTRAL_TREASURER" ? "Council Treasurer" : data.role === "SECRETARY" ? "Organization Secretary" : "Chapter Representative"),
    chapterId: data.chapterId,
    chapterName: data.chapterName,
    status: data.status || "ACTIVE",
    totpEnabled: data.totpEnabled || false,
    lastActive: "Just now",
  };

  try {
    const created = await prisma.user.create({
      data: {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$dummyhash",
        role: newUser.role as any,
        chapterId: newUser.chapterId || null,
        totpEnabled: newUser.totpEnabled,
        isActive: newUser.status === "ACTIVE",
      },
    });
    newUser.id = created.id;
  } catch (e) {
    console.warn("Prisma user create error, saved to in-memory store:", e);
  }

  IN_MEMORY_USERS = [newUser, ...IN_MEMORY_USERS];
  return newUser;
}

export async function updateUser(id: string, updates: Partial<UserAccount>): Promise<UserAccount | null> {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.email ? { email: updates.email } : {}),
        ...(updates.phone ? { phone: updates.phone } : {}),
        ...(updates.role ? { role: updates.role as any } : {}),
        ...(updates.chapterId !== undefined ? { chapterId: updates.chapterId || null } : {}),
        ...(updates.status !== undefined ? { isActive: updates.status === "ACTIVE" } : {}),
        ...(updates.totpEnabled !== undefined ? { totpEnabled: updates.totpEnabled } : {}),
      },
    });
  } catch (e) {
    console.warn("Prisma user update error, updating in-memory store:", e);
  }

  const idx = IN_MEMORY_USERS.findIndex((u) => u.id === id);
  if (idx !== -1) {
    IN_MEMORY_USERS[idx] = { ...IN_MEMORY_USERS[idx], ...updates };
    return IN_MEMORY_USERS[idx];
  }
  return null;
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({ where: { id } });
  } catch (e) {
    console.warn("Prisma user delete error, deleting in-memory store:", e);
  }

  const prevLen = IN_MEMORY_USERS.length;
  IN_MEMORY_USERS = IN_MEMORY_USERS.filter((u) => u.id !== id);
  return IN_MEMORY_USERS.length < prevLen;
}
