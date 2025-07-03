import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "database";

export const rentalTenantService = {
  async listRentalTenants(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, status, property } = request.query as any;

      const skip = (page - 1) * limit;
      const where: any = {
        role: "TENANT", // Only users with TENANT role
      };

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.isActive = status === "ACTIVE";
      }

      // Get rental tenants (users with TENANT role)
      const [tenants, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          include: {
            tenancies: {
              include: {
                property: {
                  select: {
                    id: true,
                    title: true,
                    address: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1, // Get latest contract
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.user.count({ where }),
      ]);

      // Transform data to match frontend expectations
      const transformedTenants = tenants.map((tenant) => {
        const latestContract = tenant.tenancies[0];
        const now = new Date();

        // Determine status based on contract
        let tenantStatus = "INACTIVE";
        let paymentStatus = "UP_TO_DATE";

        if (latestContract) {
          const endDate = new Date(latestContract.endDate);
          if (endDate > now) {
            tenantStatus = "ACTIVE";
          } else {
            tenantStatus = "EXPIRED";
          }

          // Mock payment status - in real app this would come from payment records
          const random = Math.random();
          if (random > 0.8) {
            paymentStatus = "LATE";
          } else if (random > 0.9) {
            paymentStatus = "OVERDUE";
          }
        }

        return {
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
          phone: tenant.phone,
          avatar: tenant.avatar,
          status: tenantStatus,
          paymentStatus,
          lastPayment: latestContract ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null, // Mock last payment
          property: latestContract?.property || null,
          contract: latestContract
            ? {
                id: latestContract.id,
                startDate: latestContract.startDate,
                endDate: latestContract.endDate,
                monthlyRent: latestContract.monthlyRent,
                deposit: latestContract.depositAmount,
              }
            : null,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
        };
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: transformedTenants,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      request.log.error(`List rental tenants error: ${error}`);
      return reply.status(500).send({ error: "Kiracılar listelenemedi" });
    }
  },

  async getRentalTenantStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get total tenant count
      const totalTenants = await prisma.user.count({
        where: { role: "TENANT" },
      });

      // Get active contracts count (contracts not expired)
      const now = new Date();
      const activeContracts = await prisma.rentalContract.count({
        where: {
          endDate: { gt: now },
          tenant: { role: "TENANT" },
        },
      });

      // Get expired contracts count
      const expiredContracts = await prisma.rentalContract.count({
        where: {
          endDate: { lte: now },
          tenant: { role: "TENANT" },
        },
      });

      // Get contracts expiring in next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringContracts = await prisma.rentalContract.count({
        where: {
          endDate: {
            gte: now,
            lte: thirtyDaysFromNow,
          },
          tenant: { role: "TENANT" },
        },
      });

      // Get new tenants this month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newThisMonth = await prisma.user.count({
        where: {
          role: "TENANT",
          createdAt: { gte: startOfMonth },
        },
      });

      // Mock some data for late payments (in real app this would come from payment records)
      const latePayments = Math.floor(totalTenants * 0.1); // 10% have late payments
      const inactiveTenants = totalTenants - activeContracts;

      return {
        total: totalTenants,
        active: activeContracts,
        inactive: inactiveTenants,
        expired: expiredContracts,
        latePayments,
        expiringContracts,
        newThisMonth,
        byStatus: {
          ACTIVE: activeContracts,
          INACTIVE: inactiveTenants,
          EXPIRED: expiredContracts,
        },
      };
    } catch (error) {
      request.log.error(`Get rental tenant stats error: ${error}`);
      return reply.status(500).send({ error: "İstatistikler alınamadı" });
    }
  },

  async getRentalTenantById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const tenant = await prisma.user.findFirst({
        where: {
          id,
          role: "TENANT",
        },
        include: {
          tenancies: {
            include: {
              property: {
                select: {
                  id: true,
                  title: true,
                  address: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!tenant) {
        return reply.status(404).send({ error: "Kiracı bulunamadı" });
      }

      // Transform data similar to list endpoint
      const latestContract = tenant.tenancies[0];
      const now = new Date();

      let tenantStatus = "INACTIVE";
      let paymentStatus = "UP_TO_DATE";

      if (latestContract) {
        const endDate = new Date(latestContract.endDate);
        if (endDate > now) {
          tenantStatus = "ACTIVE";
        } else {
          tenantStatus = "EXPIRED";
        }

        // Mock payment status
        const random = Math.random();
        if (random > 0.8) {
          paymentStatus = "LATE";
        } else if (random > 0.9) {
          paymentStatus = "OVERDUE";
        }
      }

      return {
        id: tenant.id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone,
        avatar: tenant.avatar,
        status: tenantStatus,
        paymentStatus,
        lastPayment: latestContract ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        property: latestContract?.property || null,
        contract: latestContract
          ? {
              id: latestContract.id,
              startDate: latestContract.startDate,
              endDate: latestContract.endDate,
              monthlyRent: latestContract.monthlyRent,
              deposit: latestContract.depositAmount,
            }
          : null,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      };
    } catch (error) {
      request.log.error(`Get rental tenant error: ${error}`);
      return reply.status(500).send({ error: "Kiracı bilgileri alınamadı" });
    }
  },

  async createRentalTenant(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { firstName, lastName, email, phone, avatar, propertyId, contractData } = request.body as any;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(400).send({
          error: "Bu email adresi zaten kullanılıyor",
        });
      }

      // Create tenant user
      const tenant = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          avatar,
          role: "TENANT",
          passwordHash: "temp_password", // In real app, generate temporary password or send invitation
          isActive: true,
        },
      });

      // Create contract if property and contract data provided
      if (propertyId && contractData) {
        await prisma.rentalContract.create({
          data: {
            title: `Kira Sözleşmesi - ${firstName} ${lastName}`,
            tenantId: tenant.id,
            propertyId,
            startDate: new Date(contractData.startDate),
            endDate: new Date(contractData.endDate),
            monthlyRent: contractData.monthlyRent,
            depositAmount: contractData.deposit,
            paymentDay: 1, // Default payment day
            status: "ACTIVE",
          },
        });
      }

      return reply.status(201).send({
        id: tenant.id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone,
        avatar: tenant.avatar,
        status: "ACTIVE",
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      });
    } catch (error) {
      request.log.error(`Create rental tenant error: ${error}`);
      return reply.status(500).send({ error: "Kiracı oluşturulamadı" });
    }
  },

  async updateRentalTenant(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { firstName, lastName, email, phone, avatar } = request.body as any;

      const tenant = await prisma.user.findFirst({
        where: {
          id,
          role: "TENANT",
        },
      });

      if (!tenant) {
        return reply.status(404).send({ error: "Kiracı bulunamadı" });
      }

      const updatedTenant = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email,
          phone,
          avatar,
        },
      });

      return {
        id: updatedTenant.id,
        firstName: updatedTenant.firstName,
        lastName: updatedTenant.lastName,
        email: updatedTenant.email,
        phone: updatedTenant.phone,
        avatar: updatedTenant.avatar,
        status: updatedTenant.isActive ? "ACTIVE" : "INACTIVE",
        updatedAt: updatedTenant.updatedAt,
      };
    } catch (error) {
      request.log.error(`Update rental tenant error: ${error}`);
      return reply.status(500).send({ error: "Kiracı güncellenemedi" });
    }
  },

  async deleteRentalTenant(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const tenant = await prisma.user.findFirst({
        where: {
          id,
          role: "TENANT",
        },
      });

      if (!tenant) {
        return reply.status(404).send({ error: "Kiracı bulunamadı" });
      }

      // Soft delete by deactivating
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      return { message: "Kiracı başarıyla silindi" };
    } catch (error) {
      request.log.error(`Delete rental tenant error: ${error}`);
      return reply.status(500).send({ error: "Kiracı silinemedi" });
    }
  },

  async sendNotification(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { message, type = "INFO" } = request.body as any;

      const tenant = await prisma.user.findFirst({
        where: {
          id,
          role: "TENANT",
        },
      });

      if (!tenant) {
        return reply.status(404).send({ error: "Kiracı bulunamadı" });
      }

      // In a real app, you would send email/SMS here
      // For now, just log it
      request.log.info(`Notification sent to tenant ${id}: ${message}`);

      return { message: "Bildirim başarıyla gönderildi" };
    } catch (error) {
      request.log.error(`Send notification error: ${error}`);
      return reply.status(500).send({ error: "Bildirim gönderilemedi" });
    }
  },

  async terminateContract(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { reason, terminationDate } = request.body as any;

      const tenant = await prisma.user.findFirst({
        where: {
          id,
          role: "TENANT",
        },
        include: {
          tenancies: {
            where: {
              status: "ACTIVE",
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      if (!tenant) {
        return reply.status(404).send({ error: "Kiracı bulunamadı" });
      }

      if (!tenant.tenancies.length) {
        return reply.status(400).send({ error: "Aktif sözleşme bulunamadı" });
      }

      const activeContract = tenant.tenancies[0];

      // Update contract status
      await prisma.rentalContract.update({
        where: { id: activeContract.id },
        data: {
          status: "TERMINATED",
          endDate: terminationDate ? new Date(terminationDate) : new Date(),
        },
      });

      return { message: "Sözleşme başarıyla sonlandırıldı" };
    } catch (error) {
      request.log.error(`Terminate contract error: ${error}`);
      return reply.status(500).send({ error: "Sözleşme sonlandırılamadı" });
    }
  },
};
