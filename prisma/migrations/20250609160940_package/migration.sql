-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('VACATION', 'OMRA', 'HADJ');

-- CreateTable
CREATE TABLE "PricePerPerson" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceAdult" DOUBLE PRECISION NOT NULL,
    "priceChild6To11" DOUBLE PRECISION NOT NULL,
    "priceChild2To5" DOUBLE PRECISION NOT NULL,
    "priceInfant" DOUBLE PRECISION NOT NULL,
    "markupPlatform" INTEGER DEFAULT 0,
    "markupAgency" INTEGER DEFAULT 0,

    CONSTRAINT "PricePerPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT NOT NULL,
    "option" DOUBLE PRECISION NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "departureCity" TEXT NOT NULL,
    "type" "PackageType" NOT NULL DEFAULT 'VACATION',
    "shortDescription" TEXT NOT NULL,
    "description" TEXT,
    "importantNote" TEXT,
    "employmentContact" TEXT,
    "inclusion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departure" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,

    CONSTRAINT "Departure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PricePerPerson_packageId_displayName_key" ON "PricePerPerson"("packageId", "displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Departure_packageId_departureCity_key" ON "Departure"("packageId", "departureCity");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_packageId_departureCity_key" ON "Destination"("packageId", "departureCity");

-- AddForeignKey
ALTER TABLE "PricePerPerson" ADD CONSTRAINT "PricePerPerson_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departure" ADD CONSTRAINT "Departure_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
