const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const tiers = await p.capabilityTier.findMany();
  console.log("CapabilityTiers:", tiers);
  const chapterTiers = await p.chapterTier.findMany({ include: { chapter: true, tier: true } });
  console.log("ChapterTiers:", JSON.stringify(chapterTiers, null, 2));
  const institutions = await p.institution.findMany();
  console.log("Institutions:", JSON.stringify(institutions, null, 2));
}
main().finally(() => p.$disconnect());
