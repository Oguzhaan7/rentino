import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "@prisma/client";
import { prisma } from "database";

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
}

function extractEntityId(path: string): string | null {
  const matches = path.match(/\/api\/\w+\/([^\/]+)/);
  return matches ? matches[1] : null;
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: "Kimlik doğrulama başarısız" });
    }
  });

  fastify.decorate("requireRoles", (roles: UserRole[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();

        const user = request.user;

        if (!roles.includes(user.role as UserRole)) {
          return reply
            .status(403)
            .send({ error: "Bu işlemi yapmaya yetkiniz yok" });
        }
      } catch (err) {
        reply.status(401).send({ error: "Kimlik doğrulama başarısız" });
      }
    };
  });

  fastify.decorate("isAdmin", async (request, reply) => {
    try {
      await request.jwtVerify();

      if (request.user.role !== "ADMIN") {
        return reply
          .status(403)
          .send({ error: "Bu işlemi sadece yöneticiler yapabilir" });
      }
    } catch (err) {
      reply.status(401).send({ error: "Kimlik doğrulama başarısız" });
    }
  });

  fastify.addHook("onRequest", async (request) => {
    const isApiRequest = request.routeOptions?.url?.startsWith("/api/");

    if (isApiRequest && request.user && request.user.id) {
      const path = request.routeOptions?.url || "";
      const method = request.method;

      const isSignificantRequest =
        method !== "GET" || path.includes("/auth/") || path.endsWith("/me");

      try {
        if (path === "/api/auth/signin" && request.user) {
          await prisma.user.update({
            where: { id: request.user.id },
            data: { lastLogin: new Date() },
          });
        }

        if (isSignificantRequest) {
          await prisma.auditLog.create({
            data: {
              userId: request.user.id,
              action: method === "GET" ? "VIEW" : "UPDATE",
              entityType: path.split("/")[2] || "API",
              entityId: extractEntityId(path) || request.url,
              ipAddress: request.ip,
              userAgent: request.headers["user-agent"] as string,
              tenantId: request.user.tenantId,
            },
          });
        }
      } catch (error) {
        request.log.error(`Log/update hatası: ${error}`);
      }
    }
  });
});
