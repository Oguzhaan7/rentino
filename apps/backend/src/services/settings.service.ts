import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { promises as fs } from "fs";

const prisma = new PrismaClient();

export const settingsService = {
  // Get user settings
  async getSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: "Unauthorized",
        });
      }

      // Try to get existing settings
      let userSettings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      // If no settings exist, create default ones
      if (!userSettings) {
        userSettings = await prisma.userSettings.create({
          data: {
            userId,
            language: "tr",
            theme: "light",
            timezone: "Europe/Istanbul",
            notifications: {
              email: true,
              browser: true,
              sms: false,
            },
            dashboard: {
              showWelcome: true,
              compactMode: false,
            },
          },
        });
      }

      return reply.status(200).send({
        success: true,
        settings: {
          language: userSettings.language,
          theme: userSettings.theme,
          timezone: userSettings.timezone,
          notifications: userSettings.notifications as any,
          dashboard: userSettings.dashboard as any,
        },
      });
    } catch (error: any) {
      request.log.error("Error getting settings:", error);
      return reply.status(500).send({
        success: false,
        message: "Ayarlar alınırken hata oluştu",
      });
    }
  },
  // Update user settings
  async updateSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: "Unauthorized",
        });
      }

      const { language, theme, timezone, notifications, dashboard } =
        request.body as any;

      // Get existing settings or create defaults
      let existingSettings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      if (!existingSettings) {
        existingSettings = await prisma.userSettings.create({
          data: {
            userId,
            language: "tr",
            theme: "light",
            timezone: "Europe/Istanbul",
            notifications: {
              email: true,
              browser: true,
              sms: false,
            },
            dashboard: {
              showWelcome: true,
              compactMode: false,
            },
          },
        });
      }

      // Merge new settings with existing ones
      const updatedNotifications = {
        ...(existingSettings.notifications as any),
        ...notifications,
      };

      const updatedDashboard = {
        ...(existingSettings.dashboard as any),
        ...dashboard,
      };

      const updatedSettings = await prisma.userSettings.update({
        where: { userId },
        data: {
          language: language ?? existingSettings.language,
          theme: theme ?? existingSettings.theme,
          timezone: timezone ?? existingSettings.timezone,
          notifications: updatedNotifications,
          dashboard: updatedDashboard,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "SETTINGS_UPDATE",
          entityType: "UserSettings",
          entityId: userId,
          userId: userId,
          tenantId: request.user?.tenantId || undefined,
          newValues: JSON.stringify({ changes: request.body }),
        },
      });

      return reply.status(200).send({
        success: true,
        settings: {
          language: updatedSettings.language,
          theme: updatedSettings.theme,
          timezone: updatedSettings.timezone,
          notifications: updatedSettings.notifications as any,
          dashboard: updatedSettings.dashboard as any,
        },
        message: "Ayarlar başarıyla güncellendi",
      });
    } catch (error: any) {
      request.log.error("Error updating settings:", error);
      return reply.status(500).send({
        success: false,
        message: "Ayarlar güncellenirken hata oluştu",
      });
    }
  },

  // Upload avatar (simplified version - in production use cloud storage)
  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: "Unauthorized",
        });
      }

      // For now, return a placeholder implementation
      // In production, implement proper file upload with multipart/form-data
      const avatarUrl = `/avatars/default-${userId}.jpg`;

      await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
      });

      await prisma.auditLog.create({
        data: {
          action: "AVATAR_UPLOAD",
          entityType: "User",
          entityId: userId,
          userId: userId,
          tenantId: request.user?.tenantId || undefined,
          newValues: JSON.stringify({ avatarUrl }),
        },
      });

      return reply.status(200).send({
        success: true,
        avatarUrl,
        message: "Avatar başarıyla yüklendi",
      });
    } catch (error: any) {
      request.log.error("Error uploading avatar:", error);
      return reply.status(500).send({
        success: false,
        message: "Avatar yüklenirken hata oluştu",
      });
    }
  },
};
