/**
 * CUCASO Platform — Database Seed
 * Populates TiDB Cloud with initial reference data:
 *   - Capability Tiers (PRD §5.3, Section 6.4 worked example)
 *   - System Settings (council approval threshold, account details)
 *   - One Super Admin user (credentials must be changed immediately)
 *
 * ⚠️  SAMPLE DATA — DO NOT RUN IN PRODUCTION
 * This seed creates demonstration chapters, venues, rallies, and attendees
 * clearly marked as SAMPLE. The seed is idempotent (safe to run multiple times).
 *
 * Usage: node prisma/seed.js (or via: npx prisma db seed)
 */

const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");

const prisma = new PrismaClient({
  log: ["error"],
});

async function hashPw(pw) {
  return argon2.hash(pw, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

async function main() {
  console.log("🌱 CUCASO Seed starting...");

  // ─── 1. Capability Tiers ─────────────────────────────────────────────────
  const tierData = [
    {
      name: "Tier 1 — Major University",
      weightBasisPoints: 200,
      description: "Public & large chartered universities with high enrolment and alumni resource base.",
    },
    {
      name: "Tier 2 — Mid University & Medical Colleges",
      weightBasisPoints: 150,
      description: "Specialised health colleges and regional public university constituent campuses.",
    },
    {
      name: "Tier 3 — Technical Colleges & Polytechnics",
      weightBasisPoints: 100,
      description: "National polytechnics, TVET colleges, and mid-tier private tertiary institutes.",
    },
    {
      name: "Tier 4 — Secondary Schools & Early Chapters",
      weightBasisPoints: 50,
      description: "Secondary school SDA chapters, day schools, and newly chartered student fellowships.",
    },
  ];

  const tiers = {};
  for (const t of tierData) {
    const tier = await prisma.capabilityTier.upsert({
      where: { name: t.name },
      update: { weightBasisPoints: t.weightBasisPoints, description: t.description },
      create: t,
    });
    tiers[tier.name] = tier;
    console.log(`  ✓ Tier: ${tier.name} (${tier.weightBasisPoints / 100}x)`);
  }

  // ─── 2. System Settings ───────────────────────────────────────────────────
  const settings = [
    { key: "council_approval_threshold", value: "50" },          // >50% = simple majority
    { key: "shortfall_alert_threshold_days", value: "7" },       // Alert 7 days before deadline
    { key: "reminder_schedule_days", value: "7,3,1" },           // Reminder days before deadline
    { key: "data_retention_days", value: "90" },                 // KDPA: PII retention after rally
    { key: "financial_retention_years", value: "7" },            // KRA: Financial record retention
    { key: "daraja_paybill", value: "PENDING_COUNCIL_DECISION" }, // ⚠️ To be configured
    { key: "daraja_account_name", value: "CUCASO COAST" },
    { key: "organization_name", value: "CUCASO" },
    { key: "organization_full_name", value: "Coastal Universities and Colleges Adventists Students Organization" },
    { key: "organization_region", value: "Mombasa, Kenyan Coast" },
    { key: "tagline_primary", value: "United in Christ. Connected in Fellowship. Committed to Mission." },
    { key: "tagline_secondary", value: "Connecting Students. Strengthening Fellowship. Advancing the Mission." },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log(`  ✓ System settings: ${settings.length} entries`);

  // ─── 3. Seed Users for All PRD Roles ──────────────────────────────────────
  // ⚠️ CHANGE PASSWORDS IMMEDIATELY AFTER FIRST LOGIN
  const seedUsers = [
    {
      email: "admin@cucaso.org",
      name: "CUCASO Super Admin",
      role: "SUPER_ADMIN",
      password: "CUCASo!Admin2026",
      chapterId: null,
    },
    {
      email: "treasurer@cucaso.org",
      name: "David Kimani (Central Treasurer)",
      role: "CENTRAL_TREASURER",
      password: "CUCASo!2026Pass",
      chapterId: null,
    },
    {
      email: "council@cucaso.org",
      name: "Sarah Wanjiku (Council Member)",
      role: "COUNCIL_MEMBER",
      password: "CUCASo!2026Pass",
      chapterId: null,
    },
    {
      email: "jmwangi@tum.ac.ke",
      name: "John Mwangi (TUM Chapter Rep)",
      role: "CHAPTER_REP",
      password: "CUCASo!2026Pass",
      chapterId: "ch-tum",
    },
  ];

  for (const u of seedUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const pwHash = await hashPw(u.password);
      await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          passwordHash: pwHash,
          role: u.role,
          isActive: true,
          totpEnabled: false,
          chapterId: u.chapterId,
        },
      });
      console.log(`  ✓ User created: ${u.email} (${u.role})`);
    } else {
      console.log(`  – User ${u.email} already exists.`);
    }
  }

  // ─── 4. [SAMPLE] Venue ────────────────────────────────────────────────────
  const venue = await prisma.venue.upsert({
    where: { id: "venue-sample-mombasa" },
    update: {},
    create: {
      id: "venue-sample-mombasa",
      name: "[SAMPLE] Kenya School of Law Coast Centre",
      location: "Mombasa Island, Mombasa County",
      county: "Mombasa",
      capacity: 600,
      contact: "info@ksl.ac.ke",
      notes: "Main hall capacity 500, overflow hall 100. Parking available.",
    },
  });
  console.log(`  ✓ [SAMPLE] Venue: ${venue.name}`);

  // ─── 5. [SAMPLE] Institutions & Chapters ─────────────────────────────────
  const institutionData = [
    { name: "Technical University of Mombasa", type: "UNIVERSITY", sector: "PUBLIC", location: "Tudor, Mombasa", tierName: "Tier 1 — Major University", chapterCode: "TUM-01", chapterName: "TUM SDA Chapter" },
    { name: "Kenya Medical Training College — Mombasa", type: "COLLEGE", sector: "PUBLIC", location: "Mombasa Island", tierName: "Tier 2 — Mid University & Medical Colleges", chapterCode: "KMTC-01", chapterName: "KMTC Mombasa SDA Chapter" },
    { name: "Coast Institute of Technology", type: "COLLEGE", sector: "PRIVATE", location: "Mtwapa, Kilifi", tierName: "Tier 3 — Technical Colleges & Polytechnics", chapterCode: "CIT-01", chapterName: "CIT SDA Chapter" },
    { name: "Pwani University", type: "UNIVERSITY", sector: "PUBLIC", location: "Kilifi Town", tierName: "Tier 3 — Technical Colleges & Polytechnics", chapterCode: "PU-01", chapterName: "Pwani University SDA Chapter" },
    { name: "Adventist High School Mombasa", type: "SECONDARY", sector: "PRIVATE", location: "Ganjoni, Mombasa", tierName: "Tier 4 — Secondary Schools & Early Chapters", chapterCode: "AHS-01", chapterName: "AHS SDA Chapter" },
  ];

  const sampleChapters = [];
  for (const d of institutionData) {
    let institution = await prisma.institution.findFirst({
      where: { name: d.name },
    });
    if (!institution) {
      institution = await prisma.institution.create({
        data: {
          name: d.name,
          type: d.type,
          sector: d.sector,
          location: d.location,
        },
      });
    }

    let chapter = await prisma.chapter.findFirst({ where: { code: d.chapterCode } });
    if (!chapter) {
      chapter = await prisma.chapter.create({
        data: {
          code: d.chapterCode,
          name: `[SAMPLE] ${d.chapterName}`,
          institutionId: institution.id,
          status: "APPROVED",
          approximateMembers: 200,
        },
      });

      // Assign initial tier
      const tier = tiers[d.tierName];
      if (tier) {
        await prisma.chapterTier.create({
          data: {
            chapterId: chapter.id,
            tierId: tier.id,
            assignedBy: "SYSTEM_SEED",
          },
        });
      }
      console.log(`  ✓ [SAMPLE] Chapter: ${chapter.code} — ${chapter.name}`);
    }
    sampleChapters.push(chapter);
  }

  // ─── 6. [SAMPLE] Rally ────────────────────────────────────────────────────
  let rally = await prisma.rally.findFirst({ where: { code: "CUR-2026" } });
  if (!rally) {
    rally = await prisma.rally.create({
      data: {
        code: "CUR-2026",
        title: "[SAMPLE] Coastal Unity Rally 2026",
        theme: "Arise and Shine — Isaiah 60:1",
        venueId: venue.id,
        capacity: 600,
        startDate: new Date("2026-11-14"),
        endDate: new Date("2026-11-16"),
        registrationDeadline: new Date("2026-10-31"),
        paymentDeadline: new Date("2026-11-07"),
        feeLockDate: new Date("2026-11-01"),
        state: "REGISTRATION_OPEN",
        allocationMode: "CAPABILITY_WEIGHTED",
        contingencyBasisPoints: 1000, // 10%
      },
    });
    console.log(`  ✓ [SAMPLE] Rally: ${rally.code} — ${rally.title}`);

    // Cost items matching PRD §6.4 worked example
    await prisma.costItem.createMany({
      data: [
        { rallyId: rally.id, category: "VENUE", name: "Venue Hire (Fixed)", type: "FIXED", amountKes: 200000 },
        { rallyId: rally.id, category: "CATERING", name: "Meals per person", type: "PER_HEAD", amountKes: 800 },
      ],
    });
    console.log("  ✓ [SAMPLE] Cost items created (PRD §6.4 worked example)");
  }

  console.log("\n✅ CUCASO Seed complete.");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("⚠️  IMPORTANT BEFORE GO-LIVE:");
  console.log("  1. Change the Super Admin password (admin@cucaso.org)");
  console.log("  2. Enable TOTP 2FA for all admin accounts");
  console.log("  3. Remove or archive all [SAMPLE] records");
  console.log("  4. Set daraja_paybill in System Settings");
  console.log("  5. Configure SESSION_SECRET in .env.local (min 32 chars)");
  console.log("─────────────────────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
