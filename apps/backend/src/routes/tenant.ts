import { FastifyInstance } from "fastify";
import { tenantService } from "../services/tenant.service.js";
import { tenantSchemas } from "../schemas/tenant.schema.js";

export default async function tenantRoutes(
  fastify: FastifyInstance
): Promise<void> {
  const adminAuth = {
    preHandler: [fastify.authenticate, fastify.isAdmin],
  };

  fastify.post(
    "/",
    {
      schema: tenantSchemas.createTenantSchema,
      ...adminAuth,
    },
    tenantService.createTenant
  );

  fastify.get(
    "/",
    {
      schema: tenantSchemas.listTenantsSchema,
      ...adminAuth,
    },
    tenantService.listTenants
  );

  fastify.get(
    "/:id",
    {
      schema: tenantSchemas.getTenantSchema,
      ...adminAuth,
    },
    tenantService.getTenantById
  );

  fastify.put(
    "/:id",
    {
      schema: tenantSchemas.updateTenantSchema,
      ...adminAuth,
    },
    tenantService.updateTenant
  );

  fastify.delete(
    "/:id",
    {
      schema: tenantSchemas.deleteTenantSchema,
      ...adminAuth,
    },
    tenantService.deleteTenant
  );
  fastify.get(
    "/:id/stats",
    {
      schema: tenantSchemas.tenantStatsSchema,
      ...adminAuth,
    },
    tenantService.getTenantStats
  );
}
