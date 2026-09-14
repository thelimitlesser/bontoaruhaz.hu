import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Fetching all reservations in the database...");
    const reservations = await prisma.reservation.findMany({
      include: {
        part: {
          select: {
            id: true,
            name: true,
            stock: true,
          }
        }
      }
    });

    console.log(`Found ${reservations.length} reservations:`);
    for (const r of reservations) {
      console.log(`- ID: ${r.id}`);
      console.log(`  Part ID: ${r.partId} (${r.part.name})`);
      console.log(`  Session ID: ${r.sessionId}`);
      console.log(`  Expires At: ${r.expiresAt.toISOString()}`);
      console.log(`  Created At: ${r.createdAt.toISOString()}`);
      console.log(`  Current Time: ${new Date().toISOString()}`);
      console.log(`  Expired? ${r.expiresAt < new Date()}`);
    }

    // Check specifically for "Audi 80 ültető Rugó"
    console.log("\nSearching for 'Audi 80' parts with reservations...");
    const audiParts = await prisma.part.findMany({
      where: {
        name: {
          contains: 'Audi 80',
          mode: 'insensitive'
        }
      },
      include: {
        reservations: true
      }
    });

    for (const part of audiParts) {
      console.log(`\nProduct: ${part.name} (ID: ${part.id})`);
      console.log(`Stock: ${part.stock}`);
      console.log(`Reservations: ${part.reservations.length}`);
      for (const res of part.reservations) {
        console.log(`  Reservation: ${res.id}, Session: ${res.sessionId}, Expires: ${res.expiresAt.toISOString()}, Expired: ${res.expiresAt < new Date()}`);
      }
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

main().finally(() => prisma.$disconnect());
