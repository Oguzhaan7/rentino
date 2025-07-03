import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";

import authPlugin from "./auth.plugin";
import tenantPlugin from "./tenant.plugin";
import databasePlugin from "./database.plugin";

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(databasePlugin);
  await fastify.register(authPlugin);
  await fastify.register(tenantPlugin);

  fastify.log.info("Tüm plugins başarıyla kaydedildi");
});
