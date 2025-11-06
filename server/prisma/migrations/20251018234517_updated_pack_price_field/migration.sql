/*
  Warnings:

  - You are about to drop the column `cost` on the `pack` table. All the data in the column will be lost.
  - Added the required column `price` to the `Pack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pack` DROP COLUMN `cost`,
    ADD COLUMN `price` DOUBLE NOT NULL;
