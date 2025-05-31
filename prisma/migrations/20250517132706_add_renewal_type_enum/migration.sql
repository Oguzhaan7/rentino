/*
  Warnings:

  - The `renewalType` column on the `RentalContract` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "RentalContract" DROP COLUMN "renewalType",
ADD COLUMN     "renewalType" "RenewalType";
