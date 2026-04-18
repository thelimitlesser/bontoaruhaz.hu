const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function deleteUser() {
  const email = 'legjobbverziod05@gmail.com'
  const userId = '66a81ac1-b96b-4017-911a-454936433fbc'
  
  console.log(`\n### TÖRLÉS: ${email} (ID: ${userId}) ###`)

  try {
    // 1. Delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId)
    
    if (error) {
      console.error("Törlési hiba a Supabase-ben:", error.message)
    } else {
      console.log("✅ Sikeresen törölve a Supabase Auth-ból.")
    }

    // 2. Delete from Prisma Adatbázis
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    try {
        await prisma.user.delete({ where: { email } })
        console.log("✅ Sikeresen törölve a Prisma adatbázisból is.")
    } catch (e) {
        console.log("ℹ️ A felhasználó már nem volt a Prisma adatbázisban (vagy hiba történt).")
    } finally {
        await prisma.$disconnect()
    }

  } catch (err) {
    console.error("Váratlan hiba:", err.message)
  }
}

deleteUser()
