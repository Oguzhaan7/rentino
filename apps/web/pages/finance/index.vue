<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Mali İşlemler</h1>
    </div>

    <!-- Finance Overview Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Bu Ay Gelir</CardTitle>
          <TrendingUp class="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            ₺{{ monthlyIncome.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">+12.5% geçen aya göre</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Bu Ay Gider</CardTitle>
          <TrendingDown class="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">
            ₺{{ monthlyExpenses.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">+5.2% geçen aya göre</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Net Kar</CardTitle>
          <DollarSign class="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">
            ₺{{ netProfit.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">+18.2% geçen aya göre</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Bekleyen Ödemeler</CardTitle>
          <Clock class="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">
            ₺{{ pendingPayments.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">{{ pendingCount }} ödeme</p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Button class="h-20 flex-col" @click="navigateTo('/finance/payments')">
        <CreditCard class="h-6 w-6 mb-2" />
        Ödemeler
      </Button>

      <Button
        v-if="canViewInvoices"
        variant="outline"
        class="h-20 flex-col"
        @click="navigateTo('/finance/invoices')"
      >
        <Receipt class="h-6 w-6 mb-2" />
        Faturalar
      </Button>

      <Button
        v-if="canViewExpenses"
        variant="outline"
        class="h-20 flex-col"
        @click="navigateTo('/finance/expenses')"
      >
        <Calculator class="h-6 w-6 mb-2" />
        Giderler
      </Button>

      <Button
        v-if="canManageBuildingExpenses"
        variant="outline"
        class="h-20 flex-col"
        @click="navigateTo('/finance/building-expenses')"
      >
        <Building2 class="h-6 w-6 mb-2" />
        Bina Giderleri
      </Button>
    </div>

    <!-- Recent Transactions -->
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Son Ödemeler</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="payment in recentPayments"
              :key="payment.id"
              class="flex items-center justify-between"
            >
              <div>
                <p class="text-sm font-medium">{{ payment.tenantName }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ payment.propertyName }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-green-600">
                  +₺{{ payment.amount.toLocaleString() }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ formatDate(payment.date) }}
                </p>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <Button
              variant="outline"
              size="sm"
              @click="navigateTo('/finance/payments')"
            >
              Tümünü Gör
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Son Giderler</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="expense in recentExpenses"
              :key="expense.id"
              class="flex items-center justify-between"
            >
              <div>
                <p class="text-sm font-medium">{{ expense.description }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ expense.category }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-red-600">
                  -₺{{ expense.amount.toLocaleString() }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ formatDate(expense.date) }}
                </p>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <Button
              variant="outline"
              size="sm"
              @click="navigateTo('/finance/expenses')"
            >
              Tümünü Gör
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Monthly Chart -->
    <Card>
      <CardHeader>
        <CardTitle>Aylık Gelir/Gider Karşılaştırması</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          class="h-[300px] flex items-center justify-center text-muted-foreground"
        >
          <BarChart3 class="h-12 w-12 mr-4" />
          Grafik burada gösterilecek (Chart.js veya benzeri kütüphane ile)
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CreditCard,
  Receipt,
  Calculator,
  Building2,
  BarChart3,
} from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();

// Computed permissions
const canViewInvoices = computed(
  () =>
    userStore.user?.role === "ADMIN" ||
    userStore.user?.role === "PROPERTY_OWNER" ||
    userStore.user?.role === "ACCOUNTANT"
);

const canViewExpenses = computed(
  () =>
    userStore.user?.role === "ADMIN" ||
    userStore.user?.role === "PROPERTY_OWNER" ||
    userStore.user?.role === "ACCOUNTANT"
);

const canManageBuildingExpenses = computed(
  () =>
    userStore.user?.role === "ADMIN" ||
    userStore.user?.role === "MANAGER" ||
    userStore.user?.role === "ACCOUNTANT"
);

// Mock data - replace with actual API calls
const monthlyIncome = ref(125000);
const monthlyExpenses = ref(42000);
const netProfit = computed(() => monthlyIncome.value - monthlyExpenses.value);
const pendingPayments = ref(18500);
const pendingCount = ref(7);

const recentPayments = ref([
  {
    id: 1,
    tenantName: "Ahmet Yılmaz",
    propertyName: "Bahçelievler Daire 1A",
    amount: 2500,
    date: "2024-05-30",
  },
  {
    id: 2,
    tenantName: "Fatma Demir",
    propertyName: "Kadıköy Daire 2B",
    amount: 3200,
    date: "2024-05-29",
  },
  {
    id: 3,
    tenantName: "Mehmet Kaya",
    propertyName: "Beşiktaş Ofis 3C",
    amount: 4100,
    date: "2024-05-28",
  },
]);

const recentExpenses = ref([
  {
    id: 1,
    description: "Asansör Bakımı",
    category: "Bakım",
    amount: 1200,
    date: "2024-05-30",
  },
  {
    id: 2,
    description: "Elektrik Faturası",
    category: "Fatura",
    amount: 850,
    date: "2024-05-29",
  },
  {
    id: 3,
    description: "Temizlik Malzemesi",
    category: "Malzeme",
    amount: 320,
    date: "2024-05-28",
  },
]);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR");
};

// Load financial data on mount
onMounted(async () => {
  try {
    // TODO: Implement API calls to fetch financial data
    // const income = await $fetch('/api/finance/monthly-income')
    // const expenses = await $fetch('/api/finance/monthly-expenses')
    // const payments = await $fetch('/api/finance/recent-payments')
    // const expenseList = await $fetch('/api/finance/recent-expenses')
  } catch (error) {
    console.error("Error loading financial data:", error);
  }
});
</script>
