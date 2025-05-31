export interface TenantData {
  id: string;
  name: string;
  domain?: string | null;
  isActive: boolean;
}

export interface CreateTenantBody {
  name: string;
  domain?: string;
  isActive?: boolean;
}

export interface UpdateTenantBody {
  name?: string;
  domain?: string;
  isActive?: boolean;
}
