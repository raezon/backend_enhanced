/*
  Warnings:

  - You are about to drop the column `agencyCommissionHotel` on the `Accounting` table. All the data in the column will be lost.
  - You are about to drop the column `localCurrency` on the `Accounting` table. All the data in the column will be lost.
  - You are about to drop the column `localDepositBalance` on the `Accounting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Accounting" DROP COLUMN "agencyCommissionHotel",
DROP COLUMN "localCurrency",
DROP COLUMN "localDepositBalance";
