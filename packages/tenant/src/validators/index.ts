import { RESERVED_SUBDOMAINS } from "../utils";

export const validateTenantAccess = (
  userRole: string,
  userTenantId?: string,
  requestTenantId?: string
): boolean => {
  if (userRole === "ADMIN") return true;

  return userTenantId === requestTenantId;
};

export const validateSubdomain = (subdomain: string): boolean => {
  if (!subdomain || subdomain.length < 2) return false;
  if (RESERVED_SUBDOMAINS.includes(subdomain)) return false;

  return /^[a-z0-9-]+$/.test(subdomain);
};
