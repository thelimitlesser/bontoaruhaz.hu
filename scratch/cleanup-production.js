const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- BONTOARUHAZ ADATBAZIS TAKARITAS INDUL ---");

  try {
    // 1. Pre-check
    const partCountBefore = await prisma.part.count();
    const totalStockBefore = await prisma.part.aggregate({
      _sum: { stock: true }
    });
    
    console.log("Alkatreszek szama: " + partCountBefore);
    console.log("Osszesitett raktarkeszlet: " + (totalStockBefore._sum.stock || 0));

    // 2. Deletions
    console.log("Torles folyamatban...");
    
    // Using individual deletes to be safe
    const orderItemResult = await prisma.orderItem.deleteMany({});
    console.log("Torolve: " + orderItemResult.count + " rendelesi tetel.");

    const orderResult = await prisma.order.deleteMany({});
    console.log("Torolve: " + orderResult.count + " rendeles.");

    const reservationResult = await prisma.reservation.deleteMany({});
    console.log("Torolve: " + reservationResult.count + " technikai foglalas.");

    const manifestResult = await prisma.pxpManifest.deleteMany({});
    console.log("Torolve: " + manifestResult.count + " PannonXP jegyzek.");

    const syncLogResult = await prisma.pxpSyncLog.deleteMany({});
    console.log("Torolve: " + syncLogResult.count + " szinkronizacios naplo.");

    console.log("-------------------------------------------");

    // 3. Post-check
    const partCountAfter = await prisma.part.count();
    const totalStockAfter = await prisma.part.aggregate({
      _sum: { stock: true }
    });

    console.log("Alkatreszek szama utana: " + partCountAfter);
    console.log("Osszesitett raktarkeszlet utana: " + (totalStockAfter._sum.stock || 0));

    if (partCountBefore === partCountAfter && (totalStockBefore._sum.stock || 0) === (totalStockAfter._sum.stock || 0)) {
      console.log("✅ SIKER: A raktarkeszlet erintetlen maradt!");
    } else {
      console.error("❌ FIGYELEM: Elteres van a keszletben! Ellenorizd az adatokat!");
    }

  } catch (error) {
    console.error("❌ HIBA a takaritas kozben:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
