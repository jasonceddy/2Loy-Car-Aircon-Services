-- AlterTable
ALTER TABLE `service` ADD COLUMN `hidden` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `blocked` BOOLEAN NOT NULL DEFAULT false;