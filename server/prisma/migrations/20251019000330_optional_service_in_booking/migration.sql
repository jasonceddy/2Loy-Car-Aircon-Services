-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_serviceId_fkey`;

-- DropIndex
DROP INDEX `Booking_serviceId_fkey` ON `booking`;

-- AlterTable
ALTER TABLE `booking` MODIFY `serviceId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
