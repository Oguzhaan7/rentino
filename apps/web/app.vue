<template>
  <div>
    <LoadingSpinner
      v-if="shouldShowLoading"
      :full-screen="true"
      text="Kullanıcı bilgileri yükleniyor..."
    />
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();

const shouldShowLoading = computed(() => {
  return (
    userStore.isAuthenticated && !userStore.isInitialized && import.meta.client
  );
});
</script>
