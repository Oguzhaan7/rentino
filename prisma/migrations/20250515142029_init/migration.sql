-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PROPERTY_OWNER', 'TENANT', 'ACCOUNTANT', 'MANAGER');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'OFFICE', 'SHOP', 'LAND', 'WAREHOUSE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'RENTED', 'UNDER_MAINTENANCE', 'ON_SALE', 'SOLD');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'ONLINE_PAYMENT');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TENANT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "postalCode" TEXT,
    "totalArea" DOUBLE PRECISION NOT NULL,
    "yearBuilt" INTEGER,
    "numberOfRooms" INTEGER,
    "numberOfBaths" INTEGER,
    "floor" INTEGER,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "buildingId" TEXT,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyMaintenance" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cost" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalContract" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "monthlyRent" DOUBLE PRECISION NOT NULL,
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "paymentDay" INTEGER NOT NULL,
    "indexType" TEXT,
    "notes" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "RentalContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalPayment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contractId" TEXT NOT NULL,
    "transactionId" TEXT,

    CONSTRAINT "RentalPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractRenewal" (
    "id" TEXT NOT NULL,
    "previousRent" DOUBLE PRECISION NOT NULL,
    "newRent" DOUBLE PRECISION NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "inflationRate" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contractId" TEXT NOT NULL,

    CONSTRAINT "ContractRenewal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "returnedDate" TIMESTAMP(3),
    "isReturned" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "totalUnits" INTEGER NOT NULL,
    "constructionYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "managerId" TEXT NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dues" (
    "id" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "buildingId" TEXT NOT NULL,

    CONSTRAINT "Dues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuesPayment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "duesId" TEXT NOT NULL,
    "transactionId" TEXT,

    CONSTRAINT "DuesPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildingExpense" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "expenseType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "buildingId" TEXT NOT NULL,

    CONSTRAINT "BuildingExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "RequestPriority" NOT NULL DEFAULT 'MEDIUM',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestedById" TEXT NOT NULL,
    "propertyId" TEXT,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cost" DOUBLE PRECISION,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "maintenanceRequestId" TEXT NOT NULL,
    "assignedToId" TEXT,

    CONSTRAINT "MaintenanceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_propertyId_key" ON "Deposit"("propertyId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyMaintenance" ADD CONSTRAINT "PropertyMaintenance_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPayment" ADD CONSTRAINT "RentalPayment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RentalContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPayment" ADD CONSTRAINT "RentalPayment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRenewal" ADD CONSTRAINT "ContractRenewal_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RentalContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dues" ADD CONSTRAINT "Dues_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuesPayment" ADD CONSTRAINT "DuesPayment_duesId_fkey" FOREIGN KEY ("duesId") REFERENCES "Dues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuesPayment" ADD CONSTRAINT "DuesPayment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingExpense" ADD CONSTRAINT "BuildingExpense_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
