-- AlterTable
ALTER TABLE `Profile` MODIFY `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `subscription` BOOLEAN NOT NULL DEFAULT true;
