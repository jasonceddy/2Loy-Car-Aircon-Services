-- AlterTable
ALTER TABLE `booking` ADD COLUMN `customerNotes` VARCHAR(191) NULL,
    ADD COLUMN `servicePreferences` JSON NULL;
