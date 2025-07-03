import { defineStore } from "pinia";
import { ref, computed } from "vue";

export type UserRole =
  | "ADMIN"
  | "PROPERTY_OWNER"
  | "TENANT"
  | "ACCOUNTANT"
  | "MANAGER";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
  lastLogin?: string;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const isInitialized = ref(false);
  const authToken = useCookie<string | null>("auth_token", {
    default: () => null,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
  });

  const isAuthenticated = computed(() => {
    // If we have a token, we consider the user authenticated
    // even if user data is not loaded yet (during initialization)
    return !!authToken.value;
  });

  const isAdmin = computed(() => user.value?.role === "ADMIN");
  const isPropertyOwner = computed(() => user.value?.role === "PROPERTY_OWNER");
  const isTenant = computed(() => user.value?.role === "TENANT");
  const isAccountant = computed(() => user.value?.role === "ACCOUNTANT");
  const isManager = computed(() => user.value?.role === "MANAGER");

  const canManageProperties = computed(
    () => isAdmin.value || isPropertyOwner.value || isManager.value
  );

  const canManageContracts = computed(
    () => isAdmin.value || isPropertyOwner.value || isManager.value
  );
  const canViewFinancials = computed(
    () => isAdmin.value || isPropertyOwner.value || isAccountant.value
  );

  const canManagePayments = computed(
    () => isAdmin.value || isAccountant.value || isManager.value
  );

  const canViewInvoices = computed(
    () => isAdmin.value || isPropertyOwner.value || isAccountant.value
  );

  const canViewExpenses = computed(
    () => isAdmin.value || isPropertyOwner.value || isAccountant.value
  );

  const canManageUsers = computed(() => isAdmin.value);

  const canViewReports = computed(
    () =>
      isAdmin.value ||
      isPropertyOwner.value ||
      isAccountant.value ||
      isManager.value
  );

  const canManageTenants = computed(() => isAdmin.value);

  const canManageBuildings = computed(
    () => isAdmin.value || isPropertyOwner.value || isManager.value
  );
  const setUser = (userData: User) => {
    user.value = userData;
    isInitialized.value = true;
  };

  const setToken = (token: string) => {
    authToken.value = token;
  };

  const clearAuth = () => {
    user.value = null;
    authToken.value = null;
    isInitialized.value = false;
  };
  const initializeAuth = async () => {
    if (!authToken.value) {
      isInitialized.value = true;
      return;
    }

    try {
      await fetchUser();
    } catch (error: unknown) {
      console.error("Failed to initialize auth:", error);
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as { status: number }).status;
        if (status === 401 || status === 403) {
          clearAuth();
        }
      }
      throw error;
    }
  };
  const fetchUser = async (force = false) => {
    if (!authToken.value) {
      isInitialized.value = true;
      return;
    }

    if (!force && user.value) return;

    isLoading.value = true;
    try {
      const { get } = useApi();
      const userData = await get<User>("/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      });
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      clearAuth();
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  const logout = async () => {
    try {
      if (authToken.value) {
        const { post } = useApi();
        await post("/auth/logout", null, {
          headers: {
            Authorization: `Bearer ${authToken.value}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      await navigateTo("/auth/signin");
    }
  };
  return {
    user,
    authToken,
    isLoading,
    isInitialized,
    isAuthenticated,

    isAdmin,
    isPropertyOwner,
    isTenant,
    isAccountant,
    isManager,

    canManageProperties,
    canManageContracts,
    canViewFinancials,
    canManagePayments,
    canViewInvoices,
    canViewExpenses,
    canManageUsers,
    canViewReports,
    canManageTenants,
    canManageBuildings,

    setUser,
    setToken,
    clearAuth,
    initializeAuth,
    fetchUser,
    logout,
  };
});
