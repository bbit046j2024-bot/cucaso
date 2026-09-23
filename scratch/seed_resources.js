const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_DOCUMENTS = [
  {
    title: "Christ in the Sanctuary: Youth Study Series",
    description: "Comprehensive 8-part Bible study series exploring the Sanctuary doctrine and Christ's high-priestly ministry.",
    category: "SPIRITUAL",
    accessLevel: "PUBLIC",
    storageKey: "https://documents.adventistarchives.org/Books/DA.pdf",
    fileSize: 3355443, // 3.2 MB
    mimeType: "application/pdf",
    uploadedBy: "Pastoral & Chaplaincy Directorate",
  },
  {
    title: "Coastal Campus Sabbath School Outlines (Q1 2026)",
    description: "Discussion guides tailored for university and tertiary college student Sabbath School classes and afternoon forums.",
    category: "SPIRITUAL",
    accessLevel: "PUBLIC",
    storageKey: "https://www.sabbathschoolpersonalministries.org/",
    fileSize: 1887436, // 1.8 MB
    mimeType: "application/pdf",
    uploadedBy: "Campus Ministries Dept",
  },
  {
    title: "Anchored in the Storm: 30 Devotions for Coastal Students",
    description: "Daily reflections addressing campus exams, mental health, career purity, and Sabbath observance on campus.",
    category: "SPIRITUAL",
    accessLevel: "PUBLIC",
    storageKey: "https://www.adventist.org/devotionals/",
    fileSize: 2254438, // 2.1 MB
    mimeType: "application/pdf",
    uploadedBy: "Council Chaplain",
  },
  {
    title: "Campus Ministry Evangelism Handbook",
    description: "Practical steps for personal soul-winning, literature distribution, and staging campus health expos.",
    category: "SPIRITUAL",
    accessLevel: "PUBLIC",
    storageKey: "https://www.adventist.org/evangelism/",
    fileSize: 1572864, // 1.5 MB
    mimeType: "application/pdf",
    uploadedBy: "Personal Ministries & Evangelism",
  },
  {
    title: "CUCASO Official Constitution & Bylaws (Revised 2024)",
    description: "The supreme governing document of the Coastal Universities and Colleges Adventist Students Organization.",
    category: "CONSTITUTION",
    accessLevel: "PUBLIC",
    storageKey: "https://cucaso.org/resources/constitution.pdf",
    fileSize: 1468006, // 1.4 MB
    mimeType: "application/pdf",
    uploadedBy: "Executive Secretariat",
  },
  {
    title: "Rally Financial Policy & Capability-Weighted Capitation Framework",
    description: "Official capitation model guidelines detailing institutional tiers, cost sharing formulas, and paybill remittance protocols.",
    category: "POLICY",
    accessLevel: "PUBLIC",
    storageKey: "https://cucaso.org/resources/financial-policy.pdf",
    fileSize: 839680, // 820 KB
    mimeType: "application/pdf",
    uploadedBy: "Central Treasury",
  },
  {
    title: "Chapter Chartering Application & Endorsement Guide",
    description: "Step-by-step checklist and institutional endorsement procedures for newly affiliated campus fellowships.",
    category: "FORM",
    accessLevel: "PUBLIC",
    storageKey: "https://cucaso.org/resources/chapter-charter-guide.pdf",
    fileSize: 552960, // 540 KB
    mimeType: "application/pdf",
    uploadedBy: "Secretariat",
  },
  {
    title: "Under-18 Minor Attendee Guardian Consent Form",
    description: "Statutory KDPA-compliant parental/guardian authorization form for all delegates below 18 years.",
    category: "FORM",
    accessLevel: "PUBLIC",
    storageKey: "https://cucaso.org/resources/guardian-consent.pdf",
    fileSize: 317440, // 310 KB
    mimeType: "application/pdf",
    uploadedBy: "Legal & Compliance",
  },
  {
    title: "Executive Council Minutes & Resolutions (Tier Approvals)",
    description: "Official minutes from the Executive Council quarterly deliberations on chapter capability tier allocations.",
    category: "MINUTES",
    accessLevel: "MEMBERS_ONLY",
    storageKey: "https://cucaso.org/resources/council-minutes.pdf",
    fileSize: 2202009, // 2.1 MB
    mimeType: "application/pdf",
    uploadedBy: "Executive Secretary",
  },
  {
    title: "Rally Venue Safety, Medical & Emergency Preparedness Protocol",
    description: "Comprehensive emergency evacuation and triage protocol designed in partnership with Red Cross Kenya.",
    category: "POLICY",
    accessLevel: "LEADERS_ONLY",
    storageKey: "https://cucaso.org/resources/safety-protocol.pdf",
    fileSize: 1153433, // 1.1 MB
    mimeType: "application/pdf",
    uploadedBy: "Logistics Directorate",
  },
];

async function seed() {
  console.log("Seeding documents into DB...");
  for (const doc of DEFAULT_DOCUMENTS) {
    const existing = await prisma.document.findFirst({
      where: { title: doc.title },
    });
    if (!existing) {
      await prisma.document.create({ data: doc });
      console.log(`Created: ${doc.title} (${doc.category})`);
    } else {
      console.log(`Already exists: ${doc.title}`);
    }
  }
  const count = await prisma.document.count();
  console.log(`Total documents in DB: ${count}`);
}

seed()
  .catch((e) => {
    console.error("Error seeding documents:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
