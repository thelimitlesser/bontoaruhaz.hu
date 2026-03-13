import { PrismaClient } from '@prisma/client';
import { models } from './src/lib/vehicle-data';

const prisma = new PrismaClient();

async function syncModels() {
    console.log("🚀 Starting database model synchronization...");

    // Get all parts that have a modelId
    const parts = await prisma.part.findMany({
        where: {
            modelId: { not: null }
        },
        select: {
            id: true,
            modelId: true,
            name: true
        }
    });

    console.log(`🔍 Found ${parts.length} parts to check.`);

    let updateCount = 0;

    for (const part of parts) {
        if (!part.modelId) continue;

        // Find the standardized model data from our TypeScript files
        const standardizedModel = models.find(m => m.id === part.modelId || m.slug === part.modelId);

        if (standardizedModel) {
            // Note: In our current schema, we largely rely on the TypeScript models for display.
            // However, we want to ensure any stored 'modelName' or similar metadata is updated if it exists.
            // If the schema only stores modelId, the synchronization happens automatically on the frontend
            // because our frontend logic (which I updated in getSearchProducts) now joins the DB results with our TS metadata.

            // Just to be sure, let's log the mapping
            // console.log(`Mapping: ${part.name} (ID: ${part.modelId}) -> ${standardizedModel.name}`);
        } else {
            console.warn(`⚠️ Warning: No standardized model found for ID "${part.modelId}" (Part: ${part.name})`);
        }
    }

    console.log("\n✅ Synchronization check complete.");
    console.log("📝 Note: Since the application now uses standardized TS metadata for all displays and filters,");
    console.log("   no actual database table migrations are needed for the names themselves.");
    console.log("   The changes I made to 'getSearchProducts' and 'ProductCard' ensure the new names are used everywhere.");
}

syncModels()
    .catch(e => {
        console.error("❌ Sync Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
