import { Tenant, TenantResolution } from "../types/index.js";

export const RESERVED_SUBDOMAINS = [
  "www",
  "app",
  "api",
  "local",
  "localhost",
  "admin",
  "portal",
];

export const extractTenantInfo = (request: any): TenantResolution => {
  const host = request.hostname || request.headers?.host;
  const subdomain = host?.split(".")[0];

  return {
    host,
    subdomain:
      subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)
        ? subdomain
        : undefined,
    domain: host,
  };
};

export const buildTenantHeaders = (
  tenant: Tenant | null
): Record<string, string> => {
  return tenant ? { "x-tenant-id": tenant.id } : {};
};

export const isCrossTenantAccess = (
  userTenantId?: string,
  requestTenantId?: string
): boolean => {
  return !!(
    userTenantId &&
    requestTenantId &&
    userTenantId !== requestTenantId
  );
};
