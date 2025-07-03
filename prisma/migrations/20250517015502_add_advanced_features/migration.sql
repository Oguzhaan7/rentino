/*
  Warnings:

  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fileName` to the `PropertyDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `PropertyDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maintenanceType` to the `PropertyMaintenance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS', 'IN_APP', 'PUSH');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('RENT_DUE', 'CONTRACT_EXPIRY', 'MAINTENANCE', 'MEETING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LegalCaseType" AS ENUM ('EVICTION', 'DEBT_COLLECTION', 'PROPERTY_DAMAGE', 'CONTRACT_DISPUTE', 'OTHER');

-- CreateEnum
CREATE TYPE "LegalCaseStatus" AS ENUM ('DRAFT', 'FILED', 'IN_PROGRESS', 'COURT_DATE_SET', 'AWAITING_DECISION', 'COMPLETED', 'CANCELLED', 'APPEAL');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTI_SELECT');

-- AlterTable
ALTER TABLE "PropertyDocument" ADD COLUMN     "description" TEXT,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PropertyMaintenance" ADD COLUMN     "contractor" TEXT,
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "maintenanceType" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "warranty" TIMESTAMP(3);

-- DropTable
DROP TABLE "Invoice";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'IN_APP',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "type" "CalendarEventType" NOT NULL,
    "relatedEntityId" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAttendee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "EventAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventReminder" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "reminderTime" TIMESTAMP(3) NOT NULL,
    "notificationType" "NotificationType" NOT NULL DEFAULT 'IN_APP',
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "EventReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalCase" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "LegalCaseType" NOT NULL,
    "status" "LegalCaseStatus" NOT NULL DEFAULT 'DRAFT',
    "filingDate" TIMESTAMP(3),
    "courtDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "outcome" TEXT,
    "courtName" TEXT,
    "judgeInfo" TEXT,
    "attorneyName" TEXT,
    "attorneyContact" TEXT,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyId" TEXT,
    "contractId" TEXT,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "LegalCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "filingDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "caseId" TEXT NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "caseId" TEXT NOT NULL,

    CONSTRAINT "LegalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "CustomFieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT,
    "entityType" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomFieldValue" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "reportType" TEXT NOT NULL,
    "parameters" TEXT,
    "lastGenerated" TIMESTAMP(3),
    "scheduleType" TEXT,
    "nextSchedule" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportGeneration" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "parameters" TEXT,
    "error" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReportGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventAttendee_userId_eventId_key" ON "EventAttendee"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_userId_conversationId_key" ON "ConversationParticipant"("userId", "conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldValue_fieldId_entityId_key" ON "CustomFieldValue"("fieldId", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_key_languageId_tenantId_key" ON "Translation"("key", "languageId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_tenantId_key" ON "Setting"("key", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyMaintenance" ADD CONSTRAINT "PropertyMaintenance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReminder" ADD CONSTRAINT "EventReminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RentalContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalDocument" ADD CONSTRAINT "LegalDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "LegalCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalEvent" ADD CONSTRAINT "LegalEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "LegalCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomField" ADD CONSTRAINT "CustomField_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomFieldValue" ADD CONSTRAINT "CustomFieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "CustomField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportGeneration" ADD CONSTRAINT "ReportGeneration_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportGeneration" ADD CONSTRAINT "ReportGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
