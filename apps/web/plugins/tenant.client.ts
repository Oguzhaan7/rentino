export default defineNuxtPlugin(() => {
  const tenantStore = useTenantStore();

  if (import.meta.client) {
    tenantStore.loadPersistedTenant();
  }

  return {
    provide: {
      tenant: tenantStore,
    },
  };
});
