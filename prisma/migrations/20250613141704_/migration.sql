/*
  Warnings:

  - You are about to drop the column `isPrimary` on the `PackageImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "primaryImageUrl" TEXT;

-- AlterTable
ALTER TABLE "PackageImage" DROP COLUMN "isPrimary";
