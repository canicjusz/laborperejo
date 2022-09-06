/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `role`;

-- CreateTable
CREATE TABLE `Patron` (
    `ID` INTEGER NOT NULL,
    `type` ENUM('user', 'company') NOT NULL,
    `message` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ID`, `type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
