import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";

import authPlugin from "./auth.plugin.js";
import tenantPlugin from "./tenant.plugin.js";
import databasePlugin from "./database.plugin.js";

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(databasePlugin);
  await fastify.register(authPlugin);
  await fastify.register(tenantPlugin);

  fastify.log.info("Tüm plugins başarıyla kaydedildi");
});
