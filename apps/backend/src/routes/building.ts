import { FastifyInstance } from "fastify";
import { buildingService } from "../services/building.service.js";
import { buildingSchemas } from "../schemas/building.schema.js";

export default async function buildingRoutes(
  fastify: FastifyInstance
): Promise<void> {
  const auth = {
    preHandler: fastify.authenticate,
  };
  const buildingManagerAuth = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(["ADMIN", "MANAGER", "PROPERTY_OWNER"]),
    ],
  };

  const buildingAdminAuth = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(["ADMIN", "MANAGER", "ACCOUNTANT"]),
    ],
  };

  fastify.post(
    "/",
    {
      schema: buildingSchemas.createBuildingSchema,
      ...buildingManagerAuth,
    },
    buildingService.createBuilding
  );

  fastify.get(
    "/",
    {
      schema: buildingSchemas.listBuildingsSchema,
      ...auth,
    },
    buildingService.listBuildings as any
  );

  fastify.get(
    "/:id",
    {
      schema: buildingSchemas.getBuildingSchema,
      ...auth,
    },
    buildingService.getBuildingById as any
  );

  fastify.put(
    "/:id",
    {
      schema: buildingSchemas.updateBuildingSchema,
      ...buildingManagerAuth,
    },
    buildingService.updateBuilding
  );

  fastify.delete(
    "/:id",
    {
      schema: buildingSchemas.deleteBuildingSchema,
      ...buildingManagerAuth,
    },
    buildingService.deleteBuilding
  );

  fastify.post(
    "/:buildingId/expenses",
    {
      schema: buildingSchemas.addBuildingExpenseSchema,
      ...buildingAdminAuth,
    },
    buildingService.addBuildingExpense
  );

  fastify.post(
    "/:buildingId/dues",
    {
      schema: buildingSchemas.createDuesSchema,
      ...buildingAdminAuth,
    },
    buildingService.createDues
  );

  fastify.get(
    "/stats",
    {
      schema: buildingSchemas.buildingStatsSchema,
      ...auth,
    },
    buildingService.getBuildingStats
  );
}
