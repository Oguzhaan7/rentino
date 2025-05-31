import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("prisma", prisma);
  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
