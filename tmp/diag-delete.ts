import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Searching for Citroen Berlingo...");
  const parts = await prisma.part.findMany({
    where: {
      OR: [
        { name: { contains: "Berlingo", mode: "insensitive" } },
        { description: { contains: "Berlingo", mode: "insensitive" } }
      ]
    },
    include: {
      orderItems: {
        include: {
            order: true
        }
      },
      reservations: true
    }
  });

  if (parts.length === 0) {
    console.log("No product found with 'Berlingo' in name/description.");
    return;
  }

  for (const part of parts) {
    console.log("\n-----------------------------------");
    console.log(`ID: ${part.id}`);
    console.log(`Name: ${part.name}`);
    console.log(`Order Items count: ${part.orderItems.length}`);
    console.log(`Reservations count: ${part.reservations.length}`);
    
    if (part.orderItems.length > 0) {
      console.log("WARNING: Referenced by OrderItems. Database blocks hard delete.");
      part.orderItems.forEach(oi => {
          console.log(`- In Order #${oi.order.id} (Status: ${oi.order.status})`);
      });
    }
    if (part.reservations.length > 0) {
      console.log("WARNING: Currently reserved.");
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
