/*
  Warnings:

  - You are about to drop the column `departureCity` on the `Departure` table. All the data in the column will be lost.
  - You are about to drop the column `departureCity` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `employmentContact` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `importantNote` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Package` table. All the data in the column will be lost.
  - You are about to alter the column `option` on the `Package` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `displayName` on the `PricePerPerson` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `PricePerPerson` table. All the data in the column will be lost.
  - You are about to drop the column `priceAdult` on the `PricePerPerson` table. All the data in the column will be lost.
  - You are about to drop the column `priceChild2To5` on the `PricePerPerson` table. All the data in the column will be lost.
  - You are about to drop the column `priceChild6To11` on the `PricePerPerson` table. All the data in the column will be lost.
  - You are about to drop the column `priceInfant` on the `PricePerPerson` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[packageId]` on the table `PricePerPerson` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Departure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Destination` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PricePerPerson` table without a default value. This is not possible if the table is not empty.
  - Made the column `markupPlatform` on table `PricePerPerson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `markupAgency` on table `PricePerPerson` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PricePerPerson" DROP CONSTRAINT "PricePerPerson_packageId_fkey";

-- DropIndex
DROP INDEX "Departure_packageId_departureCity_key";

-- DropIndex
DROP INDEX "Destination_packageId_departureCity_key";

-- DropIndex
DROP INDEX "PricePerPerson_packageId_displayName_key";

-- AlterTable
ALTER TABLE "Departure" DROP COLUMN "departureCity",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Destination" DROP COLUMN "departureCity",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "createdAt",
DROP COLUMN "employmentContact",
DROP COLUMN "importantNote",
DROP COLUMN "updatedAt",
ADD COLUMN     "combination_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "empContract" TEXT,
ADD COLUMN     "importantNotes" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_age_first_child" INTEGER,
ADD COLUMN     "max_age_second_child" INTEGER,
ADD COLUMN     "min_age_first_child" INTEGER,
ADD COLUMN     "min_age_second_child" INTEGER,
ALTER COLUMN "option" SET DATA TYPE INTEGER,
ALTER COLUMN "priority" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PricePerPerson" DROP COLUMN "displayName",
DROP COLUMN "name",
DROP COLUMN "priceAdult",
DROP COLUMN "priceChild2To5",
DROP COLUMN "priceChild6To11",
DROP COLUMN "priceInfant",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "markupPlatform" SET NOT NULL,
ALTER COLUMN "markupPlatform" DROP DEFAULT,
ALTER COLUMN "markupPlatform" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "markupAgency" SET NOT NULL,
ALTER COLUMN "markupAgency" DROP DEFAULT,
ALTER COLUMN "markupAgency" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "pricePerPersonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adultPrice" DOUBLE PRECISION NOT NULL,
    "childPrice6To11" DOUBLE PRECISION NOT NULL,
    "childPrice2To5" DOUBLE PRECISION NOT NULL,
    "infantPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PricePerPerson_packageId_key" ON "PricePerPerson"("packageId");

-- AddForeignKey
ALTER TABLE "PricePerPerson" ADD CONSTRAINT "PricePerPerson_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_pricePerPersonId_fkey" FOREIGN KEY ("pricePerPersonId") REFERENCES "PricePerPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
