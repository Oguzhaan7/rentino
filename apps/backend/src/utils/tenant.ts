import { FastifyRequest } from "fastify";
import { validateTenantAccess } from "tenant/validators";

export function getTenantId(request: FastifyRequest): string | undefined {
  return request.tenant?.id || request.user?.tenantId || undefined;
}

export function isAdmin(request: FastifyRequest): boolean {
  return request.user?.role === "ADMIN";
}

export function isManager(request: FastifyRequest): boolean {
  return request.user?.role === "MANAGER";
}

export function hasRole(request: FastifyRequest, roles: string[]): boolean {
  return roles.includes(request.user?.role || "");
}

export function validateResourceAccess(
  request: FastifyRequest,
  resourceTenantId: string
): boolean {
  const userRole = request.user?.role;
  const userTenantId = request.user?.tenantId || undefined;

  return validateTenantAccess(userRole, userTenantId, resourceTenantId);
}

export function createTenantAwareWhere(
  request: FastifyRequest,
  additionalWhere: any = {}
): any {
  const tenantId = getTenantId(request);
  const admin = isAdmin(request);

  return {
    ...additionalWhere,
    ...(tenantId && !admin ? { tenantId } : {}),
  };
}

export function requireTenant(request: FastifyRequest): string | null {
  const tenantId = getTenantId(request);
  const admin = isAdmin(request);

  if (admin) {
    return tenantId || null;
  }

  if (!tenantId) {
    throw new Error("Tenant ID gerekli");
  }
  return tenantId;
}

export function requireAuth(request: FastifyRequest): any {
  if (!request.user) {
    throw new Error("Kimlik doğrulama gerekli");
  }
  return request.user;
}
