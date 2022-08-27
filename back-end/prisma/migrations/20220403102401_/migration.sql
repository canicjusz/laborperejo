/*
  Warnings:

  - You are about to drop the column `custrom` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Company` DROP COLUMN `custrom`,
    ADD COLUMN `website` VARCHAR(191) NULL;
