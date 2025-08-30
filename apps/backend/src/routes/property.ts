import { FastifyInstance } from "fastify";
import { propertyService } from "../services/property.service.js";
import { propertySchemas } from "../schemas/property.schema.js";

export default async function propertyRoutes(
  fastify: FastifyInstance
): Promise<void> {
  const auth = {
    preHandler: fastify.authenticate,
  };

  const propertyManagerAuth = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(["ADMIN", "PROPERTY_OWNER", "MANAGER"]),
    ],
  };

  fastify.post(
    "/",
    {
      schema: propertySchemas.createPropertySchema,
      ...propertyManagerAuth,
    },
    propertyService.createProperty
  );

  fastify.get(
    "/",
    {
      schema: propertySchemas.listPropertiesSchema,
      ...auth,
    },
    propertyService.listProperties
  );

  fastify.get(
    "/:id",
    {
      schema: propertySchemas.getPropertySchema,
      ...auth,
    },
    propertyService.getPropertyById
  );

  fastify.put(
    "/:id",
    {
      schema: propertySchemas.updatePropertySchema,
      ...propertyManagerAuth,
    },
    propertyService.updateProperty
  );

  fastify.delete(
    "/:id",
    {
      schema: propertySchemas.deletePropertySchema,
      ...propertyManagerAuth,
    },
    propertyService.deleteProperty
  );

  fastify.post(
    "/:propertyId/documents",
    {
      schema: propertySchemas.addPropertyDocumentSchema,
      ...propertyManagerAuth,
    },
    propertyService.addPropertyDocument
  );

  fastify.post(
    "/:propertyId/maintenance",
    {
      schema: propertySchemas.addPropertyMaintenanceSchema,
      ...propertyManagerAuth,
    },
    propertyService.addPropertyMaintenance
  );

  fastify.get(
    "/stats",
    {
      schema: propertySchemas.propertyStatsSchema,
      ...auth,
    },
    propertyService.getPropertyStats
  );
}
