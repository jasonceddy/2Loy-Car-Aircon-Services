/*
  Warnings:

  - A unique constraint covering the columns `[bookingId]` on the table `Quote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingId` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `quote` ADD COLUMN `bookingId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Quote_bookingId_key` ON `Quote`(`bookingId`);

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
