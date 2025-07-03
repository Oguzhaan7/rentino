export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore();
  const tenantStore = useTenantStore();

  const isAuthRoute = to.path.startsWith("/auth");
  const authToken = useCookie<string | null>("auth_token");
  const hasValidToken = !!authToken.value;
  if (import.meta.client && hasValidToken && !userStore.user) {
    try {
      await userStore.initializeAuth();
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as { status: number }).status;
        if (status === 401 || status === 403) {
          userStore.clearAuth();
          if (!isAuthRoute) {
            return navigateTo("/auth/signin");
          }
        }
      }
    }
  }
  if (!hasValidToken && !isAuthRoute) {
    return navigateTo("/auth/signin");
  }
  if (hasValidToken && userStore.user && isAuthRoute) {
    return navigateTo("/");
  }
  if (hasValidToken && userStore.user?.tenantId) {
    const tenant = {
      id: userStore.user.tenantId,
      name: "",
      domain: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    tenantStore.setTenant(tenant);
  }
});
