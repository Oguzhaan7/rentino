import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { UserRole } from "@prisma/client";
import { AuthUserPayload, TenantData } from "./index";

declare module "fastify" {
  interface FastifyRequest {
    user: AuthUserPayload;
    tenant?: TenantData;
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    requireRoles: (roles: UserRole[]) => any;
    isAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireTenant: () => any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthUserPayload;
    user: AuthUserPayload;
  }
}
