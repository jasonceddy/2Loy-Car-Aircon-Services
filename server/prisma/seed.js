// prisma/seed.js
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function hashingPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

async function main() {
  const password = await hashingPassword("secret123")

  //Seed Admin
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@gmail.com",
      password,
      phone: "09123456789",
      role: "ADMIN",
    },
  })

  //Seed Technician 1
  await prisma.user.upsert({
    where: { email: "technician1@gmail.com" },
    update: {},
    create: {
      name: "Technician 1",
      email: "technician1@gmail.com",
      password,
      phone: "09234567891",
      role: "TECHNICIAN",
    },
  })

  //Seed Technician 2
  await prisma.user.upsert({
    where: { email: "technician2@gmail.com" },
    update: {},
    create: {
      name: "Technician 2",
      email: "technician2@gmail.com",
      password,
      phone: "09345678912",
      role: "TECHNICIAN",
    },
  })
}

main()
  .then(async () => {
    console.log("Seeding Complete")
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
