export interface ApiRequestOptions {
  headers?: Record<string, string>;
  includeTenantHeader?: boolean;
}

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = String(config.public.apiBaseUrl);

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

  const prepareHeaders = (options: ApiRequestOptions = {}) => {
    const { includeTenantHeader = true, headers: customHeaders = {} } = options;

    return {
      ...customHeaders,
      ...(includeTenantHeader ? getTenantHeaders() : {}),
    };
  };

  return {
    get: async <T>(
      endpoint: string,
      options: ApiRequestOptions = {}
    ): Promise<T> => {
      const headers = prepareHeaders(options);

      return $fetch<T>(endpoint, {
        baseURL,
        headers,
        method: "GET",
      });
    },
    post: async <T>(
      endpoint: string,
      body?: Record<string, unknown> | string | FormData | null,
      options: ApiRequestOptions = {}
    ): Promise<T> => {
      const headers = prepareHeaders(options);

      return $fetch<T>(endpoint, {
        baseURL,
        headers,
        method: "POST",
        body,
      });
    },

    put: async <T>(
      endpoint: string,
      body?: Record<string, unknown> | string | FormData | null,
      options: ApiRequestOptions = {}
    ): Promise<T> => {
      const headers = prepareHeaders(options);

      return $fetch<T>(endpoint, {
        baseURL,
        headers,
        method: "PUT",
        body,
      });
    },

    delete: async <T>(
      endpoint: string,
      options: ApiRequestOptions = {}
    ): Promise<T> => {
      const headers = prepareHeaders(options);

      return $fetch<T>(endpoint, {
        baseURL,
        headers,
        method: "DELETE",
      });
    },
  };
};
