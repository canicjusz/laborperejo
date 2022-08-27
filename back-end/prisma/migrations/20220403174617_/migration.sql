/*
  Warnings:

  - You are about to drop the column `custom` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Company` ADD COLUMN `li` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Profile` DROP COLUMN `custom`,
    ADD COLUMN `website` VARCHAR(191) NULL;
