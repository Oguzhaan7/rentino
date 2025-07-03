<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Raporlar</h1>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="exportAllReports">
          <Download class="mr-2 h-4 w-4" />
          Tümünü Dışa Aktar </Button
        ><Button @click="refreshAllData">
          <RefreshCw class="mr-2 h-4 w-4" />
          Verileri Yenile
        </Button>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Toplam Gelir</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ₺{{ stats.totalIncome.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">
            <span class="text-green-600">+{{ stats.incomeGrowth }}%</span> geçen
            aydan
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Doluluk Oranı</CardTitle>
          <PieChart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.occupancyRate }}%</div>
          <p class="text-xs text-muted-foreground">
            {{ stats.occupiedUnits }}/{{ stats.totalUnits }} daire dolu
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Bakım Talepleri</CardTitle>
          <Wrench class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.maintenanceRequests }}</div>
          <p class="text-xs text-muted-foreground">
            {{ stats.pendingRequests }} bekliyor
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Net Kar</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ₺{{ stats.netProfit.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">
            <span class="text-green-600">+{{ stats.profitGrowth }}%</span> geçen
            aydan
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <div class="grid gap-4 md:grid-cols-3">
      <Button
        v-if="canViewIncomeReports"
        variant="outline"
        class="h-20 flex-col"
        @click="navigateTo('/reports/income')"
      >
        <TrendingUp class="h-6 w-6 mb-2" />
        Gelir Raporları
      </Button>

      <Button
        v-if="canViewOccupancyReports"
        variant="outline"
        class="h-20 flex-col"
        @click="navigateTo('/reports/occupancy')"
      >
        <PieChart class="h-6 w-6 mb-2" />
        Doluluk Raporları
      </Button>

      <Button
        v-if="canViewMaintenanceReports"
        variant="outline"
        class="h-20 flex-col"
        @click="navigateTo('/reports/maintenance')"
      >
        <Wrench class="h-6 w-6 mb-2" />
        Bakım Raporları
      </Button>
    </div>

    <!-- Recent Reports Activity -->
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Son Oluşturulan Raporlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="report in recentReports"
              :key="report.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <Badge :variant="getReportTypeBadgeVariant(report.type)">
                  {{ report.type }}
                </Badge>
                <div>
                  <p class="text-sm font-medium">{{ report.title }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatDate(report.createdAt) }}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" @click="downloadReport(report)">
                <Download class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hızlı İstatistikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm">Bu Ay Kira Tahsilatı</span>
              <span class="font-medium"
                >₺{{ quickStats.monthlyRent.toLocaleString() }}</span
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Geciken Ödemeler</span>
              <span class="font-medium text-red-600"
                >₺{{ quickStats.overduePayments.toLocaleString() }}</span
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Bu Ay Giderler</span>
              <span class="font-medium"
                >₺{{ quickStats.monthlyExpenses.toLocaleString() }}</span
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Aktif Sözleşmeler</span>
              <span class="font-medium">{{ quickStats.activeContracts }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Boş Daireler</span>
              <span class="font-medium">{{ quickStats.vacantUnits }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Charts Section -->
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Aylık Gelir Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="h-[200px] flex items-center justify-center text-muted-foreground"
          >
            <BarChart3 class="h-8 w-8 mr-2" />
            Grafik burada görüntülenecek
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doluluk Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="h-[200px] flex items-center justify-center text-muted-foreground"
          >
            <PieChart class="h-8 w-8 mr-2" />
            Pasta grafik burada görüntülenecek
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Download,
  RefreshCw,
  TrendingUp,
  PieChart,
  Wrench,
  DollarSign,
  BarChart3,
} from "lucide-vue-next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Role-based access control
const userStore = useUserStore();

const canViewIncomeReports = computed(() => {
  return (
    userStore.user?.role === "ADMIN" ||
    userStore.user?.role === "PROPERTY_OWNER" ||
    userStore.user?.role === "MANAGER" ||
    userStore.user?.role === "ACCOUNTANT"
  );
});

const canViewOccupancyReports = computed(() => {
  return (
    userStore.user?.role === "ADMIN" ||
    userStore.user?.role === "PROPERTY_OWNER" ||
    userStore.user?.role === "MANAGER"
  );
});

const canViewMaintenanceReports = computed(() => {
  return (
    userStore.user?.role === "ADMIN" ||
    userStore.user?.role === "PROPERTY_OWNER" ||
    userStore.user?.role === "MANAGER"
  );
});

// Mock data - replace with real API calls
const stats = ref({
  totalIncome: 750000,
  incomeGrowth: 12,
  occupancyRate: 85,
  occupiedUnits: 34,
  totalUnits: 40,
  maintenanceRequests: 12,
  pendingRequests: 5,
  netProfit: 420000,
  profitGrowth: 8,
});

const quickStats = ref({
  monthlyRent: 145000,
  overduePayments: 15000,
  monthlyExpenses: 35000,
  activeContracts: 34,
  vacantUnits: 6,
});

const recentReports = ref([
  {
    id: 1,
    type: "Gelir",
    title: "Ekim 2024 Gelir Raporu",
    createdAt: new Date("2024-11-01"),
    url: "/reports/income-2024-10.pdf",
  },
  {
    id: 2,
    type: "Doluluk",
    title: "Q3 2024 Doluluk Analizi",
    createdAt: new Date("2024-10-30"),
    url: "/reports/occupancy-q3-2024.pdf",
  },
  {
    id: 3,
    type: "Bakım",
    title: "Ekim Bakım Raporu",
    createdAt: new Date("2024-10-28"),
    url: "/reports/maintenance-2024-10.pdf",
  },
  {
    id: 4,
    type: "Gelir",
    title: "Eylül 2024 Gelir Raporu",
    createdAt: new Date("2024-10-01"),
    url: "/reports/income-2024-09.pdf",
  },
]);

const getReportTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "Gelir":
      return "default";
    case "Doluluk":
      return "secondary";
    case "Bakım":
      return "outline";
    default:
      return "default";
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const exportAllReports = () => {
  // Implementation for exporting all reports
  console.log("Exporting all reports...");
};

const refreshAllData = () => {
  // Implementation for refreshing all data
  console.log("Refreshing all data...");
};

const downloadReport = (report: any) => {
  // Implementation for downloading individual report
  console.log("Downloading report:", report.title);
};

// Page metadata
definePageMeta({
  title: "Raporlar",
  middleware: "auth",
});
</script>
