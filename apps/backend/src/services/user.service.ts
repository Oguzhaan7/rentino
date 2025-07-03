import { FastifyRequest, FastifyReply } from "fastify";
import bcryptjs from "bcryptjs";
import { prisma } from "database";

export const userService = {
  // List all users
  async listUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          tenantId: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const total = await prisma.user.count();

      await prisma.auditLog.create({
        data: {
          action: "USER_LIST",
          entityType: "User",
          entityId: "all",
          userId: request.user?.id || "",
          tenantId: request.user?.tenantId || undefined,
          newValues: JSON.stringify({ count: total }),
        },
      });

      return reply.status(200).send({
        data: users,
        pagination: {
          total,
          page: 1,
          limit: users.length,
          totalPages: 1,
        },
      });
    } catch (error: any) {
      request.log.error("Error listing users:", error);
      return reply.status(500).send({
        success: false,
        message: "Kullanıcılar listelenirken hata oluştu",
      });
    }
  },
  // Create new user
  async createUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password, firstName, lastName, phone, role, tenantId } = request.body as any;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          message: "Bu e-posta adresi ile kayıtlı kullanıcı zaten mevcut",
        });
      }
      const hashedPassword = await bcryptjs.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          role,
          tenantId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          tenantId: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "USER_CREATE",
          entityType: "User",
          entityId: user.id,
          userId: request.user?.id || "",
          tenantId: request.user?.tenantId || undefined,
          newValues: JSON.stringify({ email, role }),
        },
      });

      return reply.status(201).send({
        success: true,
        user,
        message: "Kullanıcı başarıyla oluşturuldu",
      });
    } catch (error: any) {
      request.log.error("Error creating user:", error);
      return reply.status(500).send({
        success: false,
        message: "Kullanıcı oluşturulurken hata oluştu",
      });
    }
  },
  // Get user by ID
  async getUserById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          tenantId: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "Kullanıcı bulunamadı",
        });
      }

      await prisma.auditLog.create({
        data: {
          action: "USER_VIEW",
          entityType: "User",
          entityId: id,
          userId: request.user?.id || "",
          tenantId: request.user?.tenantId || undefined,
          newValues: JSON.stringify({ email: user.email }),
        },
      });

      return reply.status(200).send({
        success: true,
        user,
      });
    } catch (error: any) {
      request.log.error("Error getting user:", error);
      return reply.status(500).send({
        success: false,
        message: "Kullanıcı bilgileri alınırken hata oluştu",
      });
    }
  },
  // Update user
  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { firstName, lastName, phone, role, isActive } = request.body as any;

      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return reply.status(404).send({
          success: false,
          message: "Kullanıcı bulunamadı",
        });
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          phone,
          role,
          isActive,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          tenantId: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      await prisma.auditLog.create({
        data: {
          action: "USER_UPDATE",
          entityType: "User",
          entityId: id,
          userId: request.user?.id || "",
          tenantId: request.user?.tenantId || undefined,
          newValues: JSON.stringify({ changes: request.body }),
        },
      });

      return reply.status(200).send({
        success: true,
        user,
        message: "Kullanıcı başarıyla güncellendi",
      });
    } catch (error: any) {
      request.log.error("Error updating user:", error);
      return reply.status(500).send({
        success: false,
        message: "Kullanıcı güncellenirken hata oluştu",
      });
    }
  },

  // Toggle user status
  async toggleUserStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { isActive } = request.body as any;

      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return reply.status(404).send({
          success: false,
          message: "Kullanıcı bulunamadı",
        });
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          isActive,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          tenantId: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "USER_STATUS_TOGGLE",
          entityType: "User",
          entityId: id,
          userId: request.user?.id || "",
          tenantId: request.user?.tenantId || undefined,
          newValues: JSON.stringify({ isActive }),
        },
      });

      return reply.status(200).send({
        success: true,
        user,
        message: `Kullanıcı başarıyla ${isActive ? "aktif" : "pasif"} edildi`,
      });
    } catch (error: any) {
      request.log.error("Error toggling user status:", error);
      return reply.status(500).send({
        success: false,
        message: "Kullanıcı durumu değiştirilirken hata oluştu",
      });
    }
  },

  // Delete user
  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return reply.status(404).send({
          success: false,
          message: "Kullanıcı bulunamadı",
        });
      }

      // Don't allow deleting yourself
      if (id === request.user?.id) {
        return reply.status(400).send({
          success: false,
          message: "Kendi hesabınızı silemezsiniz",
        });
      }

      await prisma.user.delete({ where: { id } });
      await prisma.auditLog.create({
        data: {
          action: "USER_DELETE",
          entityType: "User",
          entityId: id,
          userId: request.user?.id || "",
          tenantId: request.user?.tenantId || undefined,
          newValues: JSON.stringify({ email: existingUser.email }),
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Kullanıcı başarıyla silindi",
      });
    } catch (error: any) {
      request.log.error("Error deleting user:", error);
      return reply.status(500).send({
        success: false,
        message: "Kullanıcı silinirken hata oluştu",
      });
    }
  },

  // Get user statistics
  async getUserStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: { isActive: true },
      });
      const inactiveUsers = totalUsers - activeUsers;

      // Count users by role
      const usersByRole = await prisma.user.groupBy({
        by: ["role"],
        _count: {
          id: true,
        },
      });

      const byRole: Record<string, number> = {};
      usersByRole.forEach((group: any) => {
        byRole[group.role] = group._count.id;
      });

      // Count new users this month
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const newThisMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
          },
        },
      });

      const stats = {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole,
        newThisMonth,
      };

      await prisma.auditLog.create({
        data: {
          action: "USER_STATS",
          entityType: "User",
          entityId: "stats",
          userId: request.user?.id || "",
          tenantId: request.user?.tenantId || undefined,
          newValues: JSON.stringify(stats),
        },
      });

      return reply.status(200).send(stats);
    } catch (error: any) {
      request.log.error("Error getting user statistics:", error);
      return reply.status(500).send({
        success: false,
        message: "Kullanıcı istatistikleri alınırken hata oluştu",
      });
    }
  },

  // Get available roles
  async getRoles(request: FastifyRequest, reply: FastifyReply) {
    try {
      const roles = [
        {
          value: "ADMIN",
          label: "Yönetici",
          description: "Tüm sistem yetkileri",
        },
        {
          value: "PROPERTY_OWNER",
          label: "Mülk Sahibi",
          description: "Mülk yönetimi yetkileri",
        },
        {
          value: "MANAGER",
          label: "İşletme Müdürü",
          description: "Operasyonel yönetim yetkileri",
        },
        {
          value: "ACCOUNTANT",
          label: "Muhasebeci",
          description: "Mali işlemler yetkileri",
        },
        {
          value: "TENANT",
          label: "Kiracı",
          description: "Kira bilgileri görüntüleme",
        },
      ];

      return reply.status(200).send({
        success: true,
        roles,
      });
    } catch (error: any) {
      request.log.error("Error getting roles:", error);
      return reply.status(500).send({
        success: false,
        message: "Roller alınırken hata oluştu",
      });
    }
  },
};
