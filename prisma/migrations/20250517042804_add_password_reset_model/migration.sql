-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Building" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Add invoiceNumber and isPaid to BuildingExpense model
ALTER TABLE "BuildingExpense" ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT;
ALTER TABLE "BuildingExpense" ADD COLUMN IF NOT EXISTS "isPaid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BuildingExpense" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP;

-- Add description to Dues model
ALTER TABLE "Dues" ADD COLUMN IF NOT EXISTS "description" TEXT;
