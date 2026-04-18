const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function deleteUser() {
  const email = 'legjobbverziod05@gmail.com'
  const userId = 'a91b6287-fa19-4605-9058-95a778264b67'
  
  console.log(`\n### TÖRLÉS: ${email} (ID: ${userId}) ###`)

  try {
    // Delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId)
    
    if (error) {
      console.error("Törlési hiba a Supabase-ben:", error.message)
    } else {
      console.log("✅ Sikeresen törölve a Supabase Auth-ból.")
    }

    // Double check Prisma just in case
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    try {
        await prisma.user.delete({ where: { email } })
        console.log("✅ Sikeresen törölve a Prisma adatbázisból is.")
    } catch (e) {
        // User likely didn't exist in Prisma, ignoring
    } finally {
        await prisma.$disconnect()
    }

  } catch (err) {
    console.error("Váratlan hiba:", err.message)
  }
}

deleteUser()
