import { ref } from "vue";

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isActive: boolean;
  permissions: string[];
  color: string;
  icon: string;
}

export interface RolePermissions {
  role: string;
  permissions: string[];
  groups: Record<string, string[]>;
}

export interface RoleStats {
  role: string;
  userCount: number;
  activeUsers: number;
  lastLogin: string | null;
  createdThisMonth: number;
}

export const useRoles = () => {
  const { get, put } = useApi();

  const roles = ref<Role[]>([]);
  const selectedRole = ref<Role | null>(null);
  const rolePermissions = ref<RolePermissions | null>(null);
  const roleStats = ref<RoleStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Load all roles with statistics
  const loadRoles = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await get<{ data: Role[] }>("/roles");
      roles.value = response.data;
      return response.data;
    } catch (err) {
      error.value = "Roller yüklenirken hata oluştu";
      console.error("Load roles error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load permissions for a specific role
  const loadRolePermissions = async (roleId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await get<RolePermissions>(
        `/roles/${roleId}/permissions`
      );
      rolePermissions.value = response;
      return response;
    } catch (err) {
      error.value = "Rol izinleri yüklenirken hata oluştu";
      console.error("Load role permissions error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load statistics for a specific role
  const loadRoleStats = async (roleId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await get<RoleStats>(`/roles/${roleId}/stats`);
      roleStats.value = response;
      return response;
    } catch (err) {
      error.value = "Rol istatistikleri yüklenirken hata oluştu";
      console.error("Load role stats error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update role permissions (future feature)
  const updateRolePermissions = async (
    roleId: string,
    permissions: string[]
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await put<{ success: boolean; message: string }>(
        `/roles/${roleId}/permissions`,
        { permissions }
      );

      if (response.success) {
        // Reload permissions after update
        await loadRolePermissions(roleId);
      }

      return response;
    } catch (err) {
      error.value = "Rol izinleri güncellenirken hata oluştu";
      console.error("Update role permissions error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Helper functions
  const getRoleById = (roleId: string) => {
    return roles.value.find((role) => role.id === roleId);
  };

  const getRoleLabel = (roleId: string) => {
    const role = getRoleById(roleId);
    return role?.name || roleId;
  };

  const getRoleColor = (roleId: string) => {
    const role = getRoleById(roleId);
    return role?.color || "gray";
  };

  const getPermissionLabel = (permission: string) => {
    const permissionLabels: Record<string, string> = {
      // User Management
      user_create: "Kullanıcı Oluştur",
      user_read: "Kullanıcı Görüntüle",
      user_update: "Kullanıcı Güncelle",
      user_delete: "Kullanıcı Sil",
      user_role_change: "Rol Değiştir",

      // Property Management
      property_create: "Mülk Oluştur",
      property_read: "Mülk Görüntüle",
      property_update: "Mülk Güncelle",
      property_delete: "Mülk Sil",

      // Building Management
      building_create: "Bina Oluştur",
      building_read: "Bina Görüntüle",
      building_update: "Bina Güncelle",
      building_delete: "Bina Sil",

      // Contract Management
      contract_create: "Sözleşme Oluştur",
      contract_read: "Sözleşme Görüntüle",
      contract_update: "Sözleşme Güncelle",
      contract_delete: "Sözleşme Sil",
      contract_view: "Sözleşme Görüntüleme",

      // Financial
      finance_all: "Tüm Mali İşlemler",
      finance_reports: "Mali Raporlar",
      payment_processing: "Ödeme İşlemleri",
      payment_history: "Ödeme Geçmişi",
      invoice_management: "Fatura Yönetimi",
      invoice_create: "Fatura Oluştur",
      invoice_view: "Fatura Görüntüle",

      // Reports
      report_all: "Tüm Raporlar",
      income_reports: "Gelir Raporları",
      occupancy_reports: "Doluluk Raporları",
      maintenance_reports: "Bakım Raporları",
      financial_reports: "Mali Raporlar",

      // General
      profile_view: "Profil Görüntüleme",
      maintenance_requests: "Bakım Talepleri",
      maintenance_management: "Bakım Yönetimi",
      tenant_communication: "Kiracı İletişimi",

      // System
      user_management: "Kullanıcı Yönetimi",
      tenant_management: "Kiracı Yönetimi",
      property_management: "Mülk Yönetimi",
      building_management: "Bina Yönetimi",
      contract_management: "Sözleşme Yönetimi",
      financial_management: "Mali Yönetim",
      report_access: "Rapor Erişimi",
      system_settings: "Sistem Ayarları",
    };

    return permissionLabels[permission] || permission;
  };

  // Reset state
  const resetState = () => {
    roles.value = [];
    selectedRole.value = null;
    rolePermissions.value = null;
    roleStats.value = null;
    loading.value = false;
    error.value = null;
  };

  return {
    roles,
    selectedRole,
    rolePermissions,
    roleStats,
    loading,
    error,

    loadRoles,
    loadRolePermissions,
    loadRoleStats,
    updateRolePermissions,

    getRoleById,
    getRoleLabel,
    getRoleColor,
    getPermissionLabel,
    resetState,
  };
};
