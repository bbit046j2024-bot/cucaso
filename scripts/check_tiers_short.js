const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const tiers = await p.capabilityTier.findMany();
  console.log("CapabilityTiers in DB:", tiers.map(t => ({ id: t.id, name: t.name, weight: t.weightBasisPoints })));
  const chapterTiers = await p.chapterTier.findMany({ include: { chapter: { select: { id: true, code: true, name: true } }, tier: true } });
  console.log("ChapterTiers in DB:", chapterTiers.map(ct => ({ chapterId: ct.chapterId, chapterCode: ct.chapter?.code, name: ct.chapter?.name, tierId: ct.tierId, tierName: ct.tier?.name })));
}
main().finally(() => p.$disconnect());
