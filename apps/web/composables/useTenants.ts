// composables/useTenants.ts
import type {
  Tenant,
  CreateTenantData,
  UpdateTenantData,
} from "../types/tenant";

interface TenantFilters {
  search?: string;
  status?: string;
  property?: string;
  page?: number;
  limit?: number;
}

interface TenantStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  latePayments: number;
  expiringContracts: number;
  newThisMonth: number;
  byStatus: Record<string, number>;
}

export const useTenants = () => {
  const api = useApi();

  // Reactive state
  const tenants = ref<Tenant[]>([]);
  const currentTenant = ref<Tenant | null>(null);
  const stats = ref<TenantStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Load all tenants with filters
  const loadTenants = async (filters?: TenantFilters) => {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.property) params.append("property", filters.property);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const queryString = params.toString();
      const url = queryString ? `/tenants?${queryString}` : "/tenants";

      const response = await api.get<{
        data: Tenant[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(url);

      console.log("Tenants API response:", response);
      tenants.value = response.data || [];
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kiracılar yüklenirken hata oluştu";
      console.error("Error loading tenants:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load tenant by ID
  const loadTenant = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get<Tenant>(`/tenants/${id}`);
      console.log("Tenant API response:", response);
      currentTenant.value = response;
      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Kiracı yüklenirken hata oluştu";
      console.error("Error loading tenant:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load tenant statistics
  const loadTenantStats = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get<TenantStats>("/tenants/stats");
      console.log("Tenant stats API response:", response);
      stats.value = response;
      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kiracı istatistikleri yüklenirken hata oluştu";
      console.error("Error loading tenant stats:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create new tenant
  const createTenant = async (tenantData: CreateTenantData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post<Tenant>("/tenants", tenantData);
      console.log("Tenant created successfully:", response);

      // Add to tenants list
      tenants.value.unshift(response);

      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kiracı oluşturulurken hata oluştu";
      console.error("Error creating tenant:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update tenant
  const updateTenant = async (id: string, tenantData: UpdateTenantData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put<Tenant>(`/tenants/${id}`, tenantData);
      console.log("Tenant updated successfully:", response);

      // Update in tenants list
      const tenantIndex = tenants.value.findIndex((tenant) => tenant.id === id);
      if (tenantIndex !== -1) {
        tenants.value[tenantIndex] = response;
      }

      // Update current tenant if it's the same
      if (currentTenant.value?.id === id) {
        currentTenant.value = response;
      }

      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kiracı güncellenirken hata oluştu";
      console.error("Error updating tenant:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete tenant
  const deleteTenant = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/tenants/${id}`);
      console.log("Tenant deleted successfully");

      // Remove from tenants list
      tenants.value = tenants.value.filter((tenant) => tenant.id !== id);

      // Clear current tenant if it's the same
      if (currentTenant.value?.id === id) {
        currentTenant.value = null;
      }
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Kiracı silinirken hata oluştu";
      console.error("Error deleting tenant:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update tenant status
  const updateTenantStatus = async (id: string, status: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.patch<Tenant>(`/tenants/${id}/status`, {
        status,
      });
      console.log("Tenant status updated successfully:", response);

      // Update in tenants list
      const tenantIndex = tenants.value.findIndex((tenant) => tenant.id === id);
      if (tenantIndex !== -1) {
        tenants.value[tenantIndex] = response;
      }

      // Update current tenant if it's the same
      if (currentTenant.value?.id === id) {
        currentTenant.value = response;
      }

      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kiracı durumu değiştirilirken hata oluştu";
      console.error("Error updating tenant status:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Terminate contract
  const terminateContract = async (id: string, terminationDate?: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.patch<Tenant>(`/tenants/${id}/terminate`, {
        terminationDate: terminationDate || new Date().toISOString(),
      });
      console.log("Contract terminated successfully:", response);

      // Update in tenants list
      const tenantIndex = tenants.value.findIndex((tenant) => tenant.id === id);
      if (tenantIndex !== -1) {
        tenants.value[tenantIndex] = response;
      }

      // Update current tenant if it's the same
      if (currentTenant.value?.id === id) {
        currentTenant.value = response;
      }

      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Sözleşme sonlandırılırken hata oluştu";
      console.error("Error terminating contract:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Send notification to tenant
  const sendNotification = async (
    id: string,
    message: string,
    type: string = "INFO"
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post(`/tenants/${id}/notifications`, {
        message,
        type,
      });
      console.log("Notification sent successfully:", response);
      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Bildirim gönderilirken hata oluştu";
      console.error("Error sending notification:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    tenants: readonly(tenants),
    currentTenant: readonly(currentTenant),
    stats: readonly(stats),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    loadTenants,
    loadTenant,
    loadTenantStats,
    createTenant,
    updateTenant,
    deleteTenant,
    updateTenantStatus,
    terminateContract,
    sendNotification,
  };
};
