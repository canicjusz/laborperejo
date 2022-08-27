/*
  Warnings:

  - You are about to drop the column `ln` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Profile` DROP COLUMN `ln`,
    ADD COLUMN `li` VARCHAR(191) NULL;
