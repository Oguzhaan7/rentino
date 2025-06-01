import { FastifyReply, FastifyRequest } from "fastify";
import { prisma, Prisma } from "database";
import {
  getTenantId,
  isAdmin,
  createTenantAwareWhere,
  validateResourceAccess,
  requireTenant,
  requireAuth,
} from "../utils/tenant";

export const propertyService = {
  async createProperty(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = requireTenant(request);
      const user = requireAuth(request);
      const data = request.body as any;

      // Validate required fields
      if (
        !data.title ||
        !data.type ||
        !data.address ||
        !data.city ||
        !data.district ||
        !data.totalArea
      ) {
        return reply.status(400).send({
          error: "Gerekli alanlar eksik",
          details:
            "Başlık, tür, adres, şehir, ilçe ve toplam alan alanları zorunludur",
        });
      } // Set ownerId if not provided (default to current user)
      const propertyData = {
        ...data,
        ownerId: data.ownerId || user.id,
        tenantId,
      };

      const property = await prisma.property.create({
        data: propertyData,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          building: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId: request.user!.id,
            action: "PROPERTY_CREATE",
            entityType: "PROPERTY",
            entityId: property.id,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return property;
    } catch (error) {
      request.log.error(`Create property error: ${error}`);

      // Handle Prisma validation errors
      if (error instanceof Prisma.PrismaClientValidationError) {
        return reply.status(400).send({
          error: "Geçersiz veri formatı",
          details: error.message,
        });
      }

      // Handle unique constraint errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return reply.status(409).send({
            error: "Bu bilgilerle zaten bir mülk mevcut",
          });
        }
        if (error.code === "P2003") {
          return reply.status(400).send({
            error: "Bağlantılı kayıt bulunamadı",
            details: "Belirtilen bina veya kullanıcı bulunamadı",
          });
        }
      }

      return reply
        .status(500)
        .send({ error: "Mülk oluşturulurken bir hata oluştu" });
    }
  },

  async listProperties(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = "createdAt:desc",
        search,
        status,
        type,
        city,
        district,
        minArea,
        maxArea,
        minRooms,
        maxRooms,
        buildingId,
      } = request.query as any;

      let where = createTenantAwareWhere(request);

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) where.status = status;
      if (type) where.type = type;
      if (city) where.city = { contains: city, mode: "insensitive" };
      if (district)
        where.district = { contains: district, mode: "insensitive" };
      if (buildingId) where.buildingId = buildingId;

      if (minArea) where.totalArea = { gte: parseFloat(minArea) };
      if (maxArea) {
        where.totalArea = {
          ...(where.totalArea || {}),
          lte: parseFloat(maxArea),
        };
      }

      const [orderField, orderDirection] = orderBy.split(":");
      const orderByObj = { [orderField]: orderDirection.toLowerCase() };
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const [totalCount, properties] = await Promise.all([
        prisma.property.count({ where }),
        prisma.property.findMany({
          where,
          orderBy: orderByObj,
          skip,
          take,
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            building: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            _count: {
              select: {
                rentalContracts: true,
                documents: true,
                maintenances: true,
              },
            },
          },
        }),
      ]);

      return {
        data: properties,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
        },
      };
    } catch (error) {
      request.log.error(`List properties error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Mülkler listelenirken bir hata oluştu" });
    }
  },

  async getPropertyById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          building: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          documents: true,
          maintenances: true,
          rentalContracts: {
            where: { status: "ACTIVE" },
            include: {
              tenant: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      if (!property) {
        return reply.status(404).send({ error: "Mülk bulunamadı" });
      }

      if (!validateResourceAccess(request, property.tenantId || "")) {
        return reply.status(403).send({
          error: "Bu mülke erişim yetkiniz yok",
        });
      }

      return property;
    } catch (error) {
      request.log.error(`Get property error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Mülk bilgileri alınırken bir hata oluştu" });
    }
  },

  async updateProperty(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const data = request.body as any;
      const user = requireAuth(request);

      const existingProperty = await prisma.property.findUnique({
        where: { id },
        select: { id: true, tenantId: true },
      });

      if (!existingProperty) {
        return reply.status(404).send({ error: "Mülk bulunamadı" });
      }

      if (!validateResourceAccess(request, existingProperty.tenantId || "")) {
        return reply.status(403).send({
          error: "Bu mülke erişim yetkiniz yok",
        });
      }
      const property = await prisma.property.update({
        where: { id },
        data: data,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          building: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      });

      return property;
    } catch (error) {
      request.log.error(`Update property error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Mülk güncellenirken bir hata oluştu" });
    }
  },

  async deleteProperty(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { permanent = false } = request.query as any;

      const tenantId = request.tenant?.id || request.user?.tenantId;
      const isAdminUser = request.user?.role === "ADMIN";
      const isPropertyOwner = request.user?.role === "PROPERTY_OWNER";

      const existingProperty = await prisma.property.findUnique({
        where: { id },
        include: {
          rentalContracts: {
            where: {
              status: "ACTIVE",
            },
          },
          _count: {
            select: {
              rentalContracts: true,
              documents: true,
              maintenances: true,
              legalCases: true,
            },
          },
        },
      });

      if (!existingProperty) {
        return reply.status(404).send({ error: "Mülk bulunamadı" });
      }

      if (!isAdminUser) {
        if (isPropertyOwner && existingProperty.ownerId !== request.user?.id) {
          return reply
            .status(403)
            .send({ error: "Bu mülk üzerinde silme yetkiniz yok" });
        }

        if (existingProperty.tenantId !== tenantId) {
          return reply
            .status(403)
            .send({ error: "Bu mülk üzerinde silme yetkiniz yok" });
        }
      }

      if (existingProperty.rentalContracts.length > 0) {
        return reply.status(400).send({
          error: "Aktif kira sözleşmesi olan mülk silinemez",
          message: "Önce kira sözleşmelerini sonlandırmanız gerekmektedir.",
        });
      }

      if (permanent) {
        const hasRelatedRecords =
          existingProperty._count.documents > 0 ||
          existingProperty._count.maintenances > 0 ||
          existingProperty._count.legalCases > 0 ||
          existingProperty._count.rentalContracts > 0;

        if (hasRelatedRecords) {
          return reply.status(400).send({
            error: "İlişkili kayıtları olan mülk kalıcı olarak silinemez",
            message:
              "Bu mülkle ilişkili belgeler, bakım kayıtları veya sözleşmeler mevcut",
          });
        }

        await prisma.property.delete({
          where: { id },
        });

        try {
          await prisma.auditLog.create({
            data: {
              userId: request.user!.id,
              action: "PROPERTY_DELETE",
              entityType: "PROPERTY",
              entityId: id,
              oldValues: JSON.stringify(existingProperty),
              ipAddress: request.ip,
              userAgent: request.headers["user-agent"] as string,
              tenantId: existingProperty.tenantId || undefined,
            },
          });
        } catch (logError) {
          request.log.error(`Audit log error: ${logError}`);
        }

        return { success: true, message: "Mülk başarıyla silindi" };
      } else {
        await prisma.property.update({
          where: { id },
          data: { isActive: false },
        });

        try {
          await prisma.auditLog.create({
            data: {
              userId: request.user!.id,
              action: "PROPERTY_DEACTIVATE",
              entityType: "PROPERTY",
              entityId: id,
              oldValues: JSON.stringify(existingProperty),
              newValues: JSON.stringify({
                ...existingProperty,
                isActive: false,
              }),
              ipAddress: request.ip,
              userAgent: request.headers["user-agent"] as string,
              tenantId: existingProperty.tenantId || undefined,
            },
          });
        } catch (logError) {
          request.log.error(`Audit log error: ${logError}`);
        }

        return { success: true, message: "Mülk pasif duruma alındı" };
      }
    } catch (error) {
      request.log.error(`Delete property error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Mülk silinirken bir hata oluştu" });
    }
  },

  async addPropertyDocument(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { propertyId } = request.params as any;
      const data = request.body as any;
      const tenantId = requireTenant(request);

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, tenantId: true },
      });

      if (!property) {
        return reply.status(404).send({ error: "Mülk bulunamadı" });
      }

      if (!validateResourceAccess(request, property.tenantId || "")) {
        return reply.status(403).send({
          error: "Bu mülke erişim yetkiniz yok",
        });
      }

      const document = await prisma.propertyDocument.create({
        data: {
          ...data,
          propertyId,
          tenantId,
        },
      });

      return document;
    } catch (error) {
      request.log.error(`Add property document error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Belge eklenirken bir hata oluştu" });
    }
  },

  async addPropertyMaintenance(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { propertyId } = request.params as any;
      const data = request.body as any;
      const tenantId = requireTenant(request);

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, tenantId: true },
      });

      if (!property) {
        return reply.status(404).send({ error: "Mülk bulunamadı" });
      }

      if (!validateResourceAccess(request, property.tenantId || "")) {
        return reply.status(403).send({
          error: "Bu mülke erişim yetkiniz yok",
        });
      }

      const maintenance = await prisma.propertyMaintenance.create({
        data: {
          ...data,
          propertyId,
          tenantId,
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
            },
          },
        },
      });

      return maintenance;
    } catch (error) {
      request.log.error(`Add property maintenance error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Bakım kaydı eklenirken bir hata oluştu" });
    }
  },

  async getPropertyStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = request.tenant?.id || request.user?.tenantId;
      const isAdminUser = request.user?.role === "ADMIN";

      const where = !isAdminUser && tenantId ? { tenantId } : {};

      const [
        totalProperties,
        availableProperties,
        rentedProperties,
        underMaintenanceProperties,
        totalMaintenance,
        totalDocuments,
        averageRent,
      ] = await Promise.all([
        prisma.property.count({ where }),
        prisma.property.count({ where: { ...where, status: "AVAILABLE" } }),
        prisma.property.count({ where: { ...where, status: "RENTED" } }),
        prisma.property.count({
          where: { ...where, status: "UNDER_MAINTENANCE" },
        }),
        prisma.propertyMaintenance.count({
          where: tenantId ? { tenantId } : {},
        }),
        prisma.propertyDocument.count({
          where: tenantId ? { tenantId } : {},
        }),
        prisma.rentalContract.aggregate({
          _avg: {
            monthlyRent: true,
          },
          where: tenantId ? { tenantOrgId: tenantId } : {},
        }),
      ]);

      const propertyTypeDistribution = await prisma.$queryRaw`
        SELECT "type", COUNT(*) as count
        FROM "Property"
        WHERE ${
          tenantId ? Prisma.sql`"tenantId" = ${tenantId}` : Prisma.sql`1=1`
        }
        GROUP BY "type"
      `;

      const cityDistribution = await prisma.$queryRaw`
        SELECT "city", COUNT(*) as count
        FROM "Property"
        WHERE ${
          tenantId ? Prisma.sql`"tenantId" = ${tenantId}` : Prisma.sql`1=1`
        }
        GROUP BY "city"
        ORDER BY count DESC
        LIMIT 10
      `;

      return {
        counts: {
          total: totalProperties,
          available: availableProperties,
          rented: rentedProperties,
          underMaintenance: underMaintenanceProperties,
          maintenanceRecords: totalMaintenance,
          documents: totalDocuments,
        },
        financials: {
          averageRent: averageRent._avg.monthlyRent || 0,
        },
        distributions: {
          propertyTypes: propertyTypeDistribution,
          cities: cityDistribution,
        },
      };
    } catch (error) {
      request.log.error(`Get property stats error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Mülk istatistikleri alınırken bir hata oluştu" });
    }
  },
};
