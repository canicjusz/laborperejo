-- CreateTable
CREATE TABLE `User` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `confirmed` BOOLEAN NOT NULL DEFAULT false,
    `ban` BOOLEAN NOT NULL DEFAULT false,
    `role` ENUM('user', 'administrator') NOT NULL DEFAULT 'user',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_ID_name_idx`(`ID`, `name`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `place` VARCHAR(191) NOT NULL,
    `searching` BOOLEAN NOT NULL DEFAULT false,
    `languages` JSON NOT NULL,
    `job` VARCHAR(191) NULL,
    `mv` VARCHAR(191) NULL,
    `vk` VARCHAR(191) NULL,
    `fb` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `resume` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `user_ID` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    FULLTEXT INDEX `Profile_content_user_name_idx`(`content`, `user_name`),
    UNIQUE INDEX `Profile_user_ID_user_name_key`(`user_ID`, `user_name`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NOT NULL,
    `industry` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    FULLTEXT INDEX `Company_name_description_idx`(`name`, `description`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Offer` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `company_ID` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `salary` BOOLEAN NOT NULL,
    `reward` VARCHAR(191) NOT NULL,
    `categories` JSON NOT NULL,
    `arrangement` VARCHAR(191) NOT NULL,
    `employment` VARCHAR(191) NOT NULL,
    `place` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `closed` BOOLEAN NOT NULL DEFAULT true,
    `close_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    FULLTEXT INDEX `Offer_title_description_idx`(`title`, `description`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sid` VARCHAR(191) NOT NULL,
    `data` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sid_key`(`sid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordToken` (
    `token` VARCHAR(191) NOT NULL,
    `user_ID` INTEGER NOT NULL,

    UNIQUE INDEX `PasswordToken_user_ID_key`(`user_ID`),
    PRIMARY KEY (`token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CompanyToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CompanyToUser_AB_unique`(`A`, `B`),
    INDEX `_CompanyToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OfferToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OfferToUser_AB_unique`(`A`, `B`),
    INDEX `_OfferToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_user_ID_user_name_fkey` FOREIGN KEY (`user_ID`, `user_name`) REFERENCES `User`(`ID`, `name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Offer` ADD CONSTRAINT `Offer_company_ID_fkey` FOREIGN KEY (`company_ID`) REFERENCES `Company`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordToken` ADD CONSTRAINT `PasswordToken_user_ID_fkey` FOREIGN KEY (`user_ID`) REFERENCES `User`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CompanyToUser` ADD FOREIGN KEY (`A`) REFERENCES `Company`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CompanyToUser` ADD FOREIGN KEY (`B`) REFERENCES `User`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OfferToUser` ADD FOREIGN KEY (`A`) REFERENCES `Offer`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OfferToUser` ADD FOREIGN KEY (`B`) REFERENCES `User`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;
