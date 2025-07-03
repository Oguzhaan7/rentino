import { PrismaClient } from "@prisma/client";

const TENANT_MODELS = [
  "user",
  "property",
  "building",
  "rentalContract",
  "document",
  "transaction",
  "maintenanceRequest",
  "notification",
  "auditLog",
  "calendarEvent",
  "legalCase",
  "customField",
  "report",
  "translation",
  "setting",
  "session",
  "conversation",
  "propertyDocument",
  "propertyMaintenance",
] as const;

type TenantModels = (typeof TENANT_MODELS)[number];

export interface TenantPrismaOptions {
  tenantId?: string;
  enableTenantFilter?: boolean;
  strictMode?: boolean;
}

export const createTenantPrisma = (options: TenantPrismaOptions = {}) => {
  const { tenantId, enableTenantFilter = true, strictMode = false } = options;
  const prisma = new PrismaClient();

  if (!tenantId || !enableTenantFilter) return prisma;

  const modelExtensions: any = {};

  TENANT_MODELS.forEach((modelName) => {
    modelExtensions[modelName] = createTenantModelExtension(
      prisma,
      modelName as string,
      tenantId,
      strictMode
    );
  });

  return prisma.$extends({
    model: modelExtensions,
  });
};

function createTenantModelExtension(
  prisma: PrismaClient,
  modelName: string,
  tenantId: string,
  strictMode: boolean
) {
  const baseModel = (prisma as any)[modelName];

  return {
    async findMany(params: any = {}) {
      return baseModel.findMany({
        ...params,
        where: {
          ...params.where,
          tenantId,
        },
      });
    },

    async findFirst(params: any = {}) {
      return baseModel.findFirst({
        ...params,
        where: {
          ...params.where,
          tenantId,
        },
      });
    },

    async findUnique(params: any) {
      return baseModel.findFirst({
        ...params,
        where: {
          ...params.where,
          tenantId,
        },
      });
    },

    async create(params: any) {
      return baseModel.create({
        ...params,
        data: {
          ...params.data,
          tenantId,
        },
      });
    },

    async update(params: any) {
      if (strictMode) {
        const record = await baseModel.findFirst({
          where: {
            ...params.where,
            tenantId,
          },
          select: { id: true },
        });

        if (!record) {
          throw new Error(`${modelName} not found in tenant ${tenantId}`);
        }
      }

      return baseModel.update({
        ...params,
        where: {
          ...params.where,
          tenantId,
        },
      });
    },

    async delete(params: any) {
      if (strictMode) {
        const record = await baseModel.findFirst({
          where: {
            ...params.where,
            tenantId,
          },
          select: { id: true },
        });

        if (!record) {
          throw new Error(`${modelName} not found in tenant ${tenantId}`);
        }
      }

      return baseModel.delete({
        ...params,
        where: {
          ...params.where,
          tenantId,
        },
      });
    },

    async count(params: any = {}) {
      return baseModel.count({
        ...params,
        where: {
          ...params.where,
          tenantId,
        },
      });
    },

    async aggregate(params: any = {}) {
      return baseModel.aggregate({
        ...params,
        where: {
          ...params.where,
          tenantId,
        },
      });
    },
  };
}
