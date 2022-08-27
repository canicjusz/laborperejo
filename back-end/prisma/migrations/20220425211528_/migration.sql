/*
  Warnings:

  - Added the required column `expiresAt` to the `PasswordToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PasswordToken` ADD COLUMN `expiresAt` DATETIME(3) NOT NULL;
