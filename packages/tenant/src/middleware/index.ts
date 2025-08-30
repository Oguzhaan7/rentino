import { FastifyRequest, FastifyReply } from "fastify";
import { extractTenantInfo } from "../utils";
import { Tenant, TenantResolution, AuthUserPayload } from "../types";
import { validateTenantAccess } from "../validators";

type FastifyRequestWithUser = FastifyRequest & {
  user?: AuthUserPayload;
};

export interface TenantMiddlewareOptions {
  prisma: any;
  enableCrossTenantForAdmin?: boolean;
  strictMode?: boolean;
}

export function createTenantResolver(options: TenantMiddlewareOptions) {
  const {
    prisma,
    enableCrossTenantForAdmin = true,
    strictMode = false,
  } = options;

  return async function resolveTenant(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<Tenant | null> {
    const req = request as unknown as FastifyRequestWithUser;
    try {
      const tenantId = request.headers["x-tenant-id"] as string;
      const jwtTenantId = req.user?.tenantId;
      const tenantInfo = extractTenantInfo(request);

      let tenant = null;

      if (tenantId) {
        tenant = await findTenantById(prisma, tenantId);
      } else if (jwtTenantId) {
        tenant = await findTenantById(prisma, jwtTenantId);
      } else if (tenantInfo.subdomain || tenantInfo.domain) {
        tenant = await findTenantByDomain(
          prisma,
          tenantInfo.domain,
          tenantInfo.subdomain
        );
      }

      if (tenant && req.user) {
        const hasAccess = validateTenantAccess(
          req.user.role,
          req.user.tenantId || undefined,
          tenant.id
        );

        if (!hasAccess && strictMode) {
          throw new Error("Cross-tenant access denied");
        }
      }

      return tenant;
    } catch (error) {
      request.log?.error(`Tenant resolving error:`, error);
      return null;
    }
  };
}

async function findTenantById(
  prisma: any,
  tenantId: string
): Promise<Tenant | null> {
  return await prisma.tenant.findUnique({
    where: { id: tenantId, isActive: true },
    select: {
      id: true,
      name: true,
      domain: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function findTenantByDomain(
  prisma: any,
  domain?: string,
  subdomain?: string
): Promise<Tenant | null> {
  if (!domain && !subdomain) return null;

  return await prisma.tenant.findFirst({
    where: {
      OR: [
        domain ? { domain } : {},
        subdomain ? { domain: subdomain } : {},
      ].filter(Boolean),
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      domain: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export { createTenantResolver as resolveTenant };
