<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"
      />
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center py-8">
      <div class="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
        {{ error }}
      </div>
    </div>

    <!-- Building Details -->
    <div v-if="currentBuilding && !loading" class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            class="mb-4"
            @click="navigateTo('/buildings')"
          >
            <ArrowLeft class="mr-2 h-4 w-4" />
            Binalara Dön
          </Button>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ currentBuilding.name }}
          </h1>
          <p class="text-muted-foreground">Bina Detayları</p>
        </div>
        <div class="flex gap-2">
          <Button
            v-if="
              userStore.user?.role === 'ADMIN' ||
              userStore.user?.role === 'MANAGER'
            "
            @click="navigateTo(`/buildings/${currentBuilding.id}/edit`)"
          >
            <Edit class="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <Badge
            :variant="getStatusVariant(currentBuilding.status || 'ACTIVE')"
          >
            {{ getStatusText(currentBuilding.status || "ACTIVE") }}
          </Badge>
        </div>
      </div>

      <!-- Building Information -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Basic Information -->
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Bina Adı</label
              >
              <p class="text-base">{{ currentBuilding.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Adres</label
              >
              <p class="text-base">{{ currentBuilding.address }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground"
                  >Şehir</label
                >
                <p class="text-base">{{ currentBuilding.city }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground"
                  >İlçe</label
                >
                <p class="text-base">{{ currentBuilding.district }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground"
                  >Toplam Daire</label
                >
                <p class="text-base">{{ currentBuilding.totalUnits }}</p>
              </div>
              <div v-if="currentBuilding.constructionYear">
                <label class="text-sm font-medium text-muted-foreground"
                  >Yapım Yılı</label
                >
                <p class="text-base">{{ currentBuilding.constructionYear }}</p>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Durum</label
              >
              <p class="text-base">
                <Badge
                  :variant="
                    getStatusVariant(currentBuilding.status || 'ACTIVE')
                  "
                >
                  {{ getStatusText(currentBuilding.status || "ACTIVE") }}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Manager Information -->
        <Card v-if="currentBuilding.manager">
          <CardHeader>
            <CardTitle>Yönetici Bilgileri</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Ad Soyad</label
              >
              <p class="text-base">
                {{ currentBuilding.manager.firstName }}
                {{ currentBuilding.manager.lastName }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >E-posta</label
              >
              <p class="text-base">{{ currentBuilding.manager.email }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Statistics -->
        <Card v-if="currentBuilding._count">
          <CardHeader>
            <CardTitle>İstatistikler</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold">
                  {{ currentBuilding._count.properties || 0 }}
                </p>
                <p class="text-sm text-muted-foreground">Mülk</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold">
                  {{ currentBuilding._count.dues || 0 }}
                </p>
                <p class="text-sm text-muted-foreground">Aidat</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold">
                  {{ currentBuilding._count.expenses || 0 }}
                </p>
                <p class="text-sm text-muted-foreground">Gider</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Timestamps -->
        <Card>
          <CardHeader>
            <CardTitle>Sistem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Oluşturulma Tarihi</label
              >
              <p class="text-base">
                {{ formatDate(currentBuilding.createdAt) }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Son Güncelleme</label
              >
              <p class="text-base">
                {{ formatDate(currentBuilding.updatedAt) }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Edit } from "lucide-vue-next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const route = useRoute();
const userStore = useUserStore();

const {
  currentBuilding,
  loading,
  error,
  loadBuilding,
  getStatusVariant,
  getStatusText,
} = useBuildings();

// Load building on mount
onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    try {
      await loadBuilding(id);
    } catch (err) {
      console.error("Error loading building:", err);
    }
  }
});

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
