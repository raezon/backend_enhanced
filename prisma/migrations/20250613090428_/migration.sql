-- CreateTable
CREATE TABLE "DepartureSlot" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "finish" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "nights" INTEGER NOT NULL,
    "initialPlace" INTEGER NOT NULL,

    CONSTRAINT "DepartureSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DepartureSlot" ADD CONSTRAINT "DepartureSlot_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
