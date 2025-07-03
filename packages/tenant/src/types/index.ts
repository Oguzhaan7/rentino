export interface Tenant {
  id: string;
  name: string;
  domain: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
}

export interface TenantContext {
  tenant: Tenant | null;
  user?: AuthUserPayload;
}

export interface TenantResolution {
  tenantId?: string;
  domain?: string;
  subdomain?: string;
  host?: string;
}

export interface TenantStats {
  tenantId: string;
  tenantName: string;
  stats: {
    userCount: number;
    propertyCount: number;
    buildingCount: number;
    contractCount: number;
    activeContractCount: number;
    transactionCount: number;
  };
}
