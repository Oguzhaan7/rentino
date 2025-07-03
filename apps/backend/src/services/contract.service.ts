import { FastifyReply, FastifyRequest } from "fastify";
import { prisma, Prisma } from "database";
import {
  CreateContractBody,
  UpdateContractBody,
  ListContractsQuery,
  ContractIdParam,
  ContractIdWithQuery,
  TerminateContractBody,
  AddRentPaymentBody,
  RentPaymentParam,
} from "../types/contract.types";
import {
  getTenantId,
  isAdmin,
  createTenantAwareWhere,
  validateResourceAccess,
  requireTenant,
  requireAuth,
} from "../utils/tenant";

type ContractStatus = "ACTIVE" | "TERMINATED" | "EXPIRED" | "RENEWED";

export const contractService = {
  async createContract(
    request: FastifyRequest<{ Body: CreateContractBody }>,
    reply: FastifyReply
  ) {
    try {
      const {
        title,
        propertyId,
        tenantId,
        startDate,
        endDate,
        monthlyRent,
        depositAmount,
        paymentDay,
        paymentMethod,
        renewalType,
        noticePeriod,
        notes,
      } = request.body;

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        return reply.status(404).send({ error: "Belirtilen mülk bulunamadı" });
      }

      const tenant = await prisma.user.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return reply
          .status(404)
          .send({ error: "Belirtilen kiracı bulunamadı" });
      }

      if (property.status !== "AVAILABLE") {
        return reply.status(400).send({
          error: "Mülk şu anda kiralanamaz",
          message: `Mülk durumu '${property.status}' olduğu için kiralanamaz`,
        });
      }

      const tenantOrgId = requireTenant(request);
      const user = requireAuth(request);

      const contract = await prisma.rentalContract.create({
        data: {
          title,
          status: "ACTIVE" as ContractStatus,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate
            ? new Date(endDate)
            : new Date(new Date().setMonth(new Date().getMonth() + 12)),
          monthlyRent,
          depositAmount,
          paymentDay,
          paymentMethod,
          renewalType,
          noticePeriod,
          notes,
          propertyId,
          tenantId,
          tenantOrgId,
        },
      });

      await prisma.property.update({
        where: { id: propertyId },
        data: { status: "RENTED" },
      });

      if (depositAmount > 0) {
        await prisma.deposit.create({
          data: {
            amount: depositAmount,
            receivedDate: new Date(),
            paymentDate: new Date(),
            status: "RECEIVED",
            notes: `${title} sözleşmesi için alınan depozit.`,
            contractId: contract.id,
          },
        });
      }

      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "CONTRACT_CREATE",
            entityType: "RENTAL_CONTRACT",
            entityId: contract.id,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId: tenantOrgId,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return contract;
    } catch (error) {
      request.log.error(`Create contract error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Sözleşme oluşturulurken bir hata oluştu" });
    }
  },

  async listContracts(
    request: FastifyRequest<{ Querystring: ListContractsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = "startDate:desc",
        search,
        status,
        propertyId,
        tenantId,
        startDate,
        endDate,
        isActive,
      } = request.query;

      let where = createTenantAwareWhere(request);

      if (search) {
        where.OR = [{ notes: { contains: search, mode: "insensitive" } }];
      }

      if (status) where.status = status;
      if (propertyId) where.propertyId = propertyId;
      if (tenantId) where.tenantId = tenantId;

      if (startDate) {
        where.startDate = {
          gte: new Date(startDate),
        };
      }

      if (endDate) {
        where.endDate = {
          lte: new Date(endDate),
        };
      }

      if (typeof isActive === "boolean") {
        if (isActive) {
          where.status = "ACTIVE";
        } else {
          where.status = {
            in: ["EXPIRED", "TERMINATED"],
          };
        }
      }

      const [orderField, orderDirection] = orderBy.split(":");
      const orderByObj = {
        [orderField]: orderDirection.toLowerCase(),
      } as Prisma.RentalContractOrderByWithRelationInput;

      const skip = (page - 1) * limit;
      const take = limit;

      const totalCount = await prisma.rentalContract.count({ where });

      const contracts = await prisma.rentalContract.findMany({
        where,
        orderBy: orderByObj,
        skip,
        take,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              type: true,
            },
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
      });

      return {
        data: contracts,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      request.log.error(`List contracts error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Sözleşmeler listelenirken bir hata oluştu" });
    }
  },

  async getContractById(
    request: FastifyRequest<{ Params: ContractIdParam }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const contract = await prisma.rentalContract.findUnique({
        where: { id },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              type: true,
              address: true,
              city: true,
              district: true,
              numberOfRooms: true,
              building: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentDate: true,
              periodStartDate: true,
              periodEndDate: true,
              isPaid: true,
              paymentMethod: true,
            },
            orderBy: {
              periodStartDate: "desc",
            },
          },
          documents: {
            select: {
              id: true,
              title: true,
              fileUrl: true,
              mimeType: true,
              size: true,
              createdAt: true,
            },
          },
        },
      });

      if (!contract) {
        return reply.status(404).send({ error: "Sözleşme bulunamadı" });
      }

      if (!validateResourceAccess(request, contract.tenantOrgId || "")) {
        return reply
          .status(403)
          .send({ error: "Bu sözleşmeye erişim yetkiniz yok" });
      }

      return contract;
    } catch (error) {
      request.log.error(`Get contract error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Sözleşme bilgileri alınırken bir hata oluştu" });
    }
  },

  async updateContract(
    request: FastifyRequest<{
      Params: ContractIdParam;
      Body: UpdateContractBody;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const updateData = request.body;
      const user = requireAuth(request);

      const existingContract = await prisma.rentalContract.findUnique({
        where: { id },
        include: {
          property: true,
        },
      });

      if (!existingContract) {
        return reply.status(404).send({ error: "Sözleşme bulunamadı" });
      }

      if (
        !validateResourceAccess(request, existingContract.tenantOrgId || "")
      ) {
        return reply
          .status(403)
          .send({ error: "Bu sözleşme üzerinde düzenleme yetkiniz yok" });
      }

      if (
        (existingContract.status === "TERMINATED" ||
          existingContract.status === "EXPIRED") &&
        Object.keys(updateData).some((key) => key !== "notes")
      ) {
        return reply.status(400).send({
          error:
            "Sonlandırılmış veya süresi dolmuş sözleşmelerde sadece notlar güncellenebilir",
        });
      }

      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }

      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate);
      }

      const updatedContract = await prisma.rentalContract.update({
        where: { id },
        data: updateData,
      });

      if (updateData.status) {
        let propertyStatus = existingContract.property.status;

        if (updateData.status === "ACTIVE") {
          propertyStatus = "RENTED";
        } else if (
          updateData.status === "TERMINATED" ||
          updateData.status === "EXPIRED"
        ) {
          propertyStatus = "AVAILABLE";
        }

        if (propertyStatus !== existingContract.property.status) {
          await prisma.property.update({
            where: { id: existingContract.propertyId },
            data: { status: propertyStatus },
          });
        }
      }
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "CONTRACT_UPDATE",
            entityType: "RENTAL_CONTRACT",
            entityId: updatedContract.id,
            oldValues: JSON.stringify(existingContract),
            newValues: JSON.stringify(updatedContract),
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId: existingContract.tenantOrgId || undefined,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return updatedContract;
    } catch (error) {
      request.log.error(`Update contract error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Sözleşme güncellenirken bir hata oluştu" });
    }
  },

  async terminateContract(
    request: FastifyRequest<{
      Params: ContractIdParam;
      Body: TerminateContractBody;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const {
        terminationReason,
        terminationDate,
        penaltyAmount,
        returnDepositAmount,
        notes,
      } = request.body;

      const user = requireAuth(request);

      const existingContract = await prisma.rentalContract.findUnique({
        where: { id },
        include: {
          property: true,
        },
      });

      if (!existingContract) {
        return reply.status(404).send({ error: "Sözleşme bulunamadı" });
      }

      if (
        !validateResourceAccess(request, existingContract.tenantOrgId || "")
      ) {
        return reply
          .status(403)
          .send({ error: "Bu sözleşme üzerinde işlem yapma yetkiniz yok" });
      }

      if (existingContract.status === "TERMINATED") {
        return reply
          .status(400)
          .send({ error: "Bu sözleşme zaten sonlandırılmış" });
      }

      if (existingContract.status === "RENEWED") {
        return reply
          .status(400)
          .send({ error: "Yenilenmiş sözleşmeler sonlandırılamaz" });
      }

      const updatedContract = await prisma.rentalContract.update({
        where: { id },
        data: {
          status: "TERMINATED" as ContractStatus,
          terminationDate: new Date(terminationDate),
          terminationReason,
          penaltyAmount,
          returnDepositAmount,
          notes: notes || existingContract.notes,
        },
      });

      await prisma.property.update({
        where: { id: existingContract.propertyId },
        data: { status: "AVAILABLE" },
      });

      if (returnDepositAmount && returnDepositAmount > 0) {
        const deposit = await prisma.deposit.findFirst({
          where: {
            contractId: id,
            status: "RECEIVED",
          },
        });

        if (deposit) {
          await prisma.deposit.update({
            where: { id: deposit.id },
            data: {
              status: "RETURNED",
              returnDate: new Date(),
              returnAmount: returnDepositAmount,
              notes: `${terminationDate} tarihinde sonlandırılan sözleşme için iade edilen depozit.`,
            },
          });
        }
      }
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "CONTRACT_TERMINATE",
            entityType: "RENTAL_CONTRACT",
            entityId: updatedContract.id,
            oldValues: JSON.stringify(existingContract),
            newValues: JSON.stringify(updatedContract),
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId: existingContract.tenantOrgId || undefined,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return updatedContract;
    } catch (error) {
      request.log.error(`Terminate contract error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Sözleşme sonlandırılırken bir hata oluştu" });
    }
  },

  async deleteContract(
    request: FastifyRequest<{
      Params: ContractIdParam;
      Querystring: { permanent?: boolean };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const { permanent = false } = request.query;

      const existingContract = await prisma.rentalContract.findUnique({
        where: { id },
        include: {
          property: true,
          _count: {
            select: {
              payments: true,
              documents: true,
            },
          },
        },
      });

      if (!existingContract) {
        return reply.status(404).send({ error: "Sözleşme bulunamadı" });
      }

      if (
        !validateResourceAccess(request, existingContract.tenantOrgId || "")
      ) {
        return reply
          .status(403)
          .send({ error: "Bu sözleşme üzerinde silme yetkiniz yok" });
      }

      const hasRelatedRecords =
        existingContract._count.payments > 0 ||
        existingContract._count.documents > 0;

      if (permanent) {
        if (hasRelatedRecords) {
          return reply.status(400).send({
            error: "İlişkili kayıtları olan sözleşme kalıcı olarak silinemez",
            message:
              "Önce sözleşmeye ait ödeme ve belgeleri silmeniz gerekmektedir",
          });
        }

        await prisma.$transaction([
          prisma.deposit.deleteMany({ where: { contractId: id } }),
          prisma.rentalContract.delete({ where: { id } }),
        ]);

        if (existingContract.property.status === "RENTED") {
          await prisma.property.update({
            where: { id: existingContract.propertyId },
            data: { status: "AVAILABLE" },
          });
        }

        try {
          await prisma.auditLog.create({
            data: {
              userId: requireAuth(request).id,
              action: "CONTRACT_DELETE",
              entityType: "RENTAL_CONTRACT",
              entityId: id,
              oldValues: JSON.stringify(existingContract),
              ipAddress: request.ip,
              userAgent: request.headers["user-agent"] as string,
              tenantId: existingContract.tenantOrgId || undefined,
            },
          });
        } catch (logError) {
          request.log.error(`Audit log error: ${logError}`);
        }

        return { success: true, message: "Sözleşme başarıyla silindi" };
      } else {
        await prisma.rentalContract.update({
          where: { id },
          data: {
            status: "TERMINATED",
            terminationDate: new Date(),
            terminationReason: "İptal edildi",
          },
        });

        await prisma.property.update({
          where: { id: existingContract.propertyId },
          data: { status: "AVAILABLE" },
        });
        try {
          await prisma.auditLog.create({
            data: {
              userId: requireAuth(request).id,
              action: "CONTRACT_CANCEL",
              entityType: "RENTAL_CONTRACT",
              entityId: id,
              oldValues: JSON.stringify(existingContract),
              newValues: JSON.stringify({
                ...existingContract,
                status: "TERMINATED",
              }),
              ipAddress: request.ip,
              userAgent: request.headers["user-agent"] as string,
              tenantId: existingContract.tenantOrgId || undefined,
            },
          });
        } catch (logError) {
          request.log.error(`Audit log error: ${logError}`);
        }

        return { success: true, message: "Sözleşme iptal edildi" };
      }
    } catch (error) {
      request.log.error(`Delete contract error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Sözleşme silinirken bir hata oluştu" });
    }
  },

  async addRentPayment(
    request: FastifyRequest<{
      Params: RentPaymentParam;
      Body: AddRentPaymentBody;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { contractId } = request.params;
      const {
        amount,
        paymentDate,
        paymentMethod,
        periodStartDate,
        periodEndDate,
        receiptNumber,
        isPaid,
        notes,
      } = request.body;

      const contract = await prisma.rentalContract.findUnique({
        where: { id: contractId },
      });

      if (!contract) {
        return reply
          .status(404)
          .send({ error: "Belirtilen sözleşme bulunamadı" });
      }

      if (!validateResourceAccess(request, contract.tenantOrgId || "")) {
        return reply
          .status(403)
          .send({ error: "Bu sözleşmeye ödeme ekleme yetkiniz yok" });
      }

      const existingPayment = await prisma.rentalPayment.findFirst({
        where: {
          contractId,
          periodStartDate: new Date(periodStartDate),
          periodEndDate: new Date(periodEndDate),
        },
      });

      if (existingPayment) {
        return reply.status(400).send({
          error: "Bu dönem için zaten ödeme kaydı mevcut",
          message:
            "Aynı döneme ait başka bir ödeme eklemek yerine mevcut kaydı güncelleyin",
        });
      }

      const payment = await prisma.rentalPayment.create({
        data: {
          amount,
          paymentDate: new Date(paymentDate),
          paymentMethod: paymentMethod,
          periodStartDate: new Date(periodStartDate),
          periodEndDate: new Date(periodEndDate),
          receiptNumber,
          isPaid,
          notes,
          contract: {
            connect: { id: contractId },
          },
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId: requireAuth(request).id,
            action: "RENT_PAYMENT_CREATE",
            entityType: "RENT_PAYMENT",
            entityId: payment.id,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId: contract.tenantOrgId || undefined,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return payment;
    } catch (error) {
      request.log.error(`Add rent payment error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Kira ödemesi eklenirken bir hata oluştu" });
    }
  },

  async updateRentPayment(
    request: FastifyRequest<{
      Params: { contractId: string; paymentId: string };
      Body: Partial<AddRentPaymentBody>;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { contractId, paymentId } = request.params;
      const updateData = request.body;

      const payment = await prisma.rentalPayment.findUnique({
        where: { id: paymentId },
        include: {
          contract: true,
        },
      });

      if (!payment) {
        return reply.status(404).send({ error: "Ödeme kaydı bulunamadı" });
      }

      if (payment.contractId !== contractId) {
        return reply
          .status(400)
          .send({ error: "Ödeme kaydı belirtilen sözleşmeye ait değil" });
      }

      if (
        !validateResourceAccess(request, payment.contract.tenantOrgId || "")
      ) {
        return reply
          .status(403)
          .send({ error: "Bu ödeme kaydını güncelleme yetkiniz yok" });
      }

      if (updateData.paymentDate) {
        updateData.paymentDate = new Date(updateData.paymentDate);
      }

      if (updateData.periodStartDate) {
        updateData.periodStartDate = new Date(updateData.periodStartDate);
      }

      if (updateData.periodEndDate) {
        updateData.periodEndDate = new Date(updateData.periodEndDate);
      }

      const updatedPayment = await prisma.rentalPayment.update({
        where: { id: paymentId },
        data: updateData,
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId: requireAuth(request).id,
            action: "RENT_PAYMENT_UPDATE",
            entityType: "RENT_PAYMENT",
            entityId: updatedPayment.id,
            oldValues: JSON.stringify(payment),
            newValues: JSON.stringify(updatedPayment),
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId: payment.contract.tenantOrgId || undefined,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return updatedPayment;
    } catch (error) {
      request.log.error(`Update rent payment error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Kira ödemesi güncellenirken bir hata oluştu" });
    }
  },

  async deleteRentPayment(
    request: FastifyRequest<{
      Params: { contractId: string; paymentId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { contractId, paymentId } = request.params;

      const payment = await prisma.rentalPayment.findUnique({
        where: { id: paymentId },
        include: {
          contract: true,
        },
      });

      if (!payment) {
        return reply.status(404).send({ error: "Ödeme kaydı bulunamadı" });
      }

      if (payment.contractId !== contractId) {
        return reply
          .status(400)
          .send({ error: "Ödeme kaydı belirtilen sözleşmeye ait değil" });
      }

      if (
        !validateResourceAccess(request, payment.contract.tenantOrgId || "")
      ) {
        return reply
          .status(403)
          .send({ error: "Bu ödeme kaydını silme yetkiniz yok" });
      }

      await prisma.rentalPayment.delete({
        where: { id: paymentId },
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId: requireAuth(request).id,
            action: "RENT_PAYMENT_DELETE",
            entityType: "RENT_PAYMENT",
            entityId: paymentId,
            oldValues: JSON.stringify(payment),
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] as string,
            tenantId: payment.contract.tenantOrgId || undefined,
          },
        });
      } catch (logError) {
        request.log.error(`Audit log error: ${logError}`);
      }

      return { success: true, message: "Ödeme kaydı başarıyla silindi" };
    } catch (error) {
      request.log.error(`Delete rent payment error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Ödeme kaydı silinirken bir hata oluştu" });
    }
  },
};
