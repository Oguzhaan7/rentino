// composables/useBuildings.ts
import type {
  Building,
  BuildingStats,
  CreateBuildingData,
  UpdateBuildingData,
} from "~/types/building";

export const useBuildings = () => {
  const api = useApi();

  // Reactive state
  const buildings = ref<Building[]>([]);
  const currentBuilding = ref<Building | null>(null);
  const stats = ref<BuildingStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  // Load all buildings
  const loadBuildings = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<{
        data: Building[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>("/buildings");
      console.log("Buildings API response:", response);
      // Add status field derived from isActive
      buildings.value = (response.data || []).map((building) => ({
        ...building,
        status: building.isActive ? "ACTIVE" : "INACTIVE",
      }));
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Binalar yüklenirken hata oluştu";
      console.error("Error loading buildings:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // Load building by ID
  const loadBuilding = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get<Building>(`/buildings/${id}`);
      // Add status field derived from isActive
      currentBuilding.value = {
        ...response,
        status: response.isActive ? "ACTIVE" : "INACTIVE",
      };
      return currentBuilding.value;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Bina yüklenirken hata oluştu";
      console.error("Error loading building:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create new building
  const createBuilding = async (data: CreateBuildingData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post<Building>("/buildings", data);
      buildings.value.push(response);
      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Bina oluşturulurken hata oluştu";
      console.error("Error creating building:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // Update building
  const updateBuilding = async (id: string, data: UpdateBuildingData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.put<Building>(`/buildings/${id}`, data);
      const index = buildings.value.findIndex((b) => b.id === id);
      if (index !== -1) {
        buildings.value[index] = response;
      }
      if (currentBuilding.value?.id === id) {
        currentBuilding.value = response;
      }
      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Bina güncellenirken hata oluştu";
      console.error("Error updating building:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // Delete building
  const deleteBuilding = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      await api.delete(`/buildings/${id}`);
      buildings.value = buildings.value.filter((b) => b.id !== id);
      if (currentBuilding.value?.id === id) {
        currentBuilding.value = null;
      }
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Bina silinirken hata oluştu";
      console.error("Error deleting building:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load building statistics
  const loadStats = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<BuildingStats>("/buildings/stats");
      stats.value = response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "İstatistikler yüklenirken hata oluştu";
      console.error("Error loading building stats:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Filter buildings by search query and status
  const filterBuildings = (searchQuery: string, statusFilter: string) => {
    let filtered = buildings.value;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (building) =>
          building.name.toLowerCase().includes(query) ||
          building.address.toLowerCase().includes(query)
      );
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(
        (building) => building.status === statusFilter
      );
    }

    return filtered;
  };

  // Helper functions for UI
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "MAINTENANCE":
        return "secondary";
      case "INACTIVE":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Aktif";
      case "MAINTENANCE":
        return "Bakımda";
      case "INACTIVE":
        return "Pasif";
      default:
        return status;
    }
  }; // Computed values for better reactivity
  const totalBuildings = computed(() => buildings.value.length);
  const totalUnits = computed(() =>
    buildings.value.reduce((sum, b) => sum + b.totalUnits, 0)
  );
  const totalProperties = computed(() =>
    buildings.value.reduce((sum, b) => sum + (b._count?.properties || 0), 0)
  );
  const occupancyRate = computed(() => {
    // Calculate occupancy based on actual properties vs total units
    const totalProps = totalProperties.value;
    const totalUnitsCount = totalUnits.value;
    return totalUnitsCount > 0 ? (totalProps / totalUnitsCount) * 100 : 0;
  });

  return {
    // State
    buildings: readonly(buildings),
    currentBuilding: readonly(currentBuilding),
    stats: readonly(stats),
    loading: readonly(loading),
    error: readonly(error), // Computed stats
    totalBuildings,
    totalUnits,
    totalProperties,
    occupancyRate,

    // Actions
    loadBuildings,
    loadBuilding,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    loadStats,
    filterBuildings,

    // Helpers
    getStatusVariant,
    getStatusText,
  };
};
