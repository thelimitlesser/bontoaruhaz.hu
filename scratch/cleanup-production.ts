import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("--- BONTOARUHAZ ADATBAZIS TAKARITAS INDUL ---");

  // 1. Pre-check
  const partCountBefore = await prisma.part.count();
  const totalStockBefore = await prisma.part.aggregate({
    _sum: { stock: true }
  });
  
  console.log("Alkatreszek szama: " + partCountBefore);
  console.log("Osszesitett raktarkeszlet: " + totalStockBefore._sum.stock);

  try {
    // 2. Deletions
    const orderItemCount = await prisma.orderItem.deleteMany({});
    console.log("Torolve: " + orderItemCount.count + " rendelesi tetel.");

    const orderCount = await prisma.order.deleteMany({});
    console.log("Torolve: " + orderCount.count + " rendeles.");

    const reservationCount = await prisma.reservation.deleteMany({});
    console.log("Torolve: " + reservationCount.count + " technikai foglalas.");

    const manifestCount = await prisma.pxpManifest.deleteMany({});
    console.log("Torolve: " + manifestCount.count + " PannonXP jegyzek.");

    const syncLogCount = await prisma.pxpSyncLog.deleteMany({});
    console.log("Torolve: " + syncLogCount.count + " szinkronizacios naplo.");

    // 3. Post-check
    const partCountAfter = await prisma.part.count();
    const totalStockAfter = await prisma.part.aggregate({
      _sum: { stock: true }
    });

    console.log("Alkatreszek szama utana: " + partCountAfter);
    console.log("Osszesitett raktarkeszlet utana: " + totalStockAfter._sum.stock);

    if (partCountBefore === partCountAfter && totalStockBefore._sum.stock === totalStockAfter._sum.stock) {
      console.log("SIKER: A raktarkeszlet erintetlen maradt!");
    } else {
      console.error("FIGYELEM: Elteres van a keszletben!");
    }

  } catch (error) {
    console.error("HIBA a takaritas kozben:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
