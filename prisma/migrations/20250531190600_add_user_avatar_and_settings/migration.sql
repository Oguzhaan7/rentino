-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT;

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'tr',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "notifications" JSONB NOT NULL DEFAULT '{"email": true, "browser": true, "sms": false}',
    "dashboard" JSONB NOT NULL DEFAULT '{"showWelcome": true, "compactMode": false}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
