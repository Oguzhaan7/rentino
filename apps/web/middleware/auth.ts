export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();
  const { canAccessRoute } = useNavigation();

  const authToken = useCookie<string | null>("auth_token");

  if (!authToken.value) {
    return navigateTo("/auth/signin");
  }

  if (!userStore.user) {
    return;
  }

  if (!canAccessRoute(to.path)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Bu sayfaya erişim yetkiniz yok",
    });
  }
});
