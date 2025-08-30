import { Tenant } from "../types";

declare module "fastify" {
  interface FastifyRequest {
    tenant?: Tenant;
  }
}
