-- CreateTable
CREATE TABLE "PackageStep" (
    "id" TEXT NOT NULL,
    "de" TIMESTAMP(3) NOT NULL,
    "arrival" TIMESTAMP(3) NOT NULL,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "PackageStep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackageStep" ADD CONSTRAINT "PackageStep_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
