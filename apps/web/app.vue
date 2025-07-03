<template>
  <div>
    <div
      v-if="shouldShowLoading"
      class="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    >
      <div class="flex flex-col items-center space-y-4">
        <Progress :model-value="75" class="w-64" />
        <p class="text-sm text-muted-foreground">Kullanıcı bilgileri yükleniyor...</p>
      </div>
    </div>
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { Progress } from "@/components/ui/progress";

const userStore = useUserStore();

const shouldShowLoading = computed(() => {
  return userStore.isAuthenticated && !userStore.isInitialized && import.meta.client;
});
</script>
