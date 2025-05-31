import { FastifyInstance } from "fastify";
import authRoutes from "./auth";
import tenantRoutes from "./tenant";
import propertyRoutes from "./property";
import buildingRoutes from "./building";
import contractRoutes from "./contract";

export default async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(tenantRoutes, { prefix: "/api/tenants" });
  await fastify.register(propertyRoutes, { prefix: "/api/properties" });
  await fastify.register(buildingRoutes, { prefix: "/api/buildings" });
  await fastify.register(contractRoutes, { prefix: "/api/contracts" });

  fastify.log.info("Tüm rotalar başarıyla kaydedildi");
}
