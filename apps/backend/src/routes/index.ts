import { FastifyInstance } from "fastify";
import authRoutes from "./auth.js";
import tenantRoutes from "./tenant.js";
import rentalTenantRoutes from "./rental-tenant.js";
import propertyRoutes from "./property.js";
import buildingRoutes from "./building.js";
import contractRoutes from "./contract.js";
import userRoutes from "./user.js";
import roleRoutes from "./role.js";
import settingsRoutes from "./settings.js";

export default async function registerRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  await fastify.get("/health", async (request, reply) => {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: "Connected", // Basit health check
    };
  });

  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(rentalTenantRoutes, { prefix: "/api/tenants" }); // Rental tenants (property renters)
  await fastify.register(tenantRoutes, { prefix: "/api/org-tenants" }); // Organizational tenants
  await fastify.register(propertyRoutes, { prefix: "/api/properties" });
  await fastify.register(buildingRoutes, { prefix: "/api/buildings" });
  await fastify.register(contractRoutes, { prefix: "/api/contracts" });
  await fastify.register(userRoutes, { prefix: "/api/users" });
  await fastify.register(roleRoutes, { prefix: "/api/roles" });
  await fastify.register(settingsRoutes, { prefix: "/api/settings" });

  fastify.log.info("Tüm rotalar başarıyla kaydedildi");
}
