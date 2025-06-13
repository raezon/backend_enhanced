-- CreateEnum
CREATE TYPE "PackageStepType" AS ENUM ('HOTEL', 'VOL', 'TRANSFER', 'EXCURSION');

-- CreateTable
CREATE TABLE "PackageStep" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "type" "PackageStepType" NOT NULL DEFAULT 'HOTEL',
    "hotelName" TEXT NOT NULL,
    "nights" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "primaryImageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageStepSecondaryImages" (
    "id" TEXT NOT NULL,
    "packageStepId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "PackageStepSecondaryImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackageStep" ADD CONSTRAINT "PackageStep_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageStepSecondaryImages" ADD CONSTRAINT "PackageStepSecondaryImages_packageStepId_fkey" FOREIGN KEY ("packageStepId") REFERENCES "PackageStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
