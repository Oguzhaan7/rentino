import { FastifyInstance } from "fastify";
import { rentalTenantService } from "../services/rental-tenant.service.js";
import { rentalTenantSchemas } from "../schemas/rental-tenant.schema.js";

export default async function rentalTenantRoutes(
  fastify: FastifyInstance
): Promise<void> {
  const adminAuth = {
    preHandler: [fastify.authenticate, fastify.isAdmin],
  };

  // List rental tenants
  fastify.get(
    "/",
    {
      schema: rentalTenantSchemas.listRentalTenantsSchema,
      ...adminAuth,
    },
    rentalTenantService.listRentalTenants
  );

  // Get rental tenant statistics
  fastify.get(
    "/stats",
    {
      schema: rentalTenantSchemas.rentalTenantStatsSchema,
      ...adminAuth,
    },
    rentalTenantService.getRentalTenantStats
  );

  // Get rental tenant by ID
  fastify.get(
    "/:id",
    {
      schema: rentalTenantSchemas.getRentalTenantSchema,
      ...adminAuth,
    },
    rentalTenantService.getRentalTenantById
  );

  // Create rental tenant
  fastify.post(
    "/",
    {
      schema: rentalTenantSchemas.createRentalTenantSchema,
      ...adminAuth,
    },
    rentalTenantService.createRentalTenant
  );

  // Update rental tenant
  fastify.put(
    "/:id",
    {
      schema: rentalTenantSchemas.updateRentalTenantSchema,
      ...adminAuth,
    },
    rentalTenantService.updateRentalTenant
  );

  // Delete rental tenant
  fastify.delete(
    "/:id",
    {
      schema: rentalTenantSchemas.deleteRentalTenantSchema,
      ...adminAuth,
    },
    rentalTenantService.deleteRentalTenant
  );

  // Send notification to rental tenant
  fastify.post(
    "/:id/notification",
    {
      schema: rentalTenantSchemas.sendNotificationSchema,
      ...adminAuth,
    },
    rentalTenantService.sendNotification
  );

  // Terminate contract
  fastify.post(
    "/:id/terminate-contract",
    {
      schema: rentalTenantSchemas.terminateContractSchema,
      ...adminAuth,
    },
    rentalTenantService.terminateContract
  );
}
