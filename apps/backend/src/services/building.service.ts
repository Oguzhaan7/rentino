import { FastifyReply, FastifyRequest } from "fastify";
import { prisma, Prisma } from "database";
import {
  getTenantId,
  isAdmin,
  createTenantAwareWhere,
  validateResourceAccess,
  requireTenant,
  requireAuth,
} from "../utils/tenant.js";
import {
  CreateBuildingBody,
  UpdateBuildingBody,
  ListBuildingsQuery,
  BuildingIdParam,
  BuildingIdWithQuery,
  AddBuildingExpenseBody,
  CreateDuesBody,
  BuildingExpenseParam,
  BuildingDuesParam,
} from "../types/building.types.js";

export const buildingService = {
  async createBuilding(
    request: FastifyRequest<{ Body: CreateBuildingBody }>,
    reply: FastifyReply
  ) {
    try {
      const {
        name,
        address,
        city,
        district,
        totalUnits,
        constructionYear,
        isActive = true,
        managerId,
      } = request.body;
      const user = requireAuth(request);
      const tenantId = requireTenant(request);

      const manager = await prisma.user.findUnique({
        where: { id: managerId },
      });

      if (!manager) {
        return reply
          .status(404)
          .send({ error: "Belirtilen yönetici bulunamadı" });
      }

      const building = await prisma.building.create({
        data: {
          name,
          address,
          city,
          district,
          totalUnits,
          constructionYear,
          isActive,
          managerId,
          tenantId,
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId: request.user.id,
            action: "BUILDING_CREATE",
            entityType: "BUILDING",
            entityId: building.id,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return building;
    } catch (error) {
      request.log.error(`Create building error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Bina oluşturulurken bir hata oluştu" });
    }
  },

  async listBuildings(
    request: FastifyRequest<{ Querystring: ListBuildingsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = "name:asc",
        search,
        city,
        district,
        isActive,
        managerId,
      } = request.query;

      let where = createTenantAwareWhere(request);

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ];
      }

      if (typeof isActive === "boolean") where.isActive = isActive;
      if (city) where.city = { contains: city, mode: "insensitive" };
      if (district)
        where.district = { contains: district, mode: "insensitive" };
      if (managerId) where.managerId = managerId;

      const [orderField, orderDirection] = orderBy.split(":");
      const orderByObj = {
        [orderField]: orderDirection.toLowerCase(),
      } as Prisma.BuildingOrderByWithRelationInput;

      const skip = (page - 1) * limit;
      const take = limit;

      const totalCount = await prisma.building.count({ where });

      const buildings = await prisma.building.findMany({
        where,
        orderBy: orderByObj,
        skip,
        take,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              properties: true,
              dues: true,
              expenses: true,
            },
          },
        },
      });

      return {
        data: buildings,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      request.log.error(`List buildings error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Binalar listelenirken bir hata oluştu" });
    }
  },

  async getBuildingById(
    request: FastifyRequest<{ Params: BuildingIdParam }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const tenantId = request.tenant?.id || request.user.tenantId;
      const isAdmin = request.user.role === "ADMIN";

      // Bina sorgulama
      const building = await prisma.building.findUnique({
        where: { id },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          properties: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              floor: true,
              numberOfRooms: true,
            },
          },
          expenses: {
            select: {
              id: true,
              title: true,
              amount: true,
              expenseDate: true,
              expenseType: true,
              isPaid: true,
            },
            orderBy: {
              expenseDate: "desc",
            },
            take: 5,
          },
          dues: {
            select: {
              id: true,
              period: true,
              amount: true,
              dueDate: true,
            },
            orderBy: {
              period: "desc",
            },
            take: 5,
          },
        },
      });

      if (!building) {
        return reply.status(404).send({ error: "Bina bulunamadı" });
      }

      if (!isAdmin && building.tenantId !== tenantId) {
        return reply
          .status(403)
          .send({ error: "Bu binaya erişim yetkiniz yok" });
      }

      return building;
    } catch (error) {
      request.log.error(`Get building error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Bina bilgileri alınırken bir hata oluştu" });
    }
  },

  async updateBuilding(
    request: FastifyRequest<{
      Params: BuildingIdParam;
      Body: UpdateBuildingBody;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const updateData = request.body;
      const tenantId = request.tenant?.id || request.user.tenantId;
      const isAdmin = request.user.role === "ADMIN";
      const isManager = request.user.role === "MANAGER";

      const existingBuilding = await prisma.building.findUnique({
        where: { id },
      });

      if (!existingBuilding) {
        return reply.status(404).send({ error: "Bina bulunamadı" });
      }

      if (!isAdmin) {
        if (isManager && existingBuilding.managerId !== request.user.id) {
          return reply
            .status(403)
            .send({ error: "Bu bina üzerinde düzenleme yetkiniz yok" });
        }

        if (existingBuilding.tenantId !== tenantId) {
          return reply
            .status(403)
            .send({ error: "Bu bina üzerinde düzenleme yetkiniz yok" });
        }
      }

      if (updateData.managerId) {
        const manager = await prisma.user.findUnique({
          where: { id: updateData.managerId },
        });

        if (!manager) {
          return reply
            .status(404)
            .send({ error: "Belirtilen yönetici bulunamadı" });
        }
      }

      const updatedBuilding = await prisma.building.update({
        where: { id },
        data: updateData as Prisma.BuildingUpdateInput,
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId: request.user.id,
            action: "BUILDING_UPDATE",
            entityType: "BUILDING",
            entityId: updatedBuilding.id,
            oldValues: JSON.stringify(existingBuilding),
            newValues: JSON.stringify(updatedBuilding),
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId: existingBuilding.tenantId,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return updatedBuilding;
    } catch (error) {
      request.log.error(`Update building error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Bina güncellenirken bir hata oluştu" });
    }
  },

  async deleteBuilding(
    request: FastifyRequest<{
      Params: BuildingIdParam;
      Querystring: { permanent?: boolean };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const { permanent = false } = request.query;

      const tenantId = request.tenant?.id || request.user.tenantId;
      const isAdmin = request.user.role === "ADMIN";

      const existingBuilding = await prisma.building.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              properties: true,
              dues: true,
              expenses: true,
            },
          },
        },
      });

      if (!existingBuilding) {
        return reply.status(404).send({ error: "Bina bulunamadı" });
      }

      if (!isAdmin && existingBuilding.tenantId !== tenantId) {
        return reply
          .status(403)
          .send({ error: "Bu bina üzerinde silme yetkiniz yok" });
      }

      const hasRelatedRecords = existingBuilding._count.properties > 0;

      if (permanent) {
        if (hasRelatedRecords) {
          return reply.status(400).send({
            error: "İçinde mülk barındıran bina kalıcı olarak silinemez",
            message:
              "Önce binaya ait mülkleri silmeniz veya başka binaya taşımanız gerekmektedir",
          });
        }

        await prisma.$transaction([
          prisma.buildingExpense.deleteMany({ where: { buildingId: id } }),
          prisma.dues.deleteMany({ where: { buildingId: id } }),
          prisma.building.delete({ where: { id } }),
        ]);

        try {
          await prisma.auditLog.create({
            data: {
              userId: request.user.id,
              action: "BUILDING_DELETE",
              entityType: "BUILDING",
              entityId: id,
              oldValues: JSON.stringify(existingBuilding),
              ipAddress: request.ip,
              userAgent: request.headers["user-agent"] as string,
              tenantId: existingBuilding.tenantId,
            },
          });
        } catch (logError) {
          request.log.error(`Audit log error: ${logError}`);
        }

        return { success: true, message: "Bina başarıyla silindi" };
      } else {
        await prisma.building.update({
          where: { id },
          data: {
            isActive: false,
          } as Prisma.BuildingUpdateInput,
        });

        try {
          await prisma.auditLog.create({
            data: {
              userId: request.user.id,
              action: "BUILDING_DEACTIVATE",
              entityType: "BUILDING",
              entityId: id,
              oldValues: JSON.stringify(existingBuilding),
              newValues: JSON.stringify({
                ...existingBuilding,
                isActive: false,
              }),
              ipAddress: request.ip,
              userAgent: request.headers["user-agent"] as string,
              tenantId: existingBuilding.tenantId,
            },
          });
        } catch (logError) {
          request.log.error(`Audit log error: ${logError}`);
        }

        return { success: true, message: "Bina pasif duruma alındı" };
      }
    } catch (error) {
      request.log.error(`Delete building error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Bina silinirken bir hata oluştu" });
    }
  },

  async addBuildingExpense(
    request: FastifyRequest<{
      Params: BuildingExpenseParam;
      Body: AddBuildingExpenseBody;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { buildingId } = request.params;
      const {
        title,
        description,
        amount,
        expenseDate,
        expenseType,
        invoiceNumber,
        paidAt,
        isPaid = false,
      } = request.body;

      const tenantId = request.tenant?.id || request.user.tenantId;
      const isAdmin = request.user.role === "ADMIN";
      const isManager = request.user.role === "MANAGER";

      const building = await prisma.building.findUnique({
        where: { id: buildingId },
      });

      if (!building) {
        return reply.status(404).send({ error: "Bina bulunamadı" });
      }

      if (!isAdmin) {
        if (isManager && building.managerId !== request.user.id) {
          return reply
            .status(403)
            .send({ error: "Bu binaya gider ekleme yetkiniz yok" });
        }

        if (building.tenantId !== tenantId) {
          return reply
            .status(403)
            .send({ error: "Bu binaya gider ekleme yetkiniz yok" });
        }
      }

      const expense = await prisma.buildingExpense.create({
        data: {
          title,
          description,
          amount,
          expenseDate: new Date(expenseDate),
          expenseType,
          invoiceNumber,
          paidAt: paidAt ? new Date(paidAt) : null,
          isPaid,
          buildingId,
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId: request.user.id,
            action: "BUILDING_EXPENSE_ADD",
            entityType: "BUILDING_EXPENSE",
            entityId: expense.id,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId: building.tenantId,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return expense;
    } catch (error) {
      request.log.error(`Add building expense error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Bina gideri eklenirken bir hata oluştu" });
    }
  },

  async createDues(
    request: FastifyRequest<{
      Params: BuildingDuesParam;
      Body: CreateDuesBody;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { buildingId } = request.params;
      const { period, amount, dueDate, description } = request.body;

      const tenantId = request.tenant?.id || request.user.tenantId;
      const isAdmin = request.user.role === "ADMIN";
      const isManager = request.user.role === "MANAGER";

      const building = await prisma.building.findUnique({
        where: { id: buildingId },
      });

      if (!building) {
        return reply.status(404).send({ error: "Bina bulunamadı" });
      }

      if (!isAdmin) {
        if (isManager && building.managerId !== request.user.id) {
          return reply
            .status(403)
            .send({ error: "Bu binaya aidat ekleme yetkiniz yok" });
        }

        if (building.tenantId !== tenantId) {
          return reply
            .status(403)
            .send({ error: "Bu binaya aidat ekleme yetkiniz yok" });
        }
      }

      const existingDues = await prisma.dues.findFirst({
        where: {
          buildingId,
          period: new Date(period),
        },
      });

      if (existingDues) {
        return reply.status(400).send({
          error: "Bu dönem için zaten aidat tanımlanmış",
          message: "Aynı döneme ait birden fazla aidat tanımlanamaz",
        });
      }

      const dues = await prisma.dues.create({
        data: {
          period: new Date(period),
          amount,
          dueDate: new Date(dueDate),
          description,
          buildingId,
        },
      });

      const properties = await prisma.property.findMany({
        where: {
          buildingId,
          status: "RENTED",
        },
      });

      if (properties.length > 0) {
        const duesPayments = properties.map((property) => ({
          amount,
          isPaid: false,
          duesId: dues.id,
        }));

        await prisma.duesPayment.createMany({
          data: duesPayments,
        });
      }

      try {
        await prisma.auditLog.create({
          data: {
            userId: request.user.id,
            action: "DUES_CREATE",
            entityType: "DUES",
            entityId: dues.id,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId: building.tenantId,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return dues;
    } catch (error) {
      request.log.error(`Create dues error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Aidat oluşturulurken bir hata oluştu" });
    }
  },

  async getBuildingStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = request.tenant?.id || request.user.tenantId;
      const isAdmin = request.user.role === "ADMIN";

      const where = !isAdmin && tenantId ? { tenantId } : {};

      const [
        totalBuildings,
        buildingsWithProperties,
        totalProperties,
        occupiedProperties,
      ] = await Promise.all([
        prisma.building.count({ where }),
        prisma.building.findMany({
          where,
          include: {
            _count: {
              select: {
                properties: true,
              },
            },
          },
        }),
        prisma.property.count({
          where: {
            building: where,
          },
        }),
        prisma.property.count({
          where: {
            building: where,
            status: "RENTED",
          },
        }),
      ]);

      const totalUnits = buildingsWithProperties.reduce(
        (sum, building) => sum + building.totalUnits,
        0
      );

      const vacantUnits = totalUnits - occupiedProperties;

      const [totalExpenses, totalDues, paidDues, unpaidDues] =
        await Promise.all([
          prisma.buildingExpense.aggregate({
            _sum: { amount: true },
            where: {
              building: where,
            },
          }),
          prisma.dues.aggregate({
            _sum: { amount: true },
            where: {
              building: where,
            },
          }),
          prisma.duesPayment.aggregate({
            _sum: { amount: true },
            where: {
              isPaid: true,
              dues: {
                building: where,
              },
            },
          }),
          prisma.duesPayment.aggregate({
            _sum: { amount: true },
            where: {
              isPaid: false,
              dues: {
                building: where,
              },
            },
          }),
        ]);

      const expensesByType = await prisma.$queryRaw`
        SELECT "expenseType", SUM(amount) as "totalAmount"
        FROM "BuildingExpense"
        WHERE ${
          tenantId ? Prisma.sql`"tenantId" = ${tenantId}` : Prisma.sql`1=1`
        }
        GROUP BY "expenseType"
        ORDER BY "totalAmount" DESC
      `;

      const expensesByMonth = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "expenseDate") as "month",
          SUM(amount) as "totalAmount"
        FROM "BuildingExpense"
        WHERE ${
          tenantId ? Prisma.sql`"tenantId" = ${tenantId}` : Prisma.sql`1=1`
        }
        GROUP BY DATE_TRUNC('month', "expenseDate")
        ORDER BY "month" DESC
        LIMIT 12
      `;

      return {
        counts: {
          totalBuildings,
          totalUnits,
          occupiedUnits: occupiedProperties,
          vacantUnits,
        },
        financials: {
          totalExpenses: totalExpenses._sum?.amount || 0,
          paidExpenses: 0,
          unpaidExpenses: 0,
          totalDues: totalDues._sum?.amount || 0,
          paidDues: paidDues._sum?.amount || 0,
          unpaidDues: unpaidDues._sum?.amount || 0,
        },
        distributions: {
          expensesByType,
          expensesByMonth,
        },
      };
    } catch (error) {
      request.log.error(`Get building stats error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Bina istatistikleri alınırken bir hata oluştu" });
    }
  },
};
