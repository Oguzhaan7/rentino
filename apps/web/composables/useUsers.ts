// composables/useUsers.ts
import type { User, CreateUserData, UpdateUserData } from "../types/user";

interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  newThisMonth: number;
}

export const useUsers = () => {
  const api = useApi();

  // Reactive state
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const managers = ref<User[]>([]);
  const stats = ref<UserStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Load all users with filters
  const loadUsers = async (filters?: UserFilters) => {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const queryString = params.toString();
      const url = queryString ? `/users?${queryString}` : "/users";

      const response = await api.get<{
        data: User[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(url);

      console.log("Users API response:", response);
      users.value = response.data || [];
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kullanıcılar yüklenirken hata oluştu";
      console.error("Error loading users:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load user by ID
  const loadUser = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get<User>(`/users/${id}`);
      console.log("User API response:", response);
      currentUser.value = response;
      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kullanıcı yüklenirken hata oluştu";
      console.error("Error loading user:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load user statistics
  const loadUserStats = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get<UserStats>("/users/stats");
      console.log("User stats API response:", response);
      stats.value = response;
      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kullanıcı istatistikleri yüklenirken hata oluştu";
      console.error("Error loading user stats:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load managers specifically
  const loadManagers = async () => {
    loading.value = true;
    error.value = null;
    try {
      // Get all users and filter managers client-side for now
      const response = await api.get("/users");
      console.log("Raw API response:", response);

      // Handle different response formats
      let usersArray: User[] = [];
      if (Array.isArray(response)) {
        usersArray = response;
      } else if (
        response &&
        typeof response === "object" &&
        "users" in response &&
        Array.isArray(response.users)
      ) {
        usersArray = response.users as User[];
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        Array.isArray(response.data)
      ) {
        usersArray = response.data as User[];
      } else {
        console.error("Unexpected response format:", response);
        throw new Error("Invalid response format from users API");
      }

      const filteredManagers = usersArray.filter(
        (user) =>
          user.role === "MANAGER" ||
          user.role === "ADMIN" ||
          user.role === "PROPERTY_OWNER"
      );
      managers.value = filteredManagers;
      console.log("Filtered managers:", filteredManagers);
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Yöneticiler yüklenirken hata oluştu";
      console.error("Error in loadManagers:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create user
  const createUser = async (userData: CreateUserData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post<User>("/users", userData);
      console.log("Create user response:", response);

      // Add to users list
      users.value.unshift(response);
      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kullanıcı oluşturulurken hata oluştu";
      console.error("Error creating user:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update user
  const updateUser = async (id: string, userData: UpdateUserData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put<User>(`/users/${id}`, userData);
      console.log("Update user response:", response);

      // Update in users list
      const index = users.value.findIndex((user) => user.id === id);
      if (index !== -1) {
        users.value[index] = response;
      }

      // Update current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = response;
      }

      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kullanıcı güncellenirken hata oluştu";
      console.error("Error updating user:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete user
  const deleteUser = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/users/${id}`);
      console.log("User deleted successfully");

      // Remove from users list
      users.value = users.value.filter((user) => user.id !== id);

      // Clear current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = null;
      }

      return true;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Kullanıcı silinirken hata oluştu";
      console.error("Error deleting user:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // Activate/Deactivate user
  const toggleUserStatus = async (id: string, isActive: boolean) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.patch<User>(`/users/${id}/status`, {
        isActive,
      });
      console.log("User status toggled successfully:", response);

      // Update in users list
      const userIndex = users.value.findIndex((user) => user.id === id);
      if (userIndex !== -1) {
        users.value[userIndex] = response;
      }

      // Update current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = response;
      }

      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Kullanıcı durumu değiştirilirken hata oluştu";
      console.error("Error toggling user status:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    users: readonly(users),
    currentUser: readonly(currentUser),
    managers: readonly(managers),
    stats: readonly(stats),
    loading: readonly(loading),
    error: readonly(error),

    // Methods
    loadUsers,
    loadUser,
    loadUserStats,
    loadManagers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  };
};
