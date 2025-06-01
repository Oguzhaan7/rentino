<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            class="gap-2"
            @click="navigateTo('/my-rental')"
          >
            <ArrowLeft class="h-4 w-4" />
            Geri Dön
          </Button>
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Ödeme Geçmişi</h1>
        <p class="text-muted-foreground">
          Kira ödemelerinizin tamamı ve detayları
        </p>
      </div>
      <Button variant="outline" class="gap-2" @click="downloadPaymentReport">
        <Download class="h-4 w-4" />
        PDF İndir
      </Button>
    </div>

    <!-- Summary Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Toplam Ödenen</CardTitle>
          <CreditCard class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ formatCurrency(totalPaid) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ paidPaymentsCount }} ödeme
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Aylık Kira</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatCurrency(monthlyRent) }}
          </div>
          <p class="text-xs text-muted-foreground">
            Her ay {{ paymentDay }}. günü
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Son Ödeme</CardTitle>
          <Calendar class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatDate(lastPaymentDate) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ getDaysSinceLastPayment() }} gün önce
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Sonraki Ödeme</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatDate(nextPaymentDate) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ getDaysUntilNextPayment() }} gün kaldı
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Filtreler</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[200px]">
            <Label html-for="year-filter">Yıl</Label>
            <Select v-model="selectedYear">
              <SelectTrigger>
                <SelectValue placeholder="Yıl seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex-1 min-w-[200px]">
            <Label html-for="status-filter">Durum</Label>
            <Select v-model="selectedStatus">
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="PAID">Ödendi</SelectItem>
                <SelectItem value="PENDING">Beklemede</SelectItem>
                <SelectItem value="OVERDUE">Gecikmiş</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-end">
            <Button variant="outline" @click="clearFilters">
              Filtreleri Temizle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Payments Table -->
    <Card>
      <CardHeader>
        <CardTitle>Ödeme Listesi</CardTitle>
        <CardDescription>
          Tüm kira ödemelerinizin detaylı listesi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-2">Tarih</th>
                <th class="text-left p-2">Açıklama</th>
                <th class="text-left p-2">Tutar</th>
                <th class="text-left p-2">Durum</th>
                <th class="text-left p-2">Ödeme Yöntemi</th>
                <th class="text-left p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="payment in filteredPayments"
                :key="payment.id"
                class="border-b hover:bg-muted/50"
              >
                <td class="p-2">
                  <div class="font-medium">
                    {{ formatDate(payment.dueDate) }}
                  </div>
                  <div
                    v-if="payment.paidDate"
                    class="text-sm text-muted-foreground"
                  >
                    Ödendi: {{ formatDate(payment.paidDate) }}
                  </div>
                </td>
                <td class="p-2">
                  <div class="font-medium">{{ payment.description }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ payment.period }}
                  </div>
                </td>
                <td class="p-2">
                  <div class="font-bold">
                    {{ formatCurrency(payment.amount) }}
                  </div>
                  <div v-if="payment.lateFee" class="text-sm text-red-600">
                    +{{ formatCurrency(payment.lateFee) }} gecikme
                  </div>
                </td>
                <td class="p-2">
                  <Badge :variant="getPaymentStatusVariant(payment.status)">
                    {{ getPaymentStatusLabel(payment.status) }}
                  </Badge>
                </td>
                <td class="p-2">
                  <div class="text-sm">{{ payment.paymentMethod || "-" }}</div>
                </td>
                <td class="p-2">
                  <div class="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      class="gap-1"
                      @click="viewPaymentDetails(payment)"
                    >
                      <Eye class="h-3 w-3" />
                      Detay
                    </Button>
                    <Button
                      v-if="payment.status === 'PAID'"
                      variant="outline"
                      size="sm"
                      class="gap-1"
                      @click="downloadReceipt(payment)"
                    >
                      <Download class="h-3 w-3" />
                      Makbuz
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredPayments.length === 0" class="text-center py-8">
          <CreditCard class="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 class="text-lg font-medium mb-2">Ödeme bulunamadı</h3>
          <p class="text-muted-foreground mb-4">
            Seçili filtreler için herhangi bir ödeme kaydı bulunmuyor.
          </p>
          <Button variant="outline" @click="clearFilters">
            Filtreleri Temizle
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Payment Details Modal -->
    <Dialog v-model:open="showPaymentDetails">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Ödeme Detayları</DialogTitle>
        </DialogHeader>
        <div v-if="selectedPayment" class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="space-y-2">
              <div>
                <span class="font-medium">Tutar:</span>
                <div class="text-lg font-bold">
                  {{ formatCurrency(selectedPayment.amount) }}
                </div>
              </div>
              <div v-if="selectedPayment.lateFee">
                <span class="font-medium">Gecikme Ücreti:</span>
                <div class="text-red-600">
                  {{ formatCurrency(selectedPayment.lateFee) }}
                </div>
              </div>
              <div>
                <span class="font-medium">Durum:</span>
                <div>
                  <Badge
                    :variant="getPaymentStatusVariant(selectedPayment.status)"
                  >
                    {{ getPaymentStatusLabel(selectedPayment.status) }}
                  </Badge>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div>
                <span class="font-medium">Vade Tarihi:</span>
                <div>{{ formatDate(selectedPayment.dueDate) }}</div>
              </div>
              <div v-if="selectedPayment.paidDate">
                <span class="font-medium">Ödeme Tarihi:</span>
                <div>{{ formatDate(selectedPayment.paidDate) }}</div>
              </div>
              <div v-if="selectedPayment.paymentMethod">
                <span class="font-medium">Ödeme Yöntemi:</span>
                <div>{{ selectedPayment.paymentMethod }}</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <span class="font-medium">Açıklama:</span>
            <p class="text-sm text-muted-foreground mt-1">
              {{ selectedPayment.description }}
            </p>
          </div>

          <div v-if="selectedPayment.notes">
            <span class="font-medium">Notlar:</span>
            <p class="text-sm text-muted-foreground mt-1">
              {{ selectedPayment.notes }}
            </p>
          </div>
        </div>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showPaymentDetails = false">
            Kapat
          </Button>
          <Button
            v-if="selectedPayment?.status === 'PAID'"
            class="gap-2"
            @click="downloadReceipt(selectedPayment)"
          >
            <Download class="h-4 w-4" />
            Makbuz İndir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  Download,
  Eye,
} from "lucide-vue-next";

// Mock data
const payments = ref([
  {
    id: "1",
    amount: 5000,
    description: "Ocak 2024 Kira Ödemesi",
    period: "Ocak 2024",
    dueDate: new Date("2024-01-01"),
    paidDate: new Date("2024-01-01"),
    status: "PAID",
    paymentMethod: "Havale/EFT",
    lateFee: 0,
    notes: "Zamanında ödendi",
  },
  {
    id: "2",
    amount: 5000,
    description: "Aralık 2023 Kira Ödemesi",
    period: "Aralık 2023",
    dueDate: new Date("2023-12-01"),
    paidDate: new Date("2023-12-03"),
    status: "PAID",
    paymentMethod: "Nakit",
    lateFee: 0,
    notes: "Nakit olarak ödendi",
  },
  {
    id: "3",
    amount: 5000,
    description: "Kasım 2023 Kira Ödemesi",
    period: "Kasım 2023",
    dueDate: new Date("2023-11-01"),
    paidDate: new Date("2023-11-05"),
    status: "PAID",
    paymentMethod: "Havale/EFT",
    lateFee: 150,
    notes: "4 gün gecikme ücreti ile ödendi",
  },
  {
    id: "4",
    amount: 5000,
    description: "Şubat 2024 Kira Ödemesi",
    period: "Şubat 2024",
    dueDate: new Date("2024-02-01"),
    paidDate: null,
    status: "PENDING",
    paymentMethod: null,
    lateFee: 0,
    notes: "Beklemede",
  },
]);

// Reactive state
const selectedYear = ref("all");
const selectedStatus = ref("all");
const showPaymentDetails = ref(false);
const selectedPayment = ref<any>(null);

// Summary data
const monthlyRent = ref(5000);
const paymentDay = ref(1);
const lastPaymentDate = ref(new Date("2024-01-01"));
const nextPaymentDate = ref(new Date("2024-02-01"));

// Computed values
const filteredPayments = computed(() => {
  let filtered = payments.value;

  if (selectedYear.value !== "all") {
    filtered = filtered.filter(
      (payment) =>
        payment.dueDate.getFullYear().toString() === selectedYear.value
    );
  }

  if (selectedStatus.value !== "all") {
    filtered = filtered.filter(
      (payment) => payment.status === selectedStatus.value
    );
  }

  return filtered.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
});

const totalPaid = computed(() => {
  return payments.value
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
});

const paidPaymentsCount = computed(() => {
  return payments.value.filter((p) => p.status === "PAID").length;
});

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const getDaysSinceLastPayment = () => {
  const today = new Date();
  const diffTime = today.getTime() - lastPaymentDate.value.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getDaysUntilNextPayment = () => {
  const today = new Date();
  const diffTime = nextPaymentDate.value.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PAID: "Ödendi",
    PENDING: "Beklemede",
    OVERDUE: "Gecikmiş",
  };
  return labels[status] || status;
};

const getPaymentStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    PAID: "default",
    PENDING: "secondary",
    OVERDUE: "destructive",
  };
  return variants[status] || "default";
};

// Actions
const clearFilters = () => {
  selectedYear.value = "all";
  selectedStatus.value = "all";
};

const viewPaymentDetails = (payment: any) => {
  selectedPayment.value = payment;
  showPaymentDetails.value = true;
};

const downloadReceipt = (payment: any) => {
  console.log("Downloading receipt for payment:", payment.id);
  // TODO: Implement receipt download
};

const downloadPaymentReport = () => {
  console.log("Downloading payment report");
  // TODO: Implement payment report download
};

// Check permissions
const userStore = useUserStore();
if (userStore.user?.role !== "TENANT") {
  throw createError({
    statusCode: 403,
    statusMessage: "Bu sayfaya erişim yetkiniz yok",
  });
}

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
</script>
