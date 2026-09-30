const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const posts = await p.cmsPost.findMany();
  console.log("Count in DB:", posts.length);
  console.log(JSON.stringify(posts, null, 2));
}
main().finally(() => p.$disconnect());
