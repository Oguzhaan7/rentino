<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Toplam Mülk</CardTitle>
          <Building class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.totalProperties }}</div>
          <p class="text-xs text-muted-foreground">+10.1% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Aktif Sözleşme</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.activeContracts }}</div>
          <p class="text-xs text-muted-foreground">+5.2% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Aylık Gelir</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">₺{{ stats.monthlyIncome?.toLocaleString() }}</div>
          <p class="text-xs text-muted-foreground">+12.5% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Doluluk Oranı</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.occupancyRate }}%</div>
          <p class="text-xs text-muted-foreground">+2.1% from last month</p>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Activity -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card class="col-span-4">
        <CardHeader>
          <CardTitle>Son Ödemeler</CardTitle>
        </CardHeader>
        <CardContent class="pl-2">
          <div class="space-y-8">
            <div v-for="payment in recentPayments" :key="payment.id" class="flex items-center">
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">
                  {{ payment.tenantName }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ payment.propertyName }}
                </p>
              </div>
              <div class="ml-auto font-medium">₺{{ payment.amount.toLocaleString() }}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="col-span-3">
        <CardHeader>
          <CardTitle>Yaklaşan Ödemeler</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="upcoming in upcomingPayments" :key="upcoming.id" class="flex items-center">
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">
                  {{ upcoming.tenantName }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ upcoming.dueDate }}
                </p>
              </div>
              <div class="ml-auto">
                <Badge variant="secondary">{{ upcoming.daysLeft }} gün</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, FileText, DollarSign, TrendingUp } from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();

// Mock data - replace with actual API calls
const stats = ref({
  totalProperties: 24,
  activeContracts: 18,
  monthlyIncome: 45000,
  occupancyRate: 85,
});

const recentPayments = ref([
  {
    id: 1,
    tenantName: "Ahmet Yılmaz",
    propertyName: "Bahçelievler Daire 1A",
    amount: 2500,
  },
  {
    id: 2,
    tenantName: "Fatma Demir",
    propertyName: "Kadıköy Daire 2B",
    amount: 3200,
  },
  {
    id: 3,
    tenantName: "Mehmet Kaya",
    propertyName: "Beşiktaş Daire 3C",
    amount: 4100,
  },
]);

const upcomingPayments = ref([
  { id: 1, tenantName: "Ali Özkan", dueDate: "15 Haziran", daysLeft: 5 },
  { id: 2, tenantName: "Zeynep Acar", dueDate: "20 Haziran", daysLeft: 10 },
  { id: 3, tenantName: "Hasan Güler", dueDate: "25 Haziran", daysLeft: 15 },
]);

// Load user-specific dashboard data
onMounted(async () => {
  // TODO: Implement API calls based on user role
  if (userStore.user?.role === "TENANT") {
    // Load tenant-specific data
  } else {
    // Load property owner/admin data
  }
});
</script>
