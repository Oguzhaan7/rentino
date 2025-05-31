/*
  Warnings:

  - You are about to drop the column `dueDate` on the `RentalPayment` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `RentalPayment` table. All the data in the column will be lost.
  - Added the required column `periodEndDate` to the `RentalPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodStartDate` to the `RentalPayment` table without a default value. This is not possible if the table is not empty.
  - Made the column `paymentDate` on table `RentalPayment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Building" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "BuildingExpense" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Dues" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "DuesPayment" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "LegalEvent" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RentalPayment" DROP COLUMN "dueDate",
DROP COLUMN "period",
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "periodEndDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "periodStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "receiptNumber" TEXT,
ALTER COLUMN "paymentDate" SET NOT NULL;
