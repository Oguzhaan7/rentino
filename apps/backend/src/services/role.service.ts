import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "database";

export const roleService = {
  async listRoles(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get user counts for each role
      const userCounts = await prisma.user.groupBy({
        by: ["role"],
        _count: {
          id: true,
        },
        where: {
          isActive: true,
        },
      });

      // Define role configurations
      const roleConfigs = [
        {
          id: "ADMIN",
          name: "Yönetici",
          description: "Sistem yöneticisi, tüm izinlere sahip",
          color: "red",
          icon: "Shield",
          permissions: [
            "user_management",
            "tenant_management",
            "property_management",
            "building_management",
            "contract_management",
            "financial_management",
            "report_access",
            "system_settings",
          ],
        },
        {
          id: "PROPERTY_OWNER",
          name: "Mülk Sahibi",
          description: "Mülk sahipleri, kendi mülklerini yönetebilir",
          color: "blue",
          icon: "Home",
          permissions: ["property_management", "contract_management", "financial_reports", "tenant_communication"],
        },
        {
          id: "MANAGER",
          name: "Müdür",
          description: "Operasyonel yönetici, günlük işlemleri yönetir",
          color: "green",
          icon: "Users",
          permissions: [
            "property_management",
            "building_management",
            "contract_management",
            "maintenance_management",
            "report_access",
          ],
        },
        {
          id: "ACCOUNTANT",
          name: "Muhasebeci",
          description: "Mali işler uzmanı, finansal işlemleri yönetir",
          color: "purple",
          icon: "Calculator",
          permissions: ["financial_management", "payment_processing", "invoice_management", "financial_reports"],
        },
        {
          id: "TENANT",
          name: "Kiracı",
          description: "Kiracı kullanıcılar, kendi bilgilerini görüntüleyebilir",
          color: "orange",
          icon: "User",
          permissions: ["profile_view", "payment_history", "maintenance_requests", "contract_view"],
        },
      ];

      // Combine role configs with user counts
      const rolesWithCounts = roleConfigs.map((role) => {
        const userCount = userCounts.find((count) => count.role === role.id)?._count.id || 0;
        return {
          ...role,
          userCount,
          isActive: true,
        };
      });

      return {
        data: rolesWithCounts,
      };
    } catch (error) {
      request.log.error(`List roles error: ${error}`);
      return reply.status(500).send({ error: "Roller listelenirken hata oluştu" });
    }
  },

  async getRolePermissions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { role } = request.params as { role: string };

      // Define permission groups and individual permissions
      const permissionGroups = {
        "Kullanıcı Yönetimi": {
          ADMIN: ["user_create", "user_read", "user_update", "user_delete", "user_role_change"],
          PROPERTY_OWNER: [],
          MANAGER: ["user_read"],
          ACCOUNTANT: [],
          TENANT: [],
        },
        "Mülk Yönetimi": {
          ADMIN: ["property_create", "property_read", "property_update", "property_delete"],
          PROPERTY_OWNER: ["property_create", "property_read", "property_update", "property_delete"],
          MANAGER: ["property_create", "property_read", "property_update"],
          ACCOUNTANT: ["property_read"],
          TENANT: [],
        },
        "Bina Yönetimi": {
          ADMIN: ["building_create", "building_read", "building_update", "building_delete"],
          PROPERTY_OWNER: ["building_create", "building_read", "building_update"],
          MANAGER: ["building_create", "building_read", "building_update", "building_delete"],
          ACCOUNTANT: ["building_read"],
          TENANT: [],
        },
        "Sözleşme Yönetimi": {
          ADMIN: ["contract_create", "contract_read", "contract_update", "contract_delete"],
          PROPERTY_OWNER: ["contract_create", "contract_read", "contract_update"],
          MANAGER: ["contract_create", "contract_read", "contract_update"],
          ACCOUNTANT: ["contract_read"],
          TENANT: ["contract_read"],
        },
        "Finansal İşlemler": {
          ADMIN: ["finance_all"],
          PROPERTY_OWNER: ["finance_reports", "invoice_view"],
          MANAGER: ["payment_processing", "invoice_create"],
          ACCOUNTANT: ["finance_all", "payment_processing", "invoice_management"],
          TENANT: ["payment_history"],
        },
        Raporlar: {
          ADMIN: ["report_all"],
          PROPERTY_OWNER: ["income_reports", "occupancy_reports"],
          MANAGER: ["income_reports", "occupancy_reports", "maintenance_reports"],
          ACCOUNTANT: ["financial_reports", "income_reports"],
          TENANT: [],
        },
      };

      // Get permissions for the specific role
      const rolePermissions: string[] = [];
      const groups: Record<string, string[]> = {};

      for (const [groupName, groupPermissions] of Object.entries(permissionGroups)) {
        const rolePerms = groupPermissions[role as keyof typeof groupPermissions] || [];
        if (rolePerms.length > 0) {
          groups[groupName] = rolePerms;
          rolePermissions.push(...rolePerms);
        }
      }

      return {
        role,
        permissions: rolePermissions,
        groups,
      };
    } catch (error) {
      request.log.error(`Get role permissions error: ${error}`);
      return reply.status(500).send({ error: "Rol izinleri alınırken hata oluştu" });
    }
  },

  async getRoleStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { role } = request.params as { role: string };

      // Get users with this role
      const totalUsers = await prisma.user.count({
        where: { role: role as any },
      });

      const activeUsers = await prisma.user.count({
        where: {
          role: role as any,
          isActive: true,
        },
      });

      const lastLoginUser = await prisma.user.findFirst({
        where: {
          role: role as any,
          lastLogin: { not: null },
        },
        orderBy: { lastLogin: "desc" },
      });

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const createdThisMonth = await prisma.user.count({
        where: {
          role: role as any,
          createdAt: { gte: thisMonth },
        },
      });

      return {
        role,
        userCount: totalUsers,
        activeUsers,
        lastLogin: lastLoginUser?.lastLogin?.toISOString() || null,
        createdThisMonth,
      };
    } catch (error) {
      request.log.error(`Get role stats error: ${error}`);
      return reply.status(500).send({ error: "Rol istatistikleri alınırken hata oluştu" });
    }
  },

  async updateRolePermissions(request: FastifyRequest, reply: FastifyReply) {
    const { role } = request.params as { role: string };
    const { permissions } = request.body as { permissions: string[] };
    try {
      // This is a placeholder for future role permission customization
      // Currently, permissions are hardcoded based on role type

      return {
        success: false,
        message: "Rol izinleri şu anda özelleştirilemez. Bu özellik gelecek sürümlerde eklenecektir.",
      };
    } catch (error) {
      request.log.error(`Update role permissions error: ${error}`);
      return reply.status(500).send({ error: "Rol izinleri güncellenirken hata oluştu" });
    }
  },
};
