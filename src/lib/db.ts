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
  NewsPost,
  ResourceDocument,
} from "@/types";
import {
  MEMBER_CHAPTERS as INITIAL_CHAPTERS,
  CURRENT_RALLY as INITIAL_RALLY,
  RALLY_COST_ITEMS,
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

export async function getCurrentRally(): Promise<Rally | null> {
  try {
    // Check FIRST if rally was intentionally deleted by admin
    const deletedSetting = await prisma.systemSetting.findUnique({
      where: { key: "rally_deleted" },
    }).catch(() => null);

    if (deletedSetting?.value === "true") {
      return null;
    }

    let rally = await prisma.rally.findFirst({
      include: { venue: true, costItems: true },
      orderBy: { createdAt: "desc" },
    });

    if (!rally) {
      // Auto-seed initial rally so the database has live persistent records
      try {
        let venue = await prisma.venue.findFirst({
          where: { name: INITIAL_RALLY.venueName },
        });
        if (!venue) {
          venue = await prisma.venue.create({
            data: {
              name: INITIAL_RALLY.venueName,
              location: INITIAL_RALLY.venueLocation,
              capacity: INITIAL_RALLY.capacity || 3000,
            },
          });
        }

        rally = await prisma.rally.create({
          data: {
            code: INITIAL_RALLY.code,
            title: INITIAL_RALLY.title,
            theme: INITIAL_RALLY.theme,
            venueId: venue.id,
            capacity: INITIAL_RALLY.capacity,
            startDate: new Date(INITIAL_RALLY.startDate),
            endDate: new Date(INITIAL_RALLY.endDate),
            registrationDeadline: new Date(INITIAL_RALLY.registrationDeadline),
            paymentDeadline: new Date(INITIAL_RALLY.paymentDeadline),
            feeLockDate: new Date(INITIAL_RALLY.feeLockDate),
            state: INITIAL_RALLY.state as any,
            allocationMode: (INITIAL_RALLY.allocationMode as any) || "CAPABILITY_WEIGHTED",
            contingencyBasisPoints: (INITIAL_RALLY.contingencyPercent || 10) * 100,
            programmeJson: JSON.stringify(INITIAL_RALLY.programme ?? []),
            venueAccessJson: JSON.stringify(INITIAL_RALLY.venueAccess ?? {}),
            feesInfoJson: JSON.stringify(INITIAL_RALLY.feesAndCapitation ?? {}),
          },
          include: { venue: true, costItems: true },
        });

        // Seed initial cost items
        if (RALLY_COST_ITEMS && RALLY_COST_ITEMS.length > 0) {
          await prisma.costItem.createMany({
            data: RALLY_COST_ITEMS.map((c) => ({
              rallyId: rally!.id,
              category: c.category as any,
              name: c.name,
              type: c.type as any,
              amountKes: c.amount,
              quantity: c.quantity || 1,
              notes: c.notes || null,
            })),
          }).catch(() => {});
        }
      } catch (seedErr) {
        console.warn("Could not auto-seed rally in DB, returning fallback:", seedErr);
        return INITIAL_RALLY;
      }
    }

    if (!rally) return null;

    let parsedProgramme = INITIAL_RALLY.programme;
    if (rally.programmeJson) {
      try {
        parsedProgramme = JSON.parse(rally.programmeJson);
      } catch {}
    }

    let parsedVenueAccess = INITIAL_RALLY.venueAccess;
    if (rally.venueAccessJson) {
      try {
        parsedVenueAccess = JSON.parse(rally.venueAccessJson);
      } catch {}
    }

    let parsedFeesAndCapitation = INITIAL_RALLY.feesAndCapitation;
    if (rally.feesInfoJson) {
      try {
        parsedFeesAndCapitation = JSON.parse(rally.feesInfoJson);
      } catch {}
    }

    const costItems = rally.costItems && rally.costItems.length > 0
      ? rally.costItems.map((c: any) => ({
          id: c.id,
          rallyId: c.rallyId,
          category: c.category as any,
          name: c.name,
          type: c.type as any,
          amount: c.amountKes,
          quantity: c.quantity,
          notes: c.notes ?? undefined,
        }))
      : undefined;

    return {
      id: rally.id,
      code: rally.code,
      title: rally.title,
      theme: rally.theme ?? "",
      venueName: rally.venue?.name || INITIAL_RALLY.venueName,
      venueLocation: rally.venue?.location || INITIAL_RALLY.venueLocation,
      capacity: rally.capacity,
      startDate: rally.startDate ? rally.startDate.toISOString().split("T")[0] : INITIAL_RALLY.startDate,
      endDate: rally.endDate ? rally.endDate.toISOString().split("T")[0] : INITIAL_RALLY.endDate,
      registrationDeadline: rally.registrationDeadline ? rally.registrationDeadline.toISOString().split("T")[0] : INITIAL_RALLY.registrationDeadline,
      paymentDeadline: rally.paymentDeadline ? rally.paymentDeadline.toISOString().split("T")[0] : INITIAL_RALLY.paymentDeadline,
      feeLockDate: rally.feeLockDate ? rally.feeLockDate.toISOString().split("T")[0] : INITIAL_RALLY.feeLockDate,
      state: rally.state as Rally["state"],
      allocationMode: rally.allocationMode as Rally["allocationMode"],
      contingencyPercent: Math.round((rally.contingencyBasisPoints || 1000) / 100),
      posterUrl: (rally as any).posterUrl ?? undefined,
      programme: parsedProgramme,
      venueAccess: parsedVenueAccess,
      feesAndCapitation: parsedFeesAndCapitation,
      costItems,
    };
  } catch (err) {
    console.error("getCurrentRally error:", err);
    return INITIAL_RALLY;
  }
}

export async function updateCurrentRally(updates: Partial<Rally>): Promise<Rally> {
  // Clear the deleted flag whenever an admin saves/updates a rally
  await prisma.systemSetting.upsert({
    where: { key: "rally_deleted" },
    update: { value: "false" },
    create: { key: "rally_deleted", value: "false" },
  }).catch(() => {});

  let current = await prisma.rally.findFirst({
    include: { venue: true },
    orderBy: { createdAt: "desc" },
  });

  // If no rally exists in DB, upsert by creating a new rally with updates merged
  if (!current) {
    return createRally({
      ...INITIAL_RALLY,
      ...updates,
    });
  }

  // Update venue details if venueName or venueLocation supplied
  if (updates.venueName || updates.venueLocation) {
    await prisma.venue.update({
      where: { id: current.venueId },
      data: {
        ...(updates.venueName ? { name: updates.venueName } : {}),
        ...(updates.venueLocation ? { location: updates.venueLocation } : {}),
      },
    }).catch(() => {});
  }

  // Build Prisma Rally update object
  const data: any = {};
  if (updates.title) data.title = updates.title;
  if (updates.theme !== undefined) data.theme = updates.theme;
  if (updates.capacity !== undefined) data.capacity = Number(updates.capacity);
  if (updates.startDate) data.startDate = new Date(updates.startDate);
  if (updates.endDate) data.endDate = new Date(updates.endDate);
  if (updates.registrationDeadline) data.registrationDeadline = new Date(updates.registrationDeadline);
  if (updates.paymentDeadline) data.paymentDeadline = new Date(updates.paymentDeadline);
  if (updates.feeLockDate) data.feeLockDate = new Date(updates.feeLockDate);
  if (updates.state) data.state = updates.state;
  if (updates.allocationMode) data.allocationMode = updates.allocationMode;
  if (updates.contingencyPercent !== undefined) {
    data.contingencyBasisPoints = Math.round(Number(updates.contingencyPercent) * 100);
  }

  // Poster image URL
  if (updates.posterUrl !== undefined) {
    data.posterUrl = updates.posterUrl;
  }
  // Dynamic content JSON
  if (updates.programme !== undefined) {
    data.programmeJson = JSON.stringify(updates.programme);
  }
  if (updates.venueAccess !== undefined) {
    data.venueAccessJson = JSON.stringify(updates.venueAccess);
  }
  if (updates.feesAndCapitation !== undefined) {
    data.feesInfoJson = JSON.stringify(updates.feesAndCapitation);
  }

  await prisma.rally.update({
    where: { id: current.id },
    data,
  });

  // Record Audit Trail
  await prisma.auditLog.create({
    data: {
      actor: "Executive Council / Admin",
      action: "RALLY_UPDATED",
      entityType: "Rally",
      entityId: current.id,
      afterJson: JSON.stringify(updates),
    },
  }).catch(() => {});

  const updatedRally = await getCurrentRally();
  return updatedRally || (INITIAL_RALLY as Rally);
}

export async function createRally(data: Partial<Rally>): Promise<Rally> {
  // Clear the deleted flag
  await prisma.systemSetting.upsert({
    where: { key: "rally_deleted" },
    update: { value: "false" },
    create: { key: "rally_deleted", value: "false" },
  }).catch(() => {});

  let venue = await prisma.venue.findFirst({
    where: { name: data.venueName || "Mombasa Sports Complex" },
  });
  if (!venue) {
    venue = await prisma.venue.create({
      data: {
        name: data.venueName || "Convention Grounds",
        location: data.venueLocation || "Coast Region, Kenya",
        capacity: data.capacity || 3000,
      },
    });
  }

  const code = data.code || `CUR-${new Date().getFullYear() + 1}`;
  await prisma.rally.create({
    data: {
      code,
      title: data.title || "New Coastal Rally",
      theme: data.theme || "",
      venueId: venue.id,
      capacity: data.capacity ? Number(data.capacity) : 3000,
      startDate: data.startDate ? new Date(data.startDate) : new Date("2027-05-15T08:00:00Z"),
      endDate: data.endDate ? new Date(data.endDate) : new Date("2027-05-17T17:00:00Z"),
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : new Date("2027-05-01T23:59:59Z"),
      paymentDeadline: data.paymentDeadline ? new Date(data.paymentDeadline) : new Date("2027-05-10T23:59:59Z"),
      feeLockDate: data.feeLockDate ? new Date(data.feeLockDate) : new Date("2027-05-01T23:59:59Z"),
      state: (data.state as any) || "DRAFT",
      posterUrl: data.posterUrl || null,
      programmeJson: data.programme ? JSON.stringify(data.programme) : null,
      venueAccessJson: data.venueAccess ? JSON.stringify(data.venueAccess) : null,
      feesInfoJson: data.feesAndCapitation ? JSON.stringify(data.feesAndCapitation) : null,
    },
  });

  const createdRally = await getCurrentRally();
  return createdRally || (INITIAL_RALLY as Rally);
}

export async function deleteRally(id?: string): Promise<boolean> {
  try {
    let targetRally = null;
    if (id && id.trim()) {
      targetRally = await prisma.rally.findUnique({ where: { id } }).catch(() => null);
      if (!targetRally) {
        targetRally = await prisma.rally.findFirst({
          where: { OR: [{ code: id }, { title: id }] },
        }).catch(() => null);
      }
    }
    if (!targetRally) {
      targetRally = await prisma.rally.findFirst({ orderBy: { createdAt: "desc" } }).catch(() => null);
    }

    if (targetRally) {
      const targetRallyId = targetRally.id;

      // 1. Fee adjustments
      await prisma.feeAdjustment.deleteMany({ where: { rallyId: targetRallyId } }).catch(() => {});
      // 2. Cost items
      await prisma.costItem.deleteMany({ where: { rallyId: targetRallyId } }).catch(() => {});
      // 3. Participations
      await prisma.rallyChapterParticipation.deleteMany({ where: { rallyId: targetRallyId } }).catch(() => {});

      // 4. Invoices and payments
      const invs = await prisma.invoice.findMany({ where: { rallyId: targetRallyId }, select: { id: true } }).catch(() => []);
      const invIds = invs.map((i: any) => i.id);
      if (invIds.length > 0) {
        await prisma.payment.deleteMany({ where: { invoiceId: { in: invIds } } }).catch(() => {});
        await prisma.invoice.deleteMany({ where: { id: { in: invIds } } }).catch(() => {});
      }

      // 5. Attendees & guardian consents
      const atts = await prisma.attendee.findMany({ where: { rallyId: targetRallyId }, select: { id: true } }).catch(() => []);
      const attIds = atts.map((a: any) => a.id);
      if (attIds.length > 0) {
        await prisma.guardianConsent.deleteMany({ where: { attendeeId: { in: attIds } } }).catch(() => {});
        await prisma.attendee.deleteMany({ where: { rallyId: targetRallyId } }).catch(() => {});
      }

      // 6. Audit logs
      await prisma.auditLog.deleteMany({ where: { entityId: targetRallyId } }).catch(() => {});

      // 7. Finally delete the rally
      await prisma.rally.delete({ where: { id: targetRallyId } }).catch(() => {});
    }

    // Set deleted flag so system doesn't auto-reseed until created or updated
    await prisma.systemSetting.upsert({
      where: { key: "rally_deleted" },
      update: { value: "true" },
      create: { key: "rally_deleted", value: "true" },
    }).catch(() => {});

    return true;
  } catch (error) {
    console.error("Error deleting rally:", error);
    return false;
  }
}

// ─── RALLY TIMELINE & ARCHIVES (HISTORY) ────────────────────────────────────

export const DEFAULT_RALLY_HISTORY = [
  { id: "hist-2024", title: "Coastal Unity Rally 2024", venue: "Mombasa Sports Complex", date: "Nov 2024", status: "Completed", statusClass: "bg-slate-200 text-slate-700", attendees: "2,105" },
  { id: "hist-2025-mid", title: "Coast Fellowship Rally 2025 (Mid-Year)", venue: "Pwani University Grounds, Kilifi", date: "Jun 2025", status: "Completed", statusClass: "bg-slate-200 text-slate-700", attendees: "1,880" },
  { id: "hist-2025", title: "Coastal Unity Rally 2025", venue: "Mombasa Sports Complex", date: "Nov 2025", status: "Completed", statusClass: "bg-slate-200 text-slate-700", attendees: "2,310" },
  { id: "hist-2026", title: "Coastal Unity Rally 2026", venue: "Mombasa Sports Complex", date: "Nov 15–17, 2026", status: "Active", statusClass: "bg-emerald-100 text-emerald-800 border border-emerald-300", attendees: "2,486 (ongoing)" },
  { id: "hist-2027", title: "Kilifi Fellowship Rally 2027", venue: "Pwani University Grounds", date: "May 2027", status: "Planned", statusClass: "bg-amber-100 text-amber-800", attendees: "—" },
];

export async function getRallyHistory(): Promise<any[]> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "rally_history_list" },
    });
    if (!setting) {
      // First time initialization — persist defaults into DB
      await prisma.systemSetting.create({
        data: {
          key: "rally_history_list",
          value: JSON.stringify(DEFAULT_RALLY_HISTORY),
        },
      });
      return DEFAULT_RALLY_HISTORY;
    }
    return JSON.parse(setting.value || "[]");
  } catch (err) {
    console.error("getRallyHistory error:", err);
    return DEFAULT_RALLY_HISTORY;
  }
}

export async function saveRallyHistory(history: any[]): Promise<any[]> {
  try {
    await prisma.systemSetting.upsert({
      where: { key: "rally_history_list" },
      update: { value: JSON.stringify(history) },
      create: { key: "rally_history_list", value: JSON.stringify(history) },
    });
    return history;
  } catch (err) {
    console.error("saveRallyHistory error:", err);
    return history;
  }
}

export async function deleteRallyHistoryItem(idOrTitle: string): Promise<any[]> {
  const current = await getRallyHistory();
  const filtered = current.filter((r: any) => r.id !== idOrTitle && r.title !== idOrTitle);
  return saveRallyHistory(filtered);
}

export async function addRallyHistoryItem(item: any): Promise<any[]> {
  const current = await getRallyHistory();
  const newItem = {
    id: item.id || `hist-${Date.now()}`,
    title: item.title || "New Coastal Rally",
    venue: item.venue || "Mombasa Sports Complex",
    date: item.date || "TBD",
    status: item.status || "Planned",
    statusClass: item.statusClass || "bg-amber-100 text-amber-800",
    attendees: item.attendees || "—",
  };
  const updated = [newItem, ...current];
  return saveRallyHistory(updated);
}




// ─── COST ITEMS ──────────────────────────────────────────────────────────────

function mapCostItem(c: any): import("@/types").CostItem {
  return {
    id: c.id,
    rallyId: c.rallyId,
    category: c.category,
    name: c.name,
    type: c.type as import("@/types").CostItem["type"],
    amount: c.amountKes,
    quantity: c.quantity ?? 1,
    notes: c.notes ?? undefined,
  };
}

export async function getCostItems(rallyId?: string): Promise<import("@/types").CostItem[]> {
  try {
    // Find the active rally if rallyId not given
    let targetRallyId = rallyId;
    if (!targetRallyId) {
      const rally = await prisma.rally.findFirst({ orderBy: { createdAt: "desc" } });
      targetRallyId = rally?.id;
    }

    if (!targetRallyId) {
      // No DB rally yet — return seeded static data
      return RALLY_COST_ITEMS.map((c, i) => ({ ...c, id: c.id || `static-${i}` }));
    }

    let items = await prisma.costItem.findMany({
      where: { rallyId: targetRallyId },
      orderBy: { createdAt: "asc" },
    });

    // Check if this rally has ever been initialized with default cost items
    const seededSetting = await prisma.systemSetting.findUnique({
      where: { key: `cost_items_seeded_${targetRallyId}` },
    }).catch(() => null);

    // Auto-seed only on very first initialization (if not yet seeded)
    if (items.length === 0 && !seededSetting) {
      await prisma.costItem.createMany({
        data: RALLY_COST_ITEMS.map((c) => ({
          rallyId: targetRallyId!,
          category: c.category as any,
          name: c.name,
          type: c.type as any,
          amountKes: c.amount,
          quantity: c.quantity ?? 1,
          notes: c.notes ?? null,
        })),
        skipDuplicates: true,
      }).catch(() => {});

      await prisma.systemSetting.create({
        data: { key: `cost_items_seeded_${targetRallyId}`, value: "true" },
      }).catch(() => {});

      items = await prisma.costItem.findMany({
        where: { rallyId: targetRallyId },
        orderBy: { createdAt: "asc" },
      });
    }

    return items.map(mapCostItem);
  } catch (err) {
    console.error("getCostItems error:", err);
    return RALLY_COST_ITEMS;
  }
}

export async function resetCostItems(rallyId?: string): Promise<import("@/types").CostItem[]> {
  try {
    let targetRallyId = rallyId;
    if (!targetRallyId) {
      const rally = await prisma.rally.findFirst({ orderBy: { createdAt: "desc" } });
      targetRallyId = rally?.id;
    }
    if (!targetRallyId) return RALLY_COST_ITEMS;

    // Delete existing cost items for this rally
    await prisma.costItem.deleteMany({ where: { rallyId: targetRallyId } });

    // Re-seed standard template
    await prisma.costItem.createMany({
      data: RALLY_COST_ITEMS.map((c) => ({
        rallyId: targetRallyId!,
        category: c.category as any,
        name: c.name,
        type: c.type as any,
        amountKes: c.amount,
        quantity: c.quantity ?? 1,
        notes: c.notes ?? null,
      })),
    });

    await prisma.systemSetting.upsert({
      where: { key: `cost_items_seeded_${targetRallyId}` },
      update: { value: "true" },
      create: { key: `cost_items_seeded_${targetRallyId}`, value: "true" },
    }).catch(() => {});

    await prisma.auditLog.create({
      data: {
        actor: "Executive Council / Admin",
        action: "COST_ITEMS_RESET_TEMPLATE",
        entityType: "CostItem",
        entityId: targetRallyId,
        afterJson: JSON.stringify({ reset: true, count: RALLY_COST_ITEMS.length }),
      },
    }).catch(() => {});

    const items = await prisma.costItem.findMany({
      where: { rallyId: targetRallyId },
      orderBy: { createdAt: "asc" },
    });
    return items.map(mapCostItem);
  } catch (err) {
    console.error("resetCostItems error:", err);
    return getCostItems(rallyId);
  }
}


export async function createCostItem(data: {
  rallyId?: string;
  category: string;
  name: string;
  type: "FIXED" | "PER_HEAD" | "PER_VEHICLE";
  amount: number;
  quantity?: number;
  notes?: string;
}): Promise<import("@/types").CostItem> {
  let rallyId = data.rallyId;
  if (!rallyId) {
    const rally = await prisma.rally.findFirst({ orderBy: { createdAt: "desc" } });
    rallyId = rally?.id;
  }
  if (!rallyId) throw new Error("No active rally found");

  const created = await prisma.costItem.create({
    data: {
      rallyId,
      category: data.category as any,
      name: data.name,
      type: data.type as any,
      amountKes: Math.round(data.amount),
      quantity: data.quantity ?? 1,
      notes: data.notes ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actor: "Executive Council / Admin",
      action: "COST_ITEM_CREATED",
      entityType: "CostItem",
      entityId: created.id,
      afterJson: JSON.stringify({ name: created.name, type: created.type, amountKes: created.amountKes }),
    },
  }).catch(() => {});

  return mapCostItem(created);
}

export async function updateCostItem(id: string, data: {
  category?: string;
  name?: string;
  type?: "FIXED" | "PER_HEAD" | "PER_VEHICLE";
  amount?: number;
  quantity?: number;
  notes?: string;
}): Promise<import("@/types").CostItem | null> {
  const existing = await prisma.costItem.findUnique({ where: { id } });
  if (!existing) return null;

  const updated = await prisma.costItem.update({
    where: { id },
    data: {
      ...(data.category !== undefined ? { category: data.category as any } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.type !== undefined ? { type: data.type as any } : {}),
      ...(data.amount !== undefined ? { amountKes: Math.round(data.amount) } : {}),
      ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      actor: "Executive Council / Admin",
      action: "COST_ITEM_UPDATED",
      entityType: "CostItem",
      entityId: id,
      afterJson: JSON.stringify(data),
    },
  }).catch(() => {});

  return mapCostItem(updated);
}

export async function deleteCostItem(id: string): Promise<boolean> {
  try {
    await prisma.costItem.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        actor: "Executive Council / Admin",
        action: "COST_ITEM_DELETED",
        entityType: "CostItem",
        entityId: id,
        afterJson: JSON.stringify({ deleted: true }),
      },
    }).catch(() => {});
    return true;
  } catch (err) {
    console.error("deleteCostItem error:", err);
    return false;
  }
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

// ─── INVOICES & PAYMENTS SEEDING / PERSISTENCE ──────────────────────────────

export async function ensureInvoicesAndPaymentsSeeded() {
  try {
    const rally = await prisma.rally.findFirst();
    if (!rally) return;

    const chapters = await prisma.chapter.findMany({
      include: { institution: true },
    });
    if (chapters.length === 0) return;

    // Use upsert per-chapter so partial seeding states never cause unique constraint violations
    const initialInvoices = [
      { code: "TUM-01", id: "ch-tum", amountDue: 340000, paid: 340000, ref: "CUCASO-TUM-2026", invNum: "INV-2026-001" },
      { code: "PWANI-02", id: "ch-pwani", amountDue: 350000, paid: 350000, ref: "CUCASO-PWANI-2026", invNum: "INV-2026-002" },
      { code: "MPOLY-03", id: "ch-mpoly", amountDue: 210000, paid: 140000, ref: "CUCASO-MPOLY-2026", invNum: "INV-2026-003" },
      { code: "KMTC-04", id: "ch-kmtc", amountDue: 220000, paid: 220000, ref: "CUCASO-KMTC-2026", invNum: "INV-2026-004" },
      { code: "TTU-06", id: "ch-ttu", amountDue: 240000, paid: 240000, ref: "CUCASO-TTU-2026", invNum: "INV-2026-006" },
      { code: "GAR-07", id: "ch-garissa", amountDue: 200000, paid: 200000, ref: "CUCASO-GAR-2026", invNum: "INV-2026-007" },
      { code: "KWL-08", id: "ch-kwale", amountDue: 150000, paid: 150000, ref: "CUCASO-KWL-2026", invNum: "INV-2026-008" },
      { code: "MSS-10", id: "ch-mss", amountDue: 70000, paid: 70000, ref: "CUCASO-MSS-2026", invNum: "INV-2026-010" },
      { code: "KCA-11", id: "ch-kca", amountDue: 120000, paid: 120000, ref: "CUCASO-KCA-2026", invNum: "INV-2026-011" },
      { code: "MAL-12", id: "ch-mal", amountDue: 60000, paid: 60000, ref: "CUCASO-MAL-2026", invNum: "INV-2026-012" },
    ];

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      // Skip if this chapter already has an invoice — never double-create
      const existing = await prisma.invoice.findFirst({ where: { chapterId: ch.id } });
      if (existing) continue;

      const match = initialInvoices.find(init => init.id === ch.id || init.code === ch.code);
      const amountDue = match ? match.amountDue : 150000;
      const amountPaid = match ? match.paid : 0;
      const balance = Math.max(0, amountDue - amountPaid);
      const status = balance === 0 ? "PAID" : amountPaid > 0 ? "PARTIAL" : "UNPAID";
      const cleanCode = (ch.code || `CH${i + 1}`).replace(/[^A-Za-z0-9]/g, "");
      const invNumber = match ? match.invNum : `INV-2026-${String(i + 1).padStart(3, "0")}`;
      const payRef = match ? match.ref : `CUCASO-${cleanCode}-2026`;

      // Use upsert keyed on invoiceNumber to handle any concurrent/partial seeding
      await prisma.invoice.upsert({
        where: { invoiceNumber: invNumber },
        update: {},  // already exists — leave it as-is
        create: {
          invoiceNumber: invNumber,
          rallyId: rally.id,
          chapterId: ch.id,
          baseAmountKes: amountDue,
          adjustmentKes: 0,
          totalDueKes: amountDue,
          amountPaidKes: amountPaid,
          balanceKes: balance,
          status: status as any,
          paymentReference: payRef,
          dueDate: new Date("2026-11-10"),
        },
      });
    }

    const payCount = await prisma.payment.count();
    if (payCount === 0) {
      const allInvoices = await prisma.invoice.findMany();
      const invoiceRefMap = new Map<string, string>();
      for (const inv of allInvoices) {
        invoiceRefMap.set(inv.paymentReference, inv.id);
        invoiceRefMap.set(inv.chapterId, inv.id);
      }

      const samplePayments = [
        {
          chapterId: "ch-tum",
          ref: "CUCASO-TUM-2026",
          amount: 340000,
          channel: "MPESA_C2B",
          receipt: "QEJ8291X0K",
          payer: "David Kiboi (TUM Treasurer)",
          phone: "+254 722 445 566",
          status: "MATCHED",
          time: new Date("2026-09-12T14:22:10Z"),
        },
        {
          chapterId: "ch-pwani",
          ref: "CUCASO-PWANI-2026",
          amount: 350000,
          channel: "BANK_TRANSFER",
          receipt: "KCB-FT-994012",
          payer: "Mercy Chebet (Pwani Treasury)",
          status: "MATCHED",
          time: new Date("2026-09-10T10:15:00Z"),
        },
        {
          chapterId: "ch-kmtc",
          ref: "CUCASO-KMTC-2026",
          amount: 220000,
          channel: "MPESA_C2B",
          receipt: "QEH3390A1L",
          payer: "Evans Kilonzo",
          status: "MATCHED",
          time: new Date("2026-09-08T16:45:12Z"),
        },
        {
          chapterId: "ch-mpoly",
          ref: "CUCASO-MPOLY-2026",
          amount: 140000,
          channel: "MPESA_C2B",
          receipt: "QEG1124M9T",
          payer: "Peter Ochieng",
          status: "MATCHED",
          time: new Date("2026-09-11T11:30:40Z"),
        },
        {
          chapterId: "ch-ttu",
          ref: "CUCASO-TTU-2026",
          amount: 240000,
          channel: "BANK_TRANSFER",
          receipt: "EQU-TR-882190",
          payer: "Collins Mwachofi",
          status: "MATCHED",
          time: new Date("2026-09-07T09:20:00Z"),
        },
        {
          chapterId: "ch-garissa",
          ref: "CUCASO-GAR-2026",
          amount: 200000,
          channel: "MPESA_C2B",
          receipt: "QEF4491Z2W",
          payer: "Ahmed Baraka",
          status: "MATCHED",
          time: new Date("2026-09-05T13:12:00Z"),
        },
        {
          chapterId: "ch-kwale",
          ref: "CUCASO-KWL-2026",
          amount: 150000,
          channel: "MPESA_C2B",
          receipt: "QEE3381Y3V",
          payer: "Faith Mwende",
          status: "MATCHED",
          time: new Date("2026-09-04T15:40:00Z"),
        },
        {
          chapterId: "ch-mss",
          ref: "CUCASO-MSS-2026",
          amount: 70000,
          channel: "MPESA_C2B",
          receipt: "QEC8891T4G",
          payer: "Joshua Baraza",
          status: "MATCHED",
          time: new Date("2026-09-02T10:05:00Z"),
        },
        {
          chapterId: "ch-kca",
          ref: "CUCASO-KCA-2026",
          amount: 120000,
          channel: "BANK_TRANSFER",
          receipt: "COOP-TX-440182",
          payer: "Daniel Katana",
          status: "MATCHED",
          time: new Date("2026-09-01T14:18:00Z"),
        },
        {
          chapterId: "ch-mal",
          ref: "CUCASO-MAL-2026",
          amount: 60000,
          channel: "MPESA_C2B",
          receipt: "QEA1192M2P",
          payer: "Grace Sidi",
          status: "MATCHED",
          time: new Date("2026-08-30T11:45:00Z"),
        },
        // 1 UNMATCHED transaction (PRD un-reconciled Paybill transaction)
        {
          chapterId: null,
          ref: "RALLY-CONTRIB-4082200",
          amount: 50000,
          channel: "MPESA_C2B",
          receipt: "QEX9901Z1A",
          payer: "Unknown Sender (+254 712 998877)",
          phone: "+254 712 998877",
          status: "UNMATCHED",
          time: new Date("2026-09-13T09:15:22Z"),
        },
      ];

      for (const p of samplePayments) {
        let invId: string | null = null;
        if (p.ref && invoiceRefMap.has(p.ref)) {
          invId = invoiceRefMap.get(p.ref) || null;
        } else if (p.chapterId && invoiceRefMap.has(p.chapterId)) {
          invId = invoiceRefMap.get(p.chapterId) || null;
        }

        await prisma.payment.create({
          data: {
            invoiceId: invId,
            accountReference: p.ref,
            amountKes: p.amount,
            channel: p.channel as any,
            mpesaReceiptNumber: p.receipt,
            senderName: p.payer,
            senderPhone: p.phone ?? null,
            status: p.status as any,
            transactionTime: p.time,
          },
        });
      }
    }
  } catch (err) {
    console.error("ensureInvoicesAndPaymentsSeeded failed:", err);
  }
}

// ─── INVOICES ────────────────────────────────────────────────────────────────

export async function getInvoices(): Promise<Invoice[]> {
  await ensureInvoicesAndPaymentsSeeded();
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
  await ensureInvoicesAndPaymentsSeeded();
  const payments = await prisma.payment.findMany({
    include: {
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return payments.map(mapPayment);
}

export async function createPayment(payData: Partial<Payment>): Promise<Payment> {
  await ensureInvoicesAndPaymentsSeeded();

  let invoiceId = payData.invoiceId || "";
  
  // If invoiceId wasn't directly passed, find by paymentReference, invoiceNumber, or chapter code
  if (!invoiceId && payData.reference) {
    const cleanRef = payData.reference.trim();
    const inv = await prisma.invoice.findFirst({
      where: {
        OR: [
          { paymentReference: cleanRef },
          { paymentReference: { contains: cleanRef } },
          { invoiceNumber: cleanRef },
        ],
      },
    });
    if (inv) {
      invoiceId = inv.id;
    }
  }

  // Determine channel
  let channel = "MPESA_C2B";
  const refCode = (payData.mpesaReceiptNumber || payData.reference || "").toUpperCase();
  if (payData.method === "BANK_TRANSFER" || refCode.startsWith("KCB") || refCode.startsWith("EQU") || refCode.startsWith("COOP")) {
    channel = "BANK_TRANSFER";
  } else if (payData.method === "CASH") {
    channel = "CASH";
  }

  const status = invoiceId ? (payData.status || "MATCHED") : (payData.status || "UNMATCHED");
  const amount = Number(payData.amount || 0);

  const created = await prisma.payment.create({
    data: {
      invoiceId: invoiceId || null,
      accountReference: payData.reference || "RALLY-FEE",
      amountKes: amount,
      channel: channel as any,
      mpesaReceiptNumber: payData.mpesaReceiptNumber || `QBR${Math.floor(100000 + Math.random() * 900000)}`,
      senderName: payData.payerName ?? null,
      senderPhone: payData.payerPhone ?? null,
      status: status as any,
      transactionTime: new Date(),
    },
    include: { invoice: true },
  });

  if (invoiceId && status === "MATCHED") {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (invoice) {
      const newPaid = invoice.amountPaidKes + amount;
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

  await prisma.auditLog.create({
    data: {
      actor: payData.payerName || "Central Treasury System",
      action: "PAYMENT_RECORDED",
      entityType: "Payment",
      entityId: created.id,
      afterJson: JSON.stringify({ amount, receipt: created.mpesaReceiptNumber, invoiceId, status }),
    },
  }).catch(() => {});

  return mapPayment(created);
}

export async function matchPayment(paymentId: string, invoiceId: string): Promise<{ payment: Payment; invoice: Invoice }> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment record not found");

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { chapter: { include: { institution: true } } },
  });
  if (!invoice) throw new Error("Invoice record not found");

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      invoiceId: invoice.id,
      accountReference: invoice.paymentReference,
      status: "MATCHED",
    },
    include: { invoice: true },
  });

  const newPaid = invoice.amountPaidKes + payment.amountKes;
  const newBalance = Math.max(0, invoice.totalDueKes - newPaid);
  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      amountPaidKes: newPaid,
      balanceKes: newBalance,
      status: newBalance === 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID",
    },
    include: { chapter: { include: { institution: true } } },
  });

  await prisma.auditLog.create({
    data: {
      actor: "Central Treasury / Admin",
      action: "PAYMENT_RECONCILED",
      entityType: "Payment",
      entityId: paymentId,
      afterJson: JSON.stringify({ paymentId, invoiceId, amount: payment.amountKes, newBalance }),
    },
  }).catch(() => {});

  return { payment: mapPayment(updatedPayment), invoice: mapInvoice(updatedInvoice) };
}

export async function syncMpesaPayments(): Promise<{ synced: number; matched: number; message: string }> {
  await ensureInvoicesAndPaymentsSeeded();

  const unmatched = await prisma.payment.findMany({
    where: { status: "UNMATCHED" },
  });

  let matchedCount = 0;
  for (const pay of unmatched) {
    if (pay.accountReference) {
      const cleanRef = pay.accountReference.toUpperCase().replace(/\s+/g, "");
      const inv = await prisma.invoice.findFirst({
        where: {
          OR: [
            { paymentReference: { contains: cleanRef } },
            { invoiceNumber: { contains: cleanRef } },
          ],
        },
      });
      if (inv) {
        await matchPayment(pay.id, inv.id);
        matchedCount++;
      }
    }
  }

  await prisma.auditLog.create({
    data: {
      actor: "Central Treasury Automated Sync",
      action: "DARAJA_PAYBILL_SYNC",
      entityType: "Paybill_4082200",
      entityId: `sync-${Date.now()}`,
      afterJson: JSON.stringify({ syncedAt: new Date().toISOString(), matchedCount, totalChecked: unmatched.length }),
    },
  }).catch(() => {});

  return {
    synced: unmatched.length,
    matched: matchedCount,
    message: `Daraja Paybill 4082200 verified: ${matchedCount} transaction(s) auto-reconciled against chapter invoices.`,
  };
}

// ─── PAYMENT / INVOICE MANAGEMENT ────────────────────────────────────────────

export async function deletePayment(paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found");

  // If this payment was matched to an invoice, reverse the invoice amounts
  if (payment.invoiceId && payment.status === "MATCHED") {
    const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
    if (invoice) {
      const newPaid = Math.max(0, invoice.amountPaidKes - payment.amountKes);
      const newBalance = Math.max(0, invoice.totalDueKes - newPaid);
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          amountPaidKes: newPaid,
          balanceKes: newBalance,
          status: newBalance === 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID",
        },
      });
    }
  }

  await prisma.payment.delete({ where: { id: paymentId } });

  await prisma.auditLog.create({
    data: {
      actor: "Admin",
      action: "PAYMENT_DELETED",
      entityType: "Payment",
      entityId: paymentId,
      afterJson: JSON.stringify({ deletedAt: new Date().toISOString() }),
    },
  }).catch(() => {});
}

export async function updatePayment(
  paymentId: string,
  data: { amount?: number; payerName?: string; reference?: string; mpesaReceiptNumber?: string; method?: string; notes?: string }
): Promise<Payment> {
  const existing = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!existing) throw new Error("Payment not found");

  const updateData: Record<string, unknown> = {};
  if (data.amount !== undefined) updateData.amountKes = Math.round(data.amount);
  if (data.payerName !== undefined) updateData.senderName = data.payerName;
  if (data.reference !== undefined) updateData.accountReference = data.reference;
  if (data.mpesaReceiptNumber !== undefined) updateData.mpesaReceiptNumber = data.mpesaReceiptNumber;
  if (data.method !== undefined) {
    const channelMap: Record<string, "MPESA_C2B" | "MPESA_STK" | "BANK_TRANSFER" | "CASH"> = {
      MPESA_C2B: "MPESA_C2B",
      MPESA_STK: "MPESA_STK",
      BANK_TRANSFER: "BANK_TRANSFER",
      CASH: "CASH",
      MPESA: "MPESA_C2B",
      BANK: "BANK_TRANSFER",
    };
    if (channelMap[data.method]) {
      updateData.channel = channelMap[data.method];
    }
  }

  // If amount changed and was matched, update the linked invoice
  if (data.amount !== undefined && existing.invoiceId && existing.status === "MATCHED") {
    const invoice = await prisma.invoice.findUnique({ where: { id: existing.invoiceId } });
    if (invoice) {
      const oldPaid = invoice.amountPaidKes;
      const newPaid = Math.max(0, oldPaid - existing.amountKes + Math.round(data.amount));
      const newBalance = Math.max(0, invoice.totalDueKes - newPaid);
      await prisma.invoice.update({
        where: { id: existing.invoiceId },
        data: {
          amountPaidKes: newPaid,
          balanceKes: newBalance,
          status: newBalance === 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID",
        },
      });
    }
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: updateData,
    include: { invoice: true },
  });

  await prisma.auditLog.create({
    data: {
      actor: "Admin",
      action: "PAYMENT_UPDATED",
      entityType: "Payment",
      entityId: paymentId,
      afterJson: JSON.stringify(data),
    },
  }).catch(() => {});

  return mapPayment(updated);
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new Error("Invoice not found");

  // Unlink any payments tied to this invoice first
  await prisma.payment.updateMany({
    where: { invoiceId },
    data: { invoiceId: null, status: "UNMATCHED" },
  });

  await prisma.invoice.delete({ where: { id: invoiceId } });

  await prisma.auditLog.create({
    data: {
      actor: "Admin",
      action: "INVOICE_DELETED",
      entityType: "Invoice",
      entityId: invoiceId,
      afterJson: JSON.stringify({ deletedAt: new Date().toISOString() }),
    },
  }).catch(() => {});
}

export async function updateInvoice(
  invoiceId: string,
  data: { amountDue?: number; amountPaid?: number; dueDate?: string; status?: string; notes?: string }
): Promise<Invoice> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { chapter: { include: { institution: true } } },
  });
  if (!invoice) throw new Error("Invoice not found");

  const updateData: Record<string, unknown> = {};
  if (data.amountDue !== undefined) {
    updateData.totalDueKes = Math.round(data.amountDue);
  }
  if (data.amountPaid !== undefined) {
    updateData.amountPaidKes = Math.round(data.amountPaid);
  }
  if (data.dueDate !== undefined) {
    const raw = data.dueDate?.trim();
    if (raw) {
      const d = raw.includes("T") ? new Date(raw) : new Date(`${raw}T00:00:00.000Z`);
      if (!isNaN(d.getTime())) {
        updateData.dueDate = d;
      }
    }
  }

  // Recalculate balance and status
  const newDue = (data.amountDue !== undefined ? Math.round(data.amountDue) : invoice.totalDueKes);
  const newPaid = (data.amountPaid !== undefined ? Math.round(data.amountPaid) : invoice.amountPaidKes);
  const newBalance = Math.max(0, newDue - newPaid);
  updateData.balanceKes = newBalance;

  const validStatuses = ["UNPAID", "PARTIAL", "PAID", "OVERDUE", "OVERPAID"];
  if (data.status && validStatuses.includes(data.status)) {
    updateData.status = data.status;
  } else {
    updateData.status = newBalance === 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";
  }

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: updateData,
    include: { chapter: { include: { institution: true } } },
  });

  await prisma.auditLog.create({
    data: {
      actor: "Admin",
      action: "INVOICE_UPDATED",
      entityType: "Invoice",
      entityId: invoiceId,
      afterJson: JSON.stringify(data),
    },
  }).catch(() => {});

  return mapInvoice(updated);
}

export async function clearRallyInvoices(): Promise<{ cleared: number; message: string }> {
  // Unlink all matched payments from invoices (they keep payment history but invoices reset)
  await prisma.payment.updateMany({
    where: { status: "MATCHED" },
    data: { invoiceId: null, status: "UNMATCHED" },
  });

  const count = await prisma.invoice.count();
  await prisma.invoice.deleteMany({});

  await prisma.auditLog.create({
    data: {
      actor: "Admin",
      action: "INVOICES_CLEARED",
      entityType: "Invoice",
      entityId: "all",
      afterJson: JSON.stringify({ clearedAt: new Date().toISOString(), count }),
    },
  }).catch(() => {});

  return { cleared: count, message: `${count} invoice(s) cleared. Payment history retained.` };
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

// ─── NEWS & CMS ─────────────────────────────────────────────────────────────

let IN_MEMORY_NEWS: NewsPost[] = [
  {
    id: "news-1",
    slug: "q1-2026-spiritual-rally-venue",
    category: "ANNOUNCEMENT",
    title: "Administration Council Finalizes Q1 2026 Coastal Spiritual Rally Venue",
    summary: "Delegates from 12 member chapters will convene at Technical University of Mombasa (TUM) for an unforgettable weekend of faith, prayer, and choral ministry.",
    content: "The Executive Council is delighted to announce that after careful venue inspection and prayerful consideration, Technical University of Mombasa has been selected as the official host venue for the upcoming rally.",
    contentHtml: "<p>The Executive Council is delighted to announce that after careful venue inspection and prayerful consideration, Technical University of Mombasa has been selected as the official host venue for the upcoming rally.</p>",
    publishedAt: "2026-09-18",
    createdAt: "2026-09-18",
    author: "Secretariat & Comms Office",
    status: "PUBLISHED",
    readTime: "3 min read",
  },
  {
    id: "news-2",
    slug: "capability-weighted-capitation-framework",
    category: "FINANCE",
    title: "Central Treasury Publishes Capability-Weighted Capitation Framework",
    summary: "In accordance with PRD Section 6, the capability cost engine has been ratified to ensure fair financial sharing between large universities and technical institutes.",
    content: "The newly adopted tiered capitation framework guarantees that all chapters contribute proportionally to their institutional strength, eliminating unfair head-tax barriers.",
    contentHtml: "<p>The newly adopted tiered capitation framework guarantees that all chapters contribute proportionally to their institutional strength, eliminating unfair head-tax barriers.</p>",
    publishedAt: "2026-09-12",
    createdAt: "2026-09-12",
    author: "Central Treasurer",
    status: "PUBLISHED",
    readTime: "4 min read",
  },
  {
    id: "news-3",
    slug: "pastoral-letter-academic-pressures",
    category: "SPIRITUAL",
    title: "Pastoral Letter: Anchored in Faith Amidst Academic Pressures",
    summary: "A heartfelt message from the CUCASO Chaplaincy to all tertiary students preparing for continuous assessment tests and end-of-semester examinations.",
    content: "As exams approach across our coastal campuses, remember that your worth is found in Christ. Strive for academic excellence while keeping Sabbath holy.",
    contentHtml: "<p>As exams approach across our coastal campuses, remember that your worth is found in Christ. Strive for academic excellence while keeping Sabbath holy.</p>",
    publishedAt: "2026-09-05",
    createdAt: "2026-09-05",
    author: "Pastor Eric Musembi (Patron & Chaplain)",
    status: "PUBLISHED",
    readTime: "5 min read",
  },
  {
    id: "news-4",
    slug: "pwani-medical-camp-kilifi",
    category: "STORY",
    title: "Pwani University Chapter Holds Successful Medical Camp in Kilifi",
    summary: "Over 350 residents received free blood pressure screenings, optical checks, and Christian literature through joint student volunteer efforts.",
    content: "Student health volunteers from Pwani University spent Sunday morning providing medical checkups to the local community in Kilifi town.",
    contentHtml: "<p>Student health volunteers from Pwani University spent Sunday morning providing medical checkups to the local community in Kilifi town.</p>",
    publishedAt: "2026-08-28",
    createdAt: "2026-08-28",
    author: "Pwani SDA Comms Secretary",
    status: "PUBLISHED",
    readTime: "3 min read",
  }
];

export async function getNewsPosts(): Promise<NewsPost[]> {
  try {
    const posts = await prisma.cmsPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (posts.length > 0) {
      return posts.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        summary: p.summary ?? undefined,
        content: p.contentHtml,
        contentHtml: p.contentHtml,
        category: p.category,
        featuredImageUrl: p.featuredImageUrl ?? undefined,
        altText: p.altText ?? undefined,
        status: p.status,
        author: p.authorUserId || "Council Admin",
        publishedAt: p.publishedAt ? p.publishedAt.toISOString().split("T")[0] : undefined,
        createdAt: p.createdAt ? p.createdAt.toISOString().split("T")[0] : undefined,
      }));
    }
  } catch (e) {
    console.warn("Prisma cmsPost fetch error, using in-memory store:", e);
  }
  return IN_MEMORY_NEWS;
}

export async function createNewsPost(data: Partial<NewsPost>): Promise<NewsPost> {
  const slug = data.slug || (data.title || "post").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
  const newPost: NewsPost = {
    id: `post-${Date.now().toString(36)}`,
    slug,
    title: data.title || "Untitled Announcement",
    summary: data.summary || "",
    content: data.content || data.contentHtml || "",
    contentHtml: data.contentHtml || data.content || "",
    category: (data.category as any) || "NEWS",
    featuredImageUrl: data.featuredImageUrl,
    status: data.status || "PUBLISHED",
    author: data.author || "Council Admin",
    publishedAt: data.publishedAt || new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString().split("T")[0],
    readTime: data.readTime || "3 min read",
  };

  try {
    const validCategories = ["NEWS", "ANNOUNCEMENT", "STORY", "DEVOTIONAL", "TESTIMONY"];
    const cat = validCategories.includes(newPost.category) ? (newPost.category as any) : "NEWS";
    const created = await prisma.cmsPost.create({
      data: {
        slug: newPost.slug,
        title: newPost.title,
        summary: newPost.summary ?? null,
        contentHtml: newPost.content || "",
        category: cat,
        featuredImageUrl: newPost.featuredImageUrl ?? null,
        status: (newPost.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT") as any,
        authorUserId: newPost.author,
        publishedAt: new Date(),
      },
    });
    newPost.id = created.id;
  } catch (e) {
    console.warn("Prisma cmsPost create error, saved in-memory:", e);
  }

  IN_MEMORY_NEWS = [newPost, ...IN_MEMORY_NEWS];
  return newPost;
}

export async function updateNewsPost(id: string, updates: Partial<NewsPost>): Promise<NewsPost | null> {
  try {
    await prisma.cmsPost.update({
      where: { id },
      data: {
        ...(updates.title ? { title: updates.title } : {}),
        ...(updates.summary !== undefined ? { summary: updates.summary } : {}),
        ...(updates.content || updates.contentHtml ? { contentHtml: updates.content || updates.contentHtml } : {}),
        ...(updates.featuredImageUrl !== undefined ? { featuredImageUrl: updates.featuredImageUrl } : {}),
        ...(updates.status ? { status: updates.status as any } : {}),
      },
    });
  } catch (e) {
    console.warn("Prisma cmsPost update error:", e);
  }

  const idx = IN_MEMORY_NEWS.findIndex(p => p.id === id);
  if (idx !== -1) {
    IN_MEMORY_NEWS[idx] = { ...IN_MEMORY_NEWS[idx], ...updates };
    return IN_MEMORY_NEWS[idx];
  }
  return null;
}

export async function deleteNewsPost(id: string): Promise<boolean> {
  try {
    await prisma.cmsPost.delete({ where: { id } });
  } catch (e) {
    console.warn("Prisma cmsPost delete error:", e);
  }
  const prevLen = IN_MEMORY_NEWS.length;
  IN_MEMORY_NEWS = IN_MEMORY_NEWS.filter(p => p.id !== id);
  return IN_MEMORY_NEWS.length < prevLen;
}

// ─── DOCUMENTS & RESOURCES ───────────────────────────────────────────────────

let IN_MEMORY_DOCUMENTS: ResourceDocument[] = [
  {
    id: "doc-1",
    title: "CUCASO Official Constitution & Bylaws (Revised 2024)",
    description: "The supreme governing document of the Coastal Universities and Colleges Adventist Students Organization.",
    category: "CONSTITUTION",
    accessLevel: "PUBLIC",
    fileSize: "1.4 MB",
    mimeType: "application/pdf",
    url: "/resources/constitution.pdf",
    uploadedBy: "Executive Secretariat",
    createdAt: "2024-09-01",
  },
  {
    id: "doc-2",
    title: "Rally Financial Policy & Capability-Weighted Capitation Framework",
    description: "Official capitation model guidelines detailing institutional tiers, cost sharing formulas, and paybill remittance protocols.",
    category: "POLICY",
    accessLevel: "PUBLIC",
    fileSize: "820 KB",
    mimeType: "application/pdf",
    url: "/resources/financial-policy.pdf",
    uploadedBy: "Central Treasury",
    createdAt: "2024-08-15",
  },
  {
    id: "doc-3",
    title: "Chapter Chartering Application & Endorsement Guide",
    description: "Step-by-step checklist and institutional endorsement procedures for newly affiliated campus fellowships.",
    category: "FORM",
    accessLevel: "PUBLIC",
    fileSize: "540 KB",
    mimeType: "application/pdf",
    url: "/resources/chapter-charter-guide.pdf",
    uploadedBy: "Secretariat",
    createdAt: "2024-07-20",
  },
  {
    id: "doc-4",
    title: "Under-18 Minor Attendee Guardian Consent Form",
    description: "Statutory KDPA-compliant parental/guardian authorization form for all delegates below 18 years.",
    category: "FORM",
    accessLevel: "PUBLIC",
    fileSize: "310 KB",
    mimeType: "application/pdf",
    url: "/resources/guardian-consent.pdf",
    uploadedBy: "Legal & Compliance",
    createdAt: "2026-01-10",
  },
  {
    id: "doc-5",
    title: "Executive Council Minutes & Resolutions (Tier Approvals)",
    description: "Official minutes from the Executive Council quarterly deliberations on chapter capability tier allocations.",
    category: "MINUTES",
    accessLevel: "MEMBERS_ONLY",
    fileSize: "2.1 MB",
    mimeType: "application/pdf",
    url: "/resources/council-minutes.pdf",
    uploadedBy: "Executive Secretary",
    createdAt: "2025-11-28",
  },
  {
    id: "doc-6",
    title: "Rally Venue Safety, Medical & Emergency Preparedness Protocol",
    description: "Comprehensive emergency evacuation and triage protocol designed in partnership with Red Cross Kenya.",
    category: "POLICY",
    accessLevel: "LEADERS_ONLY",
    fileSize: "1.1 MB",
    mimeType: "application/pdf",
    url: "/resources/safety-protocol.pdf",
    uploadedBy: "Logistics Directorate",
    createdAt: "2026-02-14",
  },
  {
    id: "doc-7",
    title: "Christ in the Sanctuary: Youth Study Series",
    description: "Comprehensive 8-part Bible study series exploring the Sanctuary doctrine and Christ's high-priestly ministry.",
    category: "SPIRITUAL",
    accessLevel: "PUBLIC",
    fileSize: "3.2 MB",
    mimeType: "application/pdf",
    url: "/resources/sanctuary-study.pdf",
    uploadedBy: "Chaplaincy",
    createdAt: "2026-03-01",
  }
];

export async function getDocumentResources(): Promise<ResourceDocument[]> {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (docs.length > 0) {
      return docs.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description ?? undefined,
        category: d.category,
        accessLevel: d.accessLevel,
        storageKey: d.storageKey,
        url: d.storageKey,
        fileSize: d.fileSize ? `${(d.fileSize / 1024 / 1024).toFixed(1)} MB` : undefined,
        mimeType: d.mimeType ?? undefined,
        uploadedBy: d.uploadedBy ?? undefined,
        createdAt: d.createdAt ? d.createdAt.toISOString().split("T")[0] : undefined,
      }));
    }
  } catch (e) {
    console.warn("Prisma document fetch error, using in-memory store:", e);
  }
  return IN_MEMORY_DOCUMENTS;
}

export async function createDocumentResource(data: Partial<ResourceDocument>): Promise<ResourceDocument> {
  const newDoc: ResourceDocument = {
    id: `doc-${Date.now().toString(36)}`,
    title: data.title || "Untitled Document",
    description: data.description || "",
    category: data.category || "OTHER",
    accessLevel: data.accessLevel || "PUBLIC",
    storageKey: data.url || data.storageKey || "#",
    url: data.url || data.storageKey || "#",
    fileSize: data.fileSize || "1.0 MB",
    mimeType: data.mimeType || "application/pdf",
    uploadedBy: data.uploadedBy || "Council Admin",
    createdAt: new Date().toISOString().split("T")[0],
  };

  try {
    const created = await prisma.document.create({
      data: {
        title: newDoc.title,
        description: newDoc.description ?? null,
        category: newDoc.category,
        accessLevel: newDoc.accessLevel,
        storageKey: newDoc.url || "#",
        fileSize: 1048576,
        mimeType: newDoc.mimeType,
        uploadedBy: newDoc.uploadedBy,
      },
    });
    newDoc.id = created.id;
  } catch (e) {
    console.warn("Prisma document create error, saved in-memory:", e);
  }

  IN_MEMORY_DOCUMENTS = [newDoc, ...IN_MEMORY_DOCUMENTS];
  return newDoc;
}

export async function deleteDocumentResource(id: string): Promise<boolean> {
  try {
    await prisma.document.delete({ where: { id } });
  } catch (e) {
    console.warn("Prisma document delete error:", e);
  }
  const prevLen = IN_MEMORY_DOCUMENTS.length;
  IN_MEMORY_DOCUMENTS = IN_MEMORY_DOCUMENTS.filter(d => d.id !== id);
  return IN_MEMORY_DOCUMENTS.length < prevLen;
}

