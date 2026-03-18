import { PrismaClient } from '@prisma/client';
import { brands, models, categories, partsSubcategories, partItems } from './src/lib/vehicle-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating Categories...');
  for (const cat of categories) {
    await prisma.partCategory.upsert({
      where: { id: cat.id },
      update: { name: cat.name, slug: cat.slug, iconName: cat.iconName, keywords: cat.keywords },
      create: { id: cat.id, name: cat.name, slug: cat.slug, iconName: cat.iconName, keywords: cat.keywords }
    });
  }

  console.log('Migrating Subcategories...');
  for (const sub of partsSubcategories) {
    await prisma.partSubcategory.upsert({
      where: { id: sub.id },
      update: { name: sub.name, slug: sub.slug, categoryId: sub.categoryId, keywords: sub.keywords || [] },
      create: { id: sub.id, name: sub.name, slug: sub.slug, categoryId: sub.categoryId, keywords: sub.keywords || [] }
    });
  }

  console.log('Migrating Part Items...');
  for (const item of partItems) {
    await prisma.partItem.upsert({
      where: { id: item.id },
      update: { name: item.name, slug: item.slug, subcategoryId: item.subcategoryId, keywords: item.keywords || [] },
      create: { id: item.id, name: item.name, slug: item.slug, subcategoryId: item.subcategoryId, keywords: item.keywords || [] }
    });
  }

  console.log('Migrating Brands...');
  for (const brand of brands) {
    await prisma.vehicleBrand.upsert({
      where: { id: brand.id },
      update: { name: brand.name, slug: brand.slug, logo: brand.logo, hidden: brand.hidden || false, scale: brand.scale },
      create: { id: brand.id, name: brand.name, slug: brand.slug, logo: brand.logo, hidden: brand.hidden || false, scale: brand.scale }
    });
  }

  console.log('Migrating Models...');
  for (const model of models) {
    await prisma.vehicleModel.upsert({
      where: { id: model.id },
      update: { name: model.name, slug: model.slug, brandId: model.brandId, series: model.series, years: model.years, keywords: model.keywords || [] },
      create: { id: model.id, name: model.name, slug: model.slug, brandId: model.brandId, series: model.series, years: model.years, keywords: model.keywords || [] }
    });
  }

  console.log('Migration Complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
