<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground">
          Mülk yönetimi sisteminizin genel görünümü
        </p>
      </div>
      <div class="text-sm text-muted-foreground">
        Son güncelleme: {{ currentDate }}
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <!-- Total Properties -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Toplam Mülk</CardTitle>
          <Building class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.totalProperties }}</div>
          <p class="text-xs text-muted-foreground">
            <span class="text-green-600"
              >+{{ stats.newPropertiesThisMonth }}</span
            >
            bu ay
          </p>
        </CardContent>
      </Card>

      <!-- Total Tenants -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Toplam Kiracı</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.totalTenants }}</div>
          <p class="text-xs text-muted-foreground">
            %{{ occupancyRate }} doluluk oranı
          </p>
        </CardContent>
      </Card>

      <!-- Monthly Revenue -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Aylık Gelir</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatCurrency(stats.monthlyRevenue) }}
          </div>
          <p class="text-xs text-muted-foreground">
            <span class="text-green-600">+{{ stats.revenueGrowth }}%</span>
            önceki aya göre
          </p>
        </CardContent>
      </Card>

      <!-- Pending Payments -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Bekleyen Ödeme</CardTitle>
          <AlertTriangle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">
            {{ stats.pendingPayments }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ formatCurrency(stats.pendingAmount) }} toplam
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts and Recent Activity -->
    <div class="grid gap-6 lg:grid-cols-3 mb-8">
      <!-- Revenue Chart -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>Gelir Analizi</CardTitle>
          <CardDescription>Son 6 ayın gelir durumu</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            class="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg"
          >
            <div class="text-center">
              <BarChart3 class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p class="text-muted-foreground">Grafik yakında gelecek</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>Sık kullanılan işlemler</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <Button
            class="w-full justify-start gap-2"
            variant="outline"
            @click="navigateTo('/properties/create')"
          >
            <Plus class="h-4 w-4" />
            Yeni Mülk Ekle
          </Button>
          <Button
            class="w-full justify-start gap-2"
            variant="outline"
            @click="navigateTo('/tenants/create')"
          >
            <UserPlus class="h-4 w-4" />
            Yeni Kiracı Ekle
          </Button>
          <Button
            class="w-full justify-start gap-2"
            variant="outline"
            @click="navigateTo('/contracts/create')"
          >
            <FileText class="h-4 w-4" />
            Yeni Sözleşme
          </Button>
          <Button
            class="w-full justify-start gap-2"
            variant="outline"
            @click="navigateTo('/finance/payments')"
          >
            <CreditCard class="h-4 w-4" />
            Ödeme Kaydı
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Activities and Alerts -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Recent Activities -->
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>Sistemdeki son işlemler</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="flex items-start gap-3"
            >
              <div
                :class="[
                  'h-2 w-2 rounded-full mt-2',
                  getActivityColor(activity.type),
                ]"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm">{{ activity.description }}</p>
                <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Alerts & Notifications -->
      <Card>
        <CardHeader>
          <CardTitle>Uyarılar & Bildirimler</CardTitle>
          <CardDescription>Dikkat edilmesi gereken durumlar</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="alert in alerts"
              :key="alert.id"
              class="flex items-start gap-3 p-3 rounded-lg border"
            >
              <component
                :is="getAlertIcon(alert.type)"
                :class="['h-4 w-4 mt-0.5', getAlertColor(alert.type)]"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">{{ alert.title }}</p>
                <p class="text-xs text-muted-foreground">{{ alert.message }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building,
  Users,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Plus,
  UserPlus,
  FileText,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

// Mock statistics data
const stats = ref({
  totalProperties: 45,
  totalTenants: 38,
  monthlyRevenue: 125000,
  pendingPayments: 8,
  pendingAmount: 24500,
  newPropertiesThisMonth: 3,
  revenueGrowth: 12.5,
});

// Computed values
const occupancyRate = computed(() => {
  return Math.round(
    (stats.value.totalTenants / stats.value.totalProperties) * 100
  );
});

const currentDate = computed(() => {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
});

// Recent activities mock data
const recentActivities = ref([
  {
    id: 1,
    type: "payment",
    description: "Ahmet Yılmaz kira ödemesini gerçekleştirdi (₺3,500)",
    time: "2 saat önce",
  },
  {
    id: 2,
    type: "contract",
    description:
      "Yeni sözleşme imzalandı - Zeynep Kaya (Bahçelievler Apt. No:5)",
    time: "4 saat önce",
  },
  {
    id: 3,
    type: "maintenance",
    description: "Bakım talebi açıldı - Beylikdüzü Sitesi A Blok",
    time: "6 saat önce",
  },
  {
    id: 4,
    type: "tenant",
    description: "Yeni kiracı kaydı oluşturuldu - Mehmet Demir",
    time: "1 gün önce",
  },
  {
    id: 5,
    type: "payment",
    description: "Fatma Özkan kira ödemesini gerçekleştirdi (₺4,200)",
    time: "1 gün önce",
  },
]);

// Alerts mock data
const alerts = ref([
  {
    id: 1,
    type: "warning",
    title: "Sözleşme Süresi Bitiyor",
    message: "3 kiracının sözleşmesi bu ay sona eriyor",
  },
  {
    id: 2,
    type: "error",
    title: "Geciken Ödemeler",
    message: "5 kiracının ödemesi 15 günden fazla gecikmiş",
  },
  {
    id: 3,
    type: "info",
    title: "Bakım Zamanı",
    message: "2 mülkün yıllık bakım zamanı geldi",
  },
  {
    id: 4,
    type: "success",
    title: "Hedef Tamamlandı",
    message: "Bu ayki gelir hedefi %105 ile aşıldı",
  },
]);

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
};

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    payment: "bg-green-500",
    contract: "bg-blue-500",
    maintenance: "bg-orange-500",
    tenant: "bg-purple-500",
  };
  return colors[type] || "bg-gray-500";
};

const getAlertIcon = (type: string) => {
  const icons: Record<string, typeof AlertTriangle> = {
    warning: AlertTriangle,
    error: AlertCircle,
    info: Clock,
    success: CheckCircle,
  };
  return icons[type] || AlertCircle;
};

const getAlertColor = (type: string) => {
  const colors: Record<string, string> = {
    warning: "text-orange-500",
    error: "text-red-500",
    info: "text-blue-500",
    success: "text-green-500",
  };
  return colors[type] || "text-gray-500";
};

// Update stats periodically to simulate real-time updates
onMounted(() => {
  // Simulate real-time data updates every 30 seconds
  const interval = setInterval(() => {
    // Randomly update some stats to simulate real-time changes
    if (Math.random() > 0.7) {
      stats.value.monthlyRevenue += Math.floor(Math.random() * 5000);
    }
    if (Math.random() > 0.8) {
      stats.value.pendingPayments = Math.max(
        0,
        stats.value.pendingPayments + (Math.random() > 0.5 ? 1 : -1)
      );
    }
  }, 30000);

  // Cleanup interval on unmount
  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>
