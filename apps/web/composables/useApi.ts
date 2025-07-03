export interface ApiRequestOptions {
  headers?: Record<string, string>;
  includeTenantHeader?: boolean;
  includeAuth?: boolean;
}

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = String(config.public.apiBaseUrl);

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {};

    if (import.meta.client) {
      try {
        // Get auth token from cookie
        const authToken = useCookie("auth_token");
        if (authToken.value) {
          headers["Authorization"] = `Bearer ${authToken.value}`;
        }
      } catch (error) {
        console.warn("Could not access auth token:", error);
      }
    }

    return headers;
  };

  const getTenantHeaders = () => {
    const headers: Record<string, string> = {};

    if (import.meta.client) {
      try {
        const tenantStore = useTenantStore();
        if (tenantStore.currentTenant?.id) {
          headers["X-Tenant-ID"] = tenantStore.currentTenant.id;
        }
        if (tenantStore.user?.id) {
          headers["X-User-ID"] = tenantStore.user.id;
        }
      } catch (error) {
        console.warn("Could not access tenant store:", error);
      }
    }

    return headers;
  };

  const handleUnauthorized = () => {
    if (import.meta.client) {
      // Clear auth token cookie
      const authToken = useCookie("auth_token");
      authToken.value = null;

      // Clear user store if exists
      try {
        const userStore = useUserStore();
        userStore.logout();
      } catch (error) {
        console.warn("Could not access user store:", error);
      }

      // Redirect to login page
      navigateTo("/auth/login");
    }
  };

  const prepareHeaders = (options: ApiRequestOptions = {}) => {
    const {
      includeTenantHeader = true,
      includeAuth = true,
      headers: customHeaders = {},
    } = options;

    return {
      ...customHeaders,
      ...(includeAuth ? getAuthHeaders() : {}),
      ...(includeTenantHeader ? getTenantHeaders() : {}),
    };
  };
  const handleApiError = (error: unknown) => {
    // Check if it's a 401 Unauthorized error
    if (
      (error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 401) ||
      (error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 401)
    ) {
      handleUnauthorized();
    }
    throw error;
  };
  return {
    get: async <T>(
      endpoint: string,
      options: ApiRequestOptions = {}
    ): Promise<T> => {
      try {
        const headers = prepareHeaders(options);

        return await $fetch<T>(endpoint, {
          baseURL,
          headers,
          method: "GET",
        });
      } catch (error) {
        handleApiError(error);
        throw error; // This won't be reached but TypeScript needs it
      }
    },

    post: async <T>(
      endpoint: string,
      body?: Record<string, unknown> | string | FormData | null,
      options: ApiRequestOptions = {}
    ): Promise<T> => {
      try {
        const headers = prepareHeaders(options);

        return await $fetch<T>(endpoint, {
          baseURL,
          headers,
          method: "POST",
          body,
        });
      } catch (error) {
        handleApiError(error);
        throw error; // This won't be reached but TypeScript needs it
      }
    },

    put: async <T>(
      endpoint: string,
      body?: Record<string, unknown> | string | FormData | null,
      options: ApiRequestOptions = {}
    ): Promise<T> => {
      try {
        const headers = prepareHeaders(options);

        return await $fetch<T>(endpoint, {
          baseURL,
          headers,
          method: "PUT",
          body,
        });
      } catch (error) {
        handleApiError(error);
        throw error; // This won't be reached but TypeScript needs it
      }
    },

    delete: async <T>(
      endpoint: string,
      options: ApiRequestOptions = {}
    ): Promise<T> => {
      try {
        const headers = prepareHeaders(options);

        return await $fetch<T>(endpoint, {
          baseURL,
          headers,
          method: "DELETE",
        });
      } catch (error) {
        handleApiError(error);
        throw error; // This won't be reached but TypeScript needs it
      }
    },
  };
};
