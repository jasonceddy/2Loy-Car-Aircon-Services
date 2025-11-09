-- AlterTable
ALTER TABLE `car` ADD COLUMN `ownerChangedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `CarOwnership` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `carId` INTEGER NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `fromDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `toDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransferLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `carId` INTEGER NOT NULL,
    `adminId` INTEGER NOT NULL,
    `previousOwnerId` INTEGER NULL,
    `newOwnerId` INTEGER NOT NULL,
    `reason` VARCHAR(191) NULL,
    `details` JSON NULL,
    `moveOpenJobs` BOOLEAN NOT NULL DEFAULT false,
    `moveUnpaidInvoices` BOOLEAN NOT NULL DEFAULT false,
    `movedJobsCount` INTEGER NULL,
    `movedInvoicesCount` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CarOwnership` ADD CONSTRAINT `CarOwnership_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `Car`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CarOwnership` ADD CONSTRAINT `CarOwnership_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferLog` ADD CONSTRAINT `TransferLog_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `Car`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferLog` ADD CONSTRAINT `TransferLog_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferLog` ADD CONSTRAINT `TransferLog_previousOwnerId_fkey` FOREIGN KEY (`previousOwnerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferLog` ADD CONSTRAINT `TransferLog_newOwnerId_fkey` FOREIGN KEY (`newOwnerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
