import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { createTenantResolver } from "tenant/middleware";
import { prisma } from "database";

declare module "fastify" {
  interface FastifyRequest {
    tenant?: {
      id: string;
      name: string;
      domain: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const resolveTenant = createTenantResolver({
    prisma,
    enableCrossTenantForAdmin: true,
    strictMode: false,
  });

  fastify.addHook(
    "onRequest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const tenant = await resolveTenant(request, reply);

        if (tenant) {
          request.tenant = tenant;
          request.log.info(`Tenant resolved: ${tenant.name} (${tenant.id})`);
        }
      } catch (error) {
        request.log.error(`Tenant resolving error: ${error}`);
      }
    }
  );

  fastify.decorate("requireTenant", () => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenant) {
        return reply.status(400).send({
          error: "Tenant bulunamadı",
          message: "Bu işlem için geçerli bir tenant belirlenmesi gerekiyor",
        });
      }
    };
  });

  fastify.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (
        request.user &&
        request.tenant &&
        request.user.tenantId &&
        request.user.tenantId !== request.tenant.id
      ) {
        const isAdmin = request.user.role === "ADMIN";

        if (!isAdmin) {
          return reply.status(403).send({
            error: "Tenant erişim hatası",
            message: "Başka bir tenant'ın verilerine erişim yetkiniz yok",
          });
        }

        request.log.warn(
          `Cross-tenant access by ADMIN: User tenant ${request.user.tenantId}, accessed tenant ${request.tenant.id}`
        );
      }
    }
  );
});
