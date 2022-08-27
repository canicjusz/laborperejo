/*
  Warnings:

  - Made the column `subscription` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `subscription` BOOLEAN NOT NULL;
