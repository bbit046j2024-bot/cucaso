const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const count = await p.cmsPost.count();
  console.log("Current cmsPost count in DB:", count);
  if (count === 0) {
    const initialPosts = [
      {
        slug: "q1-2026-spiritual-rally-venue",
        title: "Administration Council Finalizes Q1 2026 Coastal Spiritual Rally Venue",
        summary: "Delegates from 12 member chapters will convene at Technical University of Mombasa (TUM) for an unforgettable weekend of faith, prayer, and choral ministry.",
        contentHtml: "<p>The Executive Council is delighted to announce that after careful venue inspection and prayerful consideration, Technical University of Mombasa has been selected as the official host venue for the upcoming rally.</p><p>We look forward to gathering delegates, chapter patrons, and alumni from across the coastal region for this momentous weekend.</p>",
        category: "ANNOUNCEMENT",
        status: "PUBLISHED",
        authorUserId: "Secretariat & Comms Office",
        publishedAt: new Date("2026-09-18"),
      },
      {
        slug: "capability-weighted-capitation-framework",
        title: "Central Treasury Publishes Capability-Weighted Capitation Framework",
        summary: "In accordance with CUCASO bylaws, the capability cost engine has been ratified to ensure fair financial sharing between large universities and technical institutes.",
        contentHtml: "<p>The newly adopted tiered capitation framework guarantees that all chapters contribute proportionally to their institutional strength, eliminating unfair head-tax barriers.</p>",
        category: "FINANCE",
        status: "PUBLISHED",
        authorUserId: "Central Treasurer",
        publishedAt: new Date("2026-09-12"),
      }
    ];

    for (const post of initialPosts) {
      await p.cmsPost.create({ data: post });
    }
    console.log("Seeded", initialPosts.length, "initial cmsPost records into the DB!");
  }
}

main().catch(console.error).finally(() => p.$disconnect());
