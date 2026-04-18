import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function findUser() {
  const email = 'legjobbverziod05@gmail.com'
  console.log(`\n### Ellenőrzés: ${email} ###`)

  // 1. Prisma Check
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: {
      orders: true,
      vehicles: true
    }
  })

  // 2. Supabase Check
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  const authUser = users?.find(u => u.email === email)

  console.log('\nPrisma Adatbázis:')
  if (dbUser) {
    console.log(`- ID: ${dbUser.id}`)
    console.log(`- Rendelések száma: ${dbUser.orders.length}`)
    console.log(`- Mentett autók száma: ${dbUser.vehicles.length}`)
  } else {
    console.log('- Nincs ilyen felhasználó a Prisma adatbázisban.')
  }

  console.log('\nSupabase Auth:')
  if (authUser) {
    console.log(`- Auth ID: ${authUser.id}`)
    console.log(`- Utolsó belépés: ${authUser.last_sign_in_at}`)
  } else {
    console.log('- Nincs ilyen felhasználó a Supabase-ben.')
  }
}

findUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
