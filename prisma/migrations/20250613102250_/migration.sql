/*
  Warnings:

  - You are about to drop the `PackageStep` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PackageStep" DROP CONSTRAINT "PackageStep_packageId_fkey";

-- DropTable
DROP TABLE "PackageStep";

-- CreateTable
CREATE TABLE "ConditionAnnulation" (
    "id" TEXT NOT NULL,
    "de" TIMESTAMP(3) NOT NULL,
    "arrival" TIMESTAMP(3) NOT NULL,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "ConditionAnnulation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConditionAnnulation" ADD CONSTRAINT "ConditionAnnulation_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
