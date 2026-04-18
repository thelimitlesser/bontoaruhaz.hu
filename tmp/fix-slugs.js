const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
    console.log("Starting slug deduplication...");

    // 1. Deduplicate VehicleModels (prepend brand ID)
    const models = await prisma.vehicleModel.findMany();
    console.log(`Checking ${models.length} vehicle models...`);
    
    for (const model of models) {
        const newSlug = `${model.brandId}-${model.slug}`.toLowerCase();
        if (model.slug !== newSlug) {
            await prisma.vehicleModel.update({
                where: { id: model.id },
                data: { slug: newSlug }
            });
        }
    }
    console.log("✅ VehicleModel slugs updated.");

    // 2. Deduplicate PartItems (handle collisions specifically)
    const duplicateSlugs = await prisma.partItem.groupBy({
        by: ['slug'],
        _count: { slug: true },
        having: { slug: { _count: { gt: 1 } } }
    });

    console.log(`Found ${duplicateSlugs.length} duplicate PartItem slug groups.`);

    for (const dupe of duplicateSlugs) {
        const items = await prisma.partItem.findMany({ 
            where: { slug: dupe.slug },
            orderBy: { id: 'asc' }
        });
        
        // Keep the first one, rename others
        for (let i = 1; i < items.length; i++) {
            const item = items[i];
            const suffix = item.id.split('-').pop(); // Use last part of UUID as suffix
            const newSlug = `${item.slug}-${suffix}`;
            
            console.log(`  Renaming PartItem "${item.name}" from ${item.slug} to ${newSlug}`);
            await prisma.partItem.update({
                where: { id: item.id },
                data: { slug: newSlug }
            });
        }
    }
    console.log("✅ PartItem slugs deduplicated.");
}

migrate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
