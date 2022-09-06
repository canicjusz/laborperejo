/*
  Warnings:

  - The primary key for the `Patron` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `key` to the `Patron` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Patron` DROP PRIMARY KEY,
    ADD COLUMN `key` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`key`);
