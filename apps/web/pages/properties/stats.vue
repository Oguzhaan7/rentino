<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Mülk İstatistikleri</h1>
      <Button variant="outline" @click="navigateTo('/properties')">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Mülklere Dön
      </Button>
    </div>

    <!-- Overview Stats -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Toplam Mülk</CardTitle>
          <Building class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.totalProperties }}</div>
          <p class="text-xs text-muted-foreground">Toplam portföy</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Kiraya Verilmiş</CardTitle>
          <Home class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.rentedProperties }}</div>
          <p class="text-xs text-muted-foreground">
            %{{ occupancyRate }} doluluk oranı
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Müsait Mülk</CardTitle>
          <Calendar class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.availableProperties }}</div>
          <p class="text-xs text-muted-foreground">Kiraya verilebilir</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Ortalama Kira</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ₺{{ stats.averageRent?.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">Aylık ortalama</p>
        </CardContent>
      </Card>
    </div>

    <!-- Property Type Distribution -->
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Mülk Tipi Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="type in propertyTypes"
              :key="type.name"
              class="flex items-center"
            >
              <div class="w-full">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium">{{ type.name }}</span>
                  <span class="text-sm text-muted-foreground">{{
                    type.count
                  }}</span>
                </div>
                <div class="w-full bg-secondary rounded-full h-2">
                  <div
                    class="bg-primary h-2 rounded-full"
                    :style="{
                      width: `${(type.count / stats.totalProperties) * 100}%`,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Durum Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="status in statusDistribution"
              :key="status.name"
              class="flex items-center"
            >
              <div class="w-full">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium">{{ status.name }}</span>
                  <span class="text-sm text-muted-foreground">{{
                    status.count
                  }}</span>
                </div>
                <div class="w-full bg-secondary rounded-full h-2">
                  <div
                    :class="status.colorClass"
                    class="h-2 rounded-full"
                    :style="{
                      width: `${(status.count / stats.totalProperties) * 100}%`,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Monthly Revenue Chart -->
    <Card>
      <CardHeader>
        <CardTitle>Aylık Kira Geliri Trendi</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          class="h-[200px] flex items-center justify-center text-muted-foreground"
        >
          <BarChart3 class="h-12 w-12 mr-4" />
          Grafik burada gösterilecek (Chart.js veya benzeri kütüphane ile)
        </div>
      </CardContent>
    </Card>

    <!-- Recent Property Activity -->
    <Card>
      <CardHeader>
        <CardTitle>Son Mülk Aktiviteleri</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-center space-x-4"
          >
            <div class="flex h-2 w-2 rounded-full bg-blue-600" />
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">
                {{ activity.description }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ activity.property }}
              </p>
            </div>
            <div class="text-sm text-muted-foreground">{{ activity.date }}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building,
  Home,
  Calendar,
  DollarSign,
  ArrowLeft,
  BarChart3,
} from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();

// Mock data - replace with actual API calls
const stats = ref({
  totalProperties: 24,
  rentedProperties: 18,
  availableProperties: 4,
  maintenanceProperties: 2,
  averageRent: 3250,
});

const occupancyRate = computed(() => {
  return Math.round(
    (stats.value.rentedProperties / stats.value.totalProperties) * 100
  );
});

const propertyTypes = ref([
  { name: "Daire", count: 15 },
  { name: "Ev", count: 5 },
  { name: "Ofis", count: 3 },
  { name: "Dükkan", count: 1 },
]);

const statusDistribution = ref([
  { name: "Kiraya Verilmiş", count: 18, colorClass: "bg-green-500" },
  { name: "Müsait", count: 4, colorClass: "bg-blue-500" },
  { name: "Bakımda", count: 2, colorClass: "bg-yellow-500" },
]);

const recentActivities = ref([
  {
    id: 1,
    description: "Yeni kiracı sözleşme imzaladı",
    property: "Bahçelievler Daire 1A",
    date: "2 saat önce",
  },
  {
    id: 2,
    description: "Bakım talebi oluşturuldu",
    property: "Kadıköy Daire 2B",
    date: "5 saat önce",
  },
  {
    id: 3,
    description: "Kira ödemesi alındı",
    property: "Beşiktaş Ofis 3C",
    date: "1 gün önce",
  },
]);

// Load statistics on mount
onMounted(async () => {
  try {
    // TODO: Implement API call to fetch property statistics
    // const { data } = await $fetch('/api/properties/stats')
    // stats.value = data
  } catch (error) {
    console.error("Error loading property statistics:", error);
  }
});
</script>
