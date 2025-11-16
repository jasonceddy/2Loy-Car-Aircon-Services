/*
  Warnings:

  - A unique constraint covering the columns `[serialNumber]` on the table `Part` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `part` ADD COLUMN `serialNumber` VARCHAR(191) NULL,
    ADD COLUMN `uom` VARCHAR(191) NOT NULL DEFAULT 'pc';

-- CreateIndex
CREATE UNIQUE INDEX `Part_serialNumber_key` ON `Part`(`serialNumber`);
