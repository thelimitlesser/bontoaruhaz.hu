import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const parts = await prisma.part.findMany({
      where: {},
      take: 50,
      orderBy: { createdAt: 'desc' }
    })
    console.log(`Found ${parts.length} parts.`)
  } catch (e) {
    console.error(e)
  }
}

main().finally(() => prisma.$disconnect())
