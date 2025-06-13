-- CreateEnum
CREATE TYPE "PackagePensionType" AS ENUM ('ROOM_ONLY', 'BED_AND_BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE');

-- CreateTable
CREATE TABLE "PackageCombination" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageCombination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Combination" (
    "id" TEXT NOT NULL,
    "packageCombinationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pension" "PackagePensionType" NOT NULL DEFAULT 'ROOM_ONLY',
    "price" DOUBLE PRECISION NOT NULL,
    "majoration" DOUBLE PRECISION NOT NULL,
    "adultsNumber" INTEGER NOT NULL,
    "numbOfChildrenOne" INTEGER NOT NULL,
    "numbOfChildrenTwo" INTEGER NOT NULL,
    "babyPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Combination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageSupplements" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageSupplements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplements" (
    "id" TEXT NOT NULL,
    "packageSupplementsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adultsNumber" INTEGER NOT NULL,
    "numbOfChildrenOne" INTEGER NOT NULL,
    "numbOfChildrenTwo" INTEGER NOT NULL,
    "babyPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Supplements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackageCombination" ADD CONSTRAINT "PackageCombination_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Combination" ADD CONSTRAINT "Combination_packageCombinationId_fkey" FOREIGN KEY ("packageCombinationId") REFERENCES "PackageCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageSupplements" ADD CONSTRAINT "PackageSupplements_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplements" ADD CONSTRAINT "Supplements_packageSupplementsId_fkey" FOREIGN KEY ("packageSupplementsId") REFERENCES "PackageSupplements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
