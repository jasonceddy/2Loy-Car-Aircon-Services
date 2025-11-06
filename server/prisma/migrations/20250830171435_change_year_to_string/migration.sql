/*
  Warnings:

  - Made the column `notes` on table `car` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `service` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `car` MODIFY `year` VARCHAR(191) NOT NULL,
    MODIFY `notes` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `service` MODIFY `description` VARCHAR(191) NOT NULL;
