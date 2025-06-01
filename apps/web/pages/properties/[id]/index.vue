<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center p-8">
      <div
        class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"
      />
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-destructive/15 text-destructive px-4 py-2 rounded-md"
    >
      {{ error }}
    </div>

    <!-- Property not found -->
    <div v-else-if="!property" class="text-center p-8">
      <h2 class="text-2xl font-bold">Mülk bulunamadı</h2>
      <p class="text-muted-foreground mt-2">
        Bu mülk mevcut değil veya erişim yetkiniz bulunmamaktadır.
      </p>
      <Button class="mt-4" @click="navigateTo('/properties')">
        Mülk Listesine Dön
      </Button>
    </div>

    <!-- Property details -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            @click="navigateTo('/properties')"
          >
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <div>
            <h1 class="text-3xl font-bold tracking-tight">
              {{ property.title }}
            </h1>
            <p class="text-muted-foreground">
              {{ getTypeText(property.type) }}
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <Badge :variant="getStatusVariant(property.status)">
            {{ getStatusText(property.status) }}
          </Badge>
          <Button
            v-if="userStore.canManageProperties"
            @click="navigateTo(`/properties/${property.id}/edit`)"
          >
            <Edit class="mr-2 h-4 w-4" />
            Düzenle
          </Button>
        </div>
      </div>

      <!-- Property Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Basic Information -->
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Home class="h-5 w-5" />
              Temel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="text-sm font-medium text-muted-foreground"
                  >Başlık</Label
                >
                <p class="text-sm">{{ property.title }}</p>
              </div>

              <div class="space-y-2">
                <Label class="text-sm font-medium text-muted-foreground"
                  >Tür</Label
                >
                <p class="text-sm">{{ getTypeText(property.type) }}</p>
              </div>

              <div class="space-y-2">
                <Label class="text-sm font-medium text-muted-foreground"
                  >Durum</Label
                >
                <Badge :variant="getStatusVariant(property.status)">
                  {{ getStatusText(property.status) }}
                </Badge>
              </div>

              <div class="space-y-2">
                <Label class="text-sm font-medium text-muted-foreground"
                  >Toplam Alan</Label
                >
                <p class="text-sm">{{ property.totalArea }} m²</p>
              </div>

              <div v-if="property.numberOfRooms" class="space-y-2">
                <Label class="text-sm font-medium text-muted-foreground"
                  >Oda Sayısı</Label
                >
                <p class="text-sm">{{ property.numberOfRooms }}</p>
              </div>

              <div v-if="property.floor" class="space-y-2">
                <Label class="text-sm font-medium text-muted-foreground"
                  >Kat</Label
                >
                <p class="text-sm">{{ property.floor }}</p>
              </div>
            </div>

            <div v-if="property.description" class="space-y-2">
              <Label class="text-sm font-medium text-muted-foreground"
                >Açıklama</Label
              >
              <p class="text-sm leading-relaxed">{{ property.description }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Location Information -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <MapPin class="h-5 w-5" />
              Konum Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium text-muted-foreground"
                >Adres</Label
              >
              <p class="text-sm">{{ property.address }}</p>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium text-muted-foreground"
                >Şehir</Label
              >
              <p class="text-sm">{{ property.city }}</p>
            </div>

            <div v-if="property.district" class="space-y-2">
              <Label class="text-sm font-medium text-muted-foreground"
                >İlçe</Label
              >
              <p class="text-sm">{{ property.district }}</p>
            </div>

            <div v-if="property.building" class="space-y-2">
              <Label class="text-sm font-medium text-muted-foreground"
                >Bina</Label
              >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium">
                    {{ property.building.name }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ property.building.address }}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  @click="navigateTo(`/buildings/${property.building!.id}`)"
                >
                  <Building2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Statistics (if available) -->
      <Card v-if="property._count">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <BarChart3 class="h-5 w-5" />
            İstatistikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-muted rounded-lg">
              <div class="text-2xl font-bold">
                {{ property._count.contracts || 0 }}
              </div>
              <div class="text-sm text-muted-foreground">Sözleşme</div>
            </div>

            <div class="text-center p-4 bg-muted rounded-lg">
              <div class="text-2xl font-bold">
                {{ property._count.documents || 0 }}
              </div>
              <div class="text-sm text-muted-foreground">Belge</div>
            </div>

            <div class="text-center p-4 bg-muted rounded-lg">
              <div class="text-2xl font-bold">
                {{ property._count.maintenanceRecords || 0 }}
              </div>
              <div class="text-sm text-muted-foreground">Bakım Kaydı</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Metadata -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Clock class="h-5 w-5" />
            Sistem Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="space-y-1">
              <Label class="text-xs font-medium text-muted-foreground"
                >Oluşturulma Tarihi</Label
              >
              <p>{{ formatDate(property.createdAt) }}</p>
            </div>

            <div class="space-y-1">
              <Label class="text-xs font-medium text-muted-foreground"
                >Son Güncelleme</Label
              >
              <p>{{ formatDate(property.updatedAt) }}</p>
            </div>

            <div class="space-y-1">
              <Label class="text-xs font-medium text-muted-foreground"
                >Aktif Durum</Label
              >
              <Badge :variant="property.isActive ? 'default' : 'secondary'">
                {{ property.isActive ? "Aktif" : "Pasif" }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "~/stores/user";
import { useProperties } from "~/composables/useProperties";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Edit,
  Home,
  MapPin,
  Building2,
  BarChart3,
  Clock,
} from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const route = useRoute();
const userStore = useUserStore();
const {
  getStatusVariant,
  getStatusText,
  getTypeText,
  currentProperty,
  loading,
  error,
  loadProperty,
} = useProperties();

const property = computed(() => currentProperty.value);

// Load property details using composable
const loadPropertyData = async () => {
  const propertyId = route.params.id as string;
  await loadProperty(propertyId);
};

// Format date helper
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Load property on mount
onMounted(() => {
  loadPropertyData();
});
</script>
