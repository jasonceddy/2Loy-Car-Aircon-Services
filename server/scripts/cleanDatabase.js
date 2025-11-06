import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database clean. This will DELETE data from many tables.");
  console.log("If you do not want that, press Ctrl+C now.");

  // Delete child records first to avoid FK constraint errors
  await prisma.partsUsed.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.billing.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.bookingChangeRequest.deleteMany();
  await prisma.bookingTechnician.deleteMany();
  await prisma.jobNote.deleteMany();
  await prisma.job.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.pack.deleteMany();
  await prisma.service.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.part.deleteMany();

  // Finally, remove users (seeds will recreate admin/tech users)
  await prisma.user.deleteMany();

  console.log("Database clean complete. All application data tables cleared.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  })
  .catch(async (e) => {
    console.error("Error during database clean:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
