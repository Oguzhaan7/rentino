// composables/useProperties.ts
import type {
  Property,
  PropertyStats,
  CreatePropertyData,
  UpdatePropertyData,
  PropertyFilters,
  PropertyType,
  PropertyStatus,
} from "~/types/property";

export const useProperties = () => {
  const api = useApi();

  // Reactive state
  const properties = ref<Property[]>([]);
  const currentProperty = ref<Property | null>(null);
  const stats = ref<PropertyStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Load all properties
  const loadProperties = async (filters?: PropertyFilters) => {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.city) params.append("city", filters.city);
      if (filters?.district) params.append("district", filters.district);
      if (filters?.minArea)
        params.append("minArea", filters.minArea.toString());
      if (filters?.maxArea)
        params.append("maxArea", filters.maxArea.toString());
      if (filters?.minRooms)
        params.append("minRooms", filters.minRooms.toString());
      if (filters?.maxRooms)
        params.append("maxRooms", filters.maxRooms.toString());
      if (filters?.buildingId) params.append("buildingId", filters.buildingId);

      const queryString = params.toString();
      const url = queryString ? `/properties?${queryString}` : "/properties";

      const response = await api.get<{
        data: Property[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(url);

      console.log("Properties API response:", response);

      // Add derived status field
      const propertiesWithStatus = (response.data || []).map((property) => ({
        ...property,
        status:
          property.status || (property.isActive ? "AVAILABLE" : "UNAVAILABLE"),
      }));

      properties.value = propertiesWithStatus;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Mülkler yüklenirken hata oluştu";
      console.error("Error loading properties:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load property by ID
  const loadProperty = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<Property>(`/properties/${id}`);
      console.log("Property API response:", response);

      // Add derived status field
      const propertyWithStatus = {
        ...response,
        status:
          response.status || (response.isActive ? "AVAILABLE" : "UNAVAILABLE"),
      };

      currentProperty.value = propertyWithStatus;
      return propertyWithStatus;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Mülk yüklenirken hata oluştu";
      console.error("Error loading property:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create property
  const createProperty = async (data: CreatePropertyData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post<Property>("/properties", data);
      console.log("Create property response:", response);

      // Add to properties list
      const propertyWithStatus = {
        ...response,
        status:
          response.status || (response.isActive ? "AVAILABLE" : "UNAVAILABLE"),
      };

      properties.value.unshift(propertyWithStatus);
      return propertyWithStatus;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Mülk oluşturulurken hata oluştu";
      console.error("Error creating property:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update property
  const updateProperty = async (id: string, data: UpdatePropertyData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.put<Property>(`/properties/${id}`, data);
      console.log("Update property response:", response);

      // Add derived status field
      const propertyWithStatus = {
        ...response,
        status:
          response.status || (response.isActive ? "AVAILABLE" : "UNAVAILABLE"),
      };

      // Update in properties list
      const index = properties.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        properties.value[index] = propertyWithStatus;
      }

      // Update current property
      if (currentProperty.value?.id === id) {
        currentProperty.value = propertyWithStatus;
      }

      return propertyWithStatus;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Mülk güncellenirken hata oluştu";
      console.error("Error updating property:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete property
  const deleteProperty = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      await api.delete(`/properties/${id}`);

      // Remove from properties list
      properties.value = properties.value.filter((p) => p.id !== id);

      // Clear current property if it's the deleted one
      if (currentProperty.value?.id === id) {
        currentProperty.value = null;
      }
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Mülk silinirken hata oluştu";
      console.error("Error deleting property:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load property stats
  const loadStats = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<PropertyStats>("/properties/stats");
      console.log("Property stats response:", response);
      stats.value = response;
      return response;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "İstatistikler yüklenirken hata oluştu";
      console.error("Error loading property stats:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Filter properties
  const filterProperties = (
    searchQuery: string,
    statusFilter: string,
    typeFilter: string
  ) => {
    return properties.value.filter((property) => {
      const matchesSearch =
        !searchQuery ||
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || property.status === statusFilter;
      const matchesType = typeFilter === "all" || property.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }; // Helper functions
  const getStatusVariant = (status?: PropertyStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "default";
      case "RENTED":
        return "secondary";
      case "UNDER_MAINTENANCE":
        return "outline";
      case "ON_SALE":
        return "default";
      case "SOLD":
        return "destructive";
      default:
        return "outline";
    }
  };
  const getStatusText = (status?: PropertyStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "Müsait";
      case "RENTED":
        return "Kiralanmış";
      case "UNDER_MAINTENANCE":
        return "Bakımda";
      case "ON_SALE":
        return "Satılık";
      case "SOLD":
        return "Satıldı";
      default:
        return "Bilinmiyor";
    }
  };

  const getTypeText = (type: PropertyType) => {
    switch (type) {
      case "APARTMENT":
        return "Daire";
      case "HOUSE":
        return "Ev";
      case "OFFICE":
        return "Ofis";
      case "SHOP":
        return "Dükkan";
      case "LAND":
        return "Arsa";
      case "WAREHOUSE":
        return "Depo";
      default:
        return type;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    properties: readonly(properties),
    currentProperty: readonly(currentProperty),
    stats: readonly(stats),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    loadProperties,
    loadProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    loadStats,
    filterProperties,

    // Helpers
    getStatusVariant,
    getStatusText,
    getTypeText,
    clearError,
  };
};
