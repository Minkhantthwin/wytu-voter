/*
  Warnings:

  - A unique constraint covering the columns `[fingerprint]` on the table `votes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `votes` ADD COLUMN `fingerprint` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `votes_fingerprint_key` ON `votes`(`fingerprint`);
