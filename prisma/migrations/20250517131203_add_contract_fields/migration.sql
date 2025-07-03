/*
  Warnings:

  - You are about to drop the column `isReturned` on the `Deposit` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `Deposit` table. All the data in the column will be lost.
  - You are about to drop the column `returnedDate` on the `Deposit` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Document` table. All the data in the column will be lost.
  - Added the required column `contractId` to the `Deposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentDate` to the `Deposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Deposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `RentalContract` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RenewalType" AS ENUM ('AUTOMATIC', 'MANUAL', 'NEGOTIABLE');

-- AlterEnum
ALTER TYPE "ContractStatus" ADD VALUE 'RENEWED';

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_ownerId_fkey";

-- DropIndex
DROP INDEX "Deposit_propertyId_key";

-- AlterTable
ALTER TABLE "BuildingExpense" ALTER COLUMN "paidAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CustomFieldValue" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Deposit" DROP COLUMN "isReturned",
DROP COLUMN "propertyId",
DROP COLUMN "returnedDate",
ADD COLUMN     "contractId" TEXT NOT NULL,
ADD COLUMN     "paymentDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "returnAmount" DOUBLE PRECISION,
ADD COLUMN     "returnDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "type",
ADD COLUMN     "contractId" TEXT,
ALTER COLUMN "ownerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Language" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RentalContract" ADD COLUMN     "noticePeriod" INTEGER,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "penaltyAmount" DOUBLE PRECISION,
ADD COLUMN     "previousContractId" TEXT,
ADD COLUMN     "renewalType" TEXT,
ADD COLUMN     "returnDepositAmount" DOUBLE PRECISION,
ADD COLUMN     "terminationDate" TIMESTAMP(3),
ADD COLUMN     "terminationReason" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Setting" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Translation" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_previousContractId_fkey" FOREIGN KEY ("previousContractId") REFERENCES "RentalContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RentalContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RentalContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
