const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // 1. Fix Pwani University
  const pwani = await p.chapter.findFirst({
    where: {
      OR: [
        { id: "ch-munz8nxb" },
        { code: "CHAP-MUNZ8NXB" },
        { name: { contains: "Pwani" } },
        { institution: { name: { contains: "Pwani" } } }
      ]
    },
    include: { institution: true }
  });

  if (pwani) {
    console.log("Found Pwani chapter:", pwani.id, pwani.name, "Institution:", pwani.institution?.name);
    // Update institution type to UNIVERSITY
    if (pwani.institutionId) {
      await p.institution.update({
        where: { id: pwani.institutionId },
        data: { type: "UNIVERSITY" }
      });
    }
    // Update or create ChapterTier with TIER_1
    await p.chapterTier.create({
      data: {
        chapterId: pwani.id,
        tierId: "TIER_1",
        notes: "Admin correction: Major University"
      }
    });
    console.log("Updated Pwani to TIER_1 and UNIVERSITY");
  } else {
    console.log("Pwani chapter not found");
  }

  // 2. Fix KMTC
  const kmtc = await p.chapter.findFirst({
    where: {
      OR: [
        { id: "ch-munmwg4j" },
        { code: "CHAP-MUNMWG4K" },
        { name: { contains: "KMTC" } },
        { institution: { name: { contains: "KMTC" } } }
      ]
    },
    include: { institution: true }
  });

  if (kmtc) {
    console.log("Found KMTC chapter:", kmtc.id, kmtc.name, "Institution:", kmtc.institution?.name);
    // Update institution type to COLLEGE
    if (kmtc.institutionId) {
      await p.institution.update({
        where: { id: kmtc.institutionId },
        data: { type: "COLLEGE" }
      });
    }
    // Update or create ChapterTier with TIER_2
    await p.chapterTier.create({
      data: {
        chapterId: kmtc.id,
        tierId: "TIER_2",
        notes: "Admin correction: Medical College"
      }
    });
    console.log("Updated KMTC to TIER_2 and COLLEGE");
  } else {
    console.log("KMTC chapter not found");
  }
}

main().catch(console.error).finally(() => p.$disconnect());
