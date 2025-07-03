import { FastifyReply, FastifyRequest } from "fastify";
import { prisma, Prisma } from "database";
import { isAdmin, requireAuth } from "../utils/tenant";

export const tenantService = {
  async createTenant(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, domain, isActive = true } = request.body as any;

      if (domain) {
        const existingTenant = await prisma.tenant.findUnique({
          where: { domain },
        });

        if (existingTenant) {
          return reply.status(400).send({
            error: "Domain zaten kullanımda",
            message: "Bu domain başka bir tenant tarafından kullanılıyor",
          });
        }
      }

      const tenant = await prisma.tenant.create({
        data: {
          name,
          domain,
          isActive,
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId: (request.user as any)?.id,
            action: "TENANT_CREATE",
            entityType: "TENANT",
            entityId: tenant.id,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return tenant;
    } catch (error) {
      request.log.error(`Create tenant error: ${error}`);
      return reply.status(500).send({ error: "Tenant oluşturulamadı" });
    }
  },

  async getTenantById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              properties: true,
              buildings: true,
            },
          },
        },
      });

      if (!tenant) {
        return reply.status(404).send({ error: "Tenant bulunamadı" });
      }

      return tenant;
    } catch (error) {
      request.log.error(`Get tenant error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Tenant bilgileri alınırken hata oluştu" });
    }
  },

  async listTenants(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = "name:asc",
        isActive,
        search,
      } = request.query as any;

      const skip = (page - 1) * limit;
      const [orderField, orderDirection] = orderBy.split(":");

      const where: any = {};

      if (typeof isActive === "boolean") {
        where.isActive = isActive;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { domain: { contains: search, mode: "insensitive" } },
        ];
      }

      const totalCount = await prisma.tenant.count({ where });

      const tenants = await prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [orderField]: orderDirection.toLowerCase(),
        },
        select: {
          id: true,
          name: true,
          domain: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
              properties: true,
            },
          },
        },
      });

      return {
        data: tenants,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      request.log.error(`List tenants error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Tenantlar listelenirken hata oluştu" });
    }
  },

  async updateTenant(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const updateData = request.body as any;

      const existingTenant = await prisma.tenant.findUnique({
        where: { id },
      });

      if (!existingTenant) {
        return reply.status(404).send({ error: "Tenant bulunamadı" });
      }

      if (updateData.domain && updateData.domain !== existingTenant.domain) {
        const domainExists = await prisma.tenant.findUnique({
          where: { domain: updateData.domain },
        });

        if (domainExists) {
          return reply
            .status(400)
            .send({ error: "Bu domain zaten kullanılıyor" });
        }
      }

      const tenant = await prisma.tenant.update({
        where: { id },
        data: updateData,
      });

      return tenant;
    } catch (error) {
      request.log.error(`Update tenant error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Tenant güncellenirken hata oluştu" });
    }
  },

  async deleteTenant(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { permanent = false } = request.query as any;

      const existingTenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              properties: true,
              buildings: true,
            },
          },
        },
      });

      if (!existingTenant) {
        return reply.status(404).send({ error: "Tenant bulunamadı" });
      }

      const hasRelatedRecords =
        existingTenant._count.users > 0 ||
        existingTenant._count.properties > 0 ||
        existingTenant._count.buildings > 0;

      if (permanent) {
        if (hasRelatedRecords) {
          return reply.status(400).send({
            error: "İlişkili kayıtları olan tenant kalıcı olarak silinemez",
            message:
              "Önce tenant'a ait kullanıcılar, mülkler ve binaları silmeniz gerekmektedir",
          });
        }

        await prisma.tenant.delete({
          where: { id },
        });

        return { success: true, message: "Tenant başarıyla silindi" };
      } else {
        await prisma.tenant.update({
          where: { id },
          data: { isActive: false },
        });

        return { success: true, message: "Tenant pasif duruma alındı" };
      }
    } catch (error) {
      request.log.error(`Delete tenant error: ${error}`);
      return reply.status(500).send({ error: "Tenant silinirken hata oluştu" });
    }
  },

  async getTenantStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const tenant = await prisma.tenant.findUnique({
        where: { id },
      });

      if (!tenant) {
        return reply.status(404).send({ error: "Tenant bulunamadı" });
      }

      const [
        totalUsers,
        activeUsers,
        totalProperties,
        availableProperties,
        rentedProperties,
        totalBuildings,
        activeBuildings,
        totalContracts,
        activeContracts,
        totalPayments,
        paidPayments,
        totalRevenue,
        monthlyRevenue,
      ] = await Promise.all([
        prisma.user.count({
          where: { tenantId: id },
        }),
        prisma.user.count({
          where: { tenantId: id, isActive: true },
        }),
        prisma.property.count({
          where: { tenantId: id },
        }),
        prisma.property.count({
          where: { tenantId: id, status: "AVAILABLE" },
        }),
        prisma.property.count({
          where: { tenantId: id, status: "RENTED" },
        }),
        prisma.building.count({
          where: { tenantId: id },
        }),
        prisma.building.count({
          where: { tenantId: id, isActive: true },
        }),
        prisma.rentalContract.count({
          where: { tenantOrgId: id },
        }),
        prisma.rentalContract.count({
          where: { tenantOrgId: id, status: "ACTIVE" },
        }),
        prisma.rentalPayment.count({
          where: {
            contract: {
              tenantOrgId: id,
            },
          },
        }),
        prisma.rentalPayment.count({
          where: {
            contract: {
              tenantOrgId: id,
            },
            isPaid: true,
          },
        }),
        prisma.rentalPayment.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            contract: {
              tenantOrgId: id,
            },
            isPaid: true,
          },
        }),
        prisma.rentalPayment.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            contract: {
              tenantOrgId: id,
            },
            isPaid: true,
            paymentDate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lte: new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                0
              ),
            },
          },
        }),
      ]);

      const propertyTypeDistribution = await prisma.$queryRaw`
        SELECT "type", COUNT(*) as count
        FROM "Property"
        WHERE "tenantId" = ${id}
        GROUP BY "type"
      `;

      const contractStatusDistribution = await prisma.$queryRaw`
        SELECT "status", COUNT(*) as count
        FROM "RentalContract"
        WHERE "tenantOrgId" = ${id}
        GROUP BY "status"
      `;

      const monthlyPaymentTrend = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "paymentDate") as month,
          COUNT(*) as payment_count,
          SUM("amount") as total_amount
        FROM "RentalPayment" rp
        INNER JOIN "RentalContract" rc ON rp."contractId" = rc.id
        WHERE rc."tenantOrgId" = ${id}
          AND rp."isPaid" = true
          AND rp."paymentDate" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "paymentDate")
        ORDER BY month DESC
      `;

      return {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          isActive: tenant.isActive,
        },
        counts: {
          users: {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers,
          },
          properties: {
            total: totalProperties,
            available: availableProperties,
            rented: rentedProperties,
            underMaintenance:
              totalProperties - availableProperties - rentedProperties,
          },
          buildings: {
            total: totalBuildings,
            active: activeBuildings,
            inactive: totalBuildings - activeBuildings,
          },
          contracts: {
            total: totalContracts,
            active: activeContracts,
            inactive: totalContracts - activeContracts,
          },
          payments: {
            total: totalPayments,
            paid: paidPayments,
            unpaid: totalPayments - paidPayments,
          },
        },
        financials: {
          totalRevenue: totalRevenue._sum.amount || 0,
          monthlyRevenue: monthlyRevenue._sum.amount || 0,
          averageRent:
            totalRevenue._sum.amount && paidPayments
              ? totalRevenue._sum.amount / paidPayments
              : 0,
        },
        distributions: {
          propertyTypes: propertyTypeDistribution,
          contractStatuses: contractStatusDistribution,
        },
        trends: {
          monthlyPayments: monthlyPaymentTrend,
        },
      };
    } catch (error) {
      request.log.error(`Get tenant stats error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Tenant istatistikleri alınırken hata oluştu" });
    }
  },
};
