import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.partItem.findMany({
    select: { id: true, name: true, subcategoryId: true }
  });
  
  console.log(`Found ${items.length} part items.`);
  
  // Look for potential collisions (same name but different case/accents that map to same slug)
  const slugs = new Map();
  const collisions = [];
  
  for (const item of items) {
    const slug = item.name.toLowerCase().replace(/\s+/g, '-');
    if (slugs.has(slug)) {
      collisions.push({ slug, items: [slugs.get(slug), item] });
    } else {
      slugs.set(slug, item);
    }
  }
  
  if (collisions.length > 0) {
    console.log("Found potential id/slug collisions:");
    process.stdout.write(JSON.stringify(collisions, null, 2));
  } else {
    console.log("No existing collisions found in database.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
