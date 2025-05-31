import { defineStore } from "pinia";
import { useApi } from "~/composables/useApi";

export interface Tenant {
  id: string;
  name: string;
  domain: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantUser {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
}

export const useTenantStore = defineStore("tenant", () => {
  const currentTenant = ref<Tenant | null>(null);
  const user = ref<TenantUser | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);
  const isTenantOwner = computed(() => user.value?.role === "OWNER");
  const isTenantAdmin = computed(
    () => user.value?.role === "ADMIN" || user.value?.role === "OWNER"
  );
  const canAccessTenant = computed(() => {
    if (!user.value || !currentTenant.value) return false;
    if (user.value.role === "ADMIN") return true;
    return user.value.tenantId === currentTenant.value.id;
  });

  const setTenant = (tenant: Tenant | null) => {
    currentTenant.value = tenant;
    error.value = null;
  };

  const setUser = (userData: TenantUser | null) => {
    user.value = userData;
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage;
  };
  const resolveTenant = async (
    domain?: string,
    subdomain?: string
  ): Promise<Tenant | null> => {
    if (!domain && !subdomain) return null;

    setLoading(true);
    setError(null);
    try {
      const api = useApi();
      const { data } = await api.post<{ data: Tenant }>(
        "/api/tenant/resolve",
        { domain, subdomain },
        { includeTenantHeader: false }
      );

      setTenant(data);
      return data;
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } }).data?.message ||
        "Failed to resolve tenant";
      setError(errorMessage);
      console.error("Tenant resolution error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  const switchTenant = async (tenantId: string): Promise<boolean> => {
    if (!canAccessTenant.value) {
      setError("Access denied to switch tenant");
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const api = useApi();
      const { data } = await api.get<{ data: Tenant }>(
        `/api/tenant/${tenantId}`
      );
      setTenant(data);

      return true;
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } }).data?.message ||
        "Failed to switch tenant";
      setError(errorMessage);
      console.error("Tenant switch error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };
  const persistTenant = () => {
    if (import.meta.client && currentTenant.value) {
      localStorage.setItem(
        "rentino_tenant",
        JSON.stringify(currentTenant.value)
      );
    }
  };

  const loadPersistedTenant = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem("rentino_tenant");
      if (saved) {
        try {
          const tenant = JSON.parse(saved);
          setTenant(tenant);
        } catch (err) {
          console.error("Failed to load persisted tenant:", err);
          localStorage.removeItem("rentino_tenant");
        }
      }
    }
  };

  watch(
    currentTenant,
    (newTenant) => {
      if (newTenant) {
        persistTenant();
      } else if (import.meta.client) {
        localStorage.removeItem("rentino_tenant");
      }
    },
    { deep: true }
  );

  return {
    currentTenant: readonly(currentTenant),
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),

    isAuthenticated,
    isTenantOwner,
    isTenantAdmin,
    canAccessTenant,

    setTenant,
    setUser,
    setLoading,
    setError,
    resolveTenant,
    switchTenant,
    logout,
    clearError,
    loadPersistedTenant,
  };
});
