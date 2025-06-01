<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Ödeme Yönetimi</h1>
        <p class="text-muted-foreground">Kira ödemeleri ve finansal işlemler</p>
      </div>
      <div class="flex gap-2">
        <Button class="gap-2" @click="showAddPayment = true">
          <Plus class="h-4 w-4" />
          Ödeme Ekle
        </Button>
        <Button variant="outline" class="gap-2" @click="exportPayments">
          <Download class="h-4 w-4" />
          Dışa Aktar
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Bu Ay Toplanan</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ formatCurrency(monthlyCollected) }}
          </div>
          <p class="text-xs text-muted-foreground">
            +{{ monthlyCollectedPercentage }}% geçen aya göre
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Bekleyen Ödemeler</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">
            {{ formatCurrency(pendingPayments) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ pendingPaymentsCount }} ödeme
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Geciken Ödemeler</CardTitle>
          <AlertTriangle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">
            {{ formatCurrency(overduePayments) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ overduePaymentsCount }} ödeme
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Ortalama Ödeme</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatCurrency(averagePayment) }}
          </div>
          <p class="text-xs text-muted-foreground">Son 6 ay ortalaması</p>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Filtreler</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label html-for="tenant-filter">Kiracı</Label>
            <Select v-model="selectedTenant">
              <SelectTrigger>
                <SelectValue placeholder="Kiracı seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kiracılar</SelectItem>
                <SelectItem
                  v-for="tenant in tenants"
                  :key="tenant.id"
                  :value="tenant.id"
                >
                  {{ tenant.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label html-for="property-filter">Mülk</Label>
            <Select v-model="selectedProperty">
              <SelectTrigger>
                <SelectValue placeholder="Mülk seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Mülkler</SelectItem>
                <SelectItem
                  v-for="property in properties"
                  :key="property.id"
                  :value="property.id"
                >
                  {{ property.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
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
                <SelectItem value="PARTIAL">Kısmi Ödendi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label html-for="date-from">Başlangıç Tarihi</Label>
            <Input v-model="dateFrom" type="date" />
          </div>

          <div>
            <Label html-for="date-to">Bitiş Tarihi</Label>
            <Input v-model="dateTo" type="date" />
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <Button variant="outline" @click="clearFilters">
            Filtreleri Temizle
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Payments Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Ödeme Listesi</CardTitle>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">
              {{ filteredPayments.length }} ödeme
            </span>
            <Select v-model="pageSize">
              <SelectTrigger class="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-3">Kiracı</th>
                <th class="text-left p-3">Mülk</th>
                <th class="text-left p-3">Tutar</th>
                <th class="text-left p-3">Vade Tarihi</th>
                <th class="text-left p-3">Ödeme Tarihi</th>
                <th class="text-left p-3">Durum</th>
                <th class="text-left p-3">Ödeme Yöntemi</th>
                <th class="text-left p-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="payment in paginatedPayments"
                :key="payment.id"
                class="border-b hover:bg-muted/50"
              >
                <td class="p-3">
                  <div class="flex items-center gap-3">
                    <Avatar class="h-8 w-8">
                      <AvatarImage :src="payment.tenant.avatar" />
                      <AvatarFallback>{{
                        getTenantInitials(payment.tenant)
                      }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div class="font-medium">{{ payment.tenant.name }}</div>
                      <div class="text-sm text-muted-foreground">
                        {{ payment.tenant.phone }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="p-3">
                  <div class="font-medium">{{ payment.property.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ payment.property.address }}
                  </div>
                </td>
                <td class="p-3">
                  <div class="font-bold">
                    {{ formatCurrency(payment.amount) }}
                  </div>
                  <div v-if="payment.lateFee" class="text-sm text-red-600">
                    +{{ formatCurrency(payment.lateFee) }} gecikme
                  </div>
                </td>
                <td class="p-3">
                  <div class="font-medium">
                    {{ formatDate(payment.dueDate) }}
                  </div>
                  <div v-if="isOverdue(payment)" class="text-sm text-red-600">
                    {{ getDaysOverdue(payment) }} gün gecikmiş
                  </div>
                </td>
                <td class="p-3">
                  <div v-if="payment.paidDate" class="font-medium">
                    {{ formatDate(payment.paidDate) }}
                  </div>
                  <div v-else class="text-muted-foreground">-</div>
                </td>
                <td class="p-3">
                  <Badge :variant="getPaymentStatusVariant(payment.status)">
                    {{ getPaymentStatusLabel(payment.status) }}
                  </Badge>
                </td>
                <td class="p-3">
                  <div class="text-sm">{{ payment.paymentMethod || "-" }}</div>
                </td>
                <td class="p-3">
                  <div class="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      @click="viewPaymentDetails(payment)"
                    >
                      <Eye class="h-3 w-3" />
                    </Button>
                    <Button
                      v-if="payment.status !== 'PAID'"
                      variant="outline"
                      size="sm"
                      @click="markAsPaid(payment)"
                    >
                      <Check class="h-3 w-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal class="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="editPayment(payment)">
                          <Edit class="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="sendReminder(payment)">
                          <Bell class="mr-2 h-4 w-4" />
                          Hatırlatma Gönder
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="downloadReceipt(payment)">
                          <Download class="mr-2 h-4 w-4" />
                          Makbuz İndir
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          class="text-red-600"
                          @click="deletePayment(payment)"
                        >
                          <Trash class="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-muted-foreground">
            Gösterilen: {{ (currentPage - 1) * parseInt(pageSize) + 1 }}-{{
              Math.min(
                currentPage * parseInt(pageSize),
                filteredPayments.length
              )
            }}
            / {{ filteredPayments.length }}
          </div>
          <div class="flex gap-2">
            <Button
              :disabled="currentPage === 1"
              variant="outline"
              size="sm"
              @click="currentPage--"
            >
              Önceki
            </Button>
            <Button
              :disabled="
                currentPage >=
                Math.ceil(filteredPayments.length / parseInt(pageSize))
              "
              variant="outline"
              size="sm"
              @click="currentPage++"
            >
              Sonraki
            </Button>
          </div>
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

    <!-- Add Payment Modal -->
    <Dialog v-model:open="showAddPayment">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Ödeme Ekle</DialogTitle>
          <DialogDescription>
            Kiracıdan alınan ödemeyi sisteme kaydedin
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label html-for="payment-tenant">Kiracı</Label>
              <Select v-model="newPayment.tenantId">
                <SelectTrigger>
                  <SelectValue placeholder="Kiracı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="tenant in tenants"
                    :key="tenant.id"
                    :value="tenant.id"
                  >
                    {{ tenant.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label html-for="payment-amount">Tutar</Label>
              <Input
                v-model="newPayment.amount"
                type="number"
                placeholder="5000"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label html-for="payment-due-date">Vade Tarihi</Label>
              <Input v-model="newPayment.dueDate" type="date" />
            </div>
            <div>
              <Label html-for="payment-paid-date">Ödeme Tarihi</Label>
              <Input v-model="newPayment.paidDate" type="date" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label html-for="payment-method">Ödeme Yöntemi</Label>
              <Select v-model="newPayment.paymentMethod">
                <SelectTrigger>
                  <SelectValue placeholder="Yöntem seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Nakit</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Havale/EFT</SelectItem>
                  <SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>
                  <SelectItem value="CHEQUE">Çek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label html-for="payment-status">Durum</Label>
              <Select v-model="newPayment.status">
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Ödendi</SelectItem>
                  <SelectItem value="PENDING">Beklemede</SelectItem>
                  <SelectItem value="PARTIAL">Kısmi Ödendi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label html-for="payment-description">Açıklama</Label>
            <Input
              v-model="newPayment.description"
              placeholder="Ocak 2024 kira ödemesi"
            />
          </div>

          <div>
            <Label html-for="payment-notes">Notlar (Opsiyonel)</Label>
            <Textarea
              v-model="newPayment.notes"
              placeholder="Ödeme ile ilgili ek notlar..."
              rows="3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showAddPayment = false">
            İptal
          </Button>
          <Button :disabled="!canAddPayment" @click="addPayment">
            Ödeme Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Plus,
  Download,
  TrendingUp,
  Clock,
  AlertTriangle,
  DollarSign,
  CreditCard,
  Eye,
  Check,
  MoreHorizontal,
  Edit,
  Bell,
  Trash,
} from "lucide-vue-next";

// Mock data
const payments = ref([
  {
    id: "1",
    tenant: {
      id: "1",
      name: "Emre Soy",
      phone: "+90 536 567 8901",
      avatar: "/avatars/05.png",
    },
    property: {
      id: "1",
      name: "Merkez Plaza A1",
      address: "Kadıköy, İstanbul",
    },
    amount: 5000,
    lateFee: 0,
    dueDate: new Date("2024-01-01"),
    paidDate: new Date("2024-01-01"),
    status: "PAID",
    paymentMethod: "BANK_TRANSFER",
    description: "Ocak 2024 kira ödemesi",
    notes: "Zamanında ödendi",
  },
  {
    id: "2",
    tenant: {
      id: "2",
      name: "Zeynep Ak",
      phone: "+90 537 678 9012",
      avatar: "/avatars/06.png",
    },
    property: {
      id: "2",
      name: "Güneş Residence B2",
      address: "Beşiktaş, İstanbul",
    },
    amount: 7500,
    lateFee: 0,
    dueDate: new Date("2024-02-01"),
    paidDate: null,
    status: "PENDING",
    paymentMethod: null,
    description: "Şubat 2024 kira ödemesi",
    notes: "",
  },
  {
    id: "3",
    tenant: {
      id: "3",
      name: "Can Yıldız",
      phone: "+90 538 789 0123",
      avatar: "/avatars/07.png",
    },
    property: {
      id: "3",
      name: "Yıldız Apartmanı C3",
      address: "Şişli, İstanbul",
    },
    amount: 4500,
    lateFee: 200,
    dueDate: new Date("2024-01-01"),
    paidDate: new Date("2024-01-08"),
    status: "PAID",
    paymentMethod: "CASH",
    description: "Ocak 2024 kira ödemesi",
    notes: "7 gün gecikme ile ödendi",
  },
]);

const tenants = ref([
  { id: "1", name: "Emre Soy" },
  { id: "2", name: "Zeynep Ak" },
  { id: "3", name: "Can Yıldız" },
]);

const properties = ref([
  { id: "1", name: "Merkez Plaza A1" },
  { id: "2", name: "Güneş Residence B2" },
  { id: "3", name: "Yıldız Apartmanı C3" },
]);

// Reactive state
const selectedTenant = ref("all");
const selectedProperty = ref("all");
const selectedStatus = ref("all");
const dateFrom = ref("");
const dateTo = ref("");
const pageSize = ref("25");
const currentPage = ref(1);
const showAddPayment = ref(false);

const newPayment = ref({
  tenantId: "",
  amount: "",
  dueDate: "",
  paidDate: "",
  paymentMethod: "",
  status: "PAID",
  description: "",
  notes: "",
});

// Computed values
const filteredPayments = computed(() => {
  let filtered = payments.value;

  if (selectedTenant.value !== "all") {
    filtered = filtered.filter(
      (payment) => payment.tenant.id === selectedTenant.value
    );
  }

  if (selectedProperty.value !== "all") {
    filtered = filtered.filter(
      (payment) => payment.property.id === selectedProperty.value
    );
  }

  if (selectedStatus.value !== "all") {
    filtered = filtered.filter(
      (payment) => payment.status === selectedStatus.value
    );
  }

  if (dateFrom.value) {
    const fromDate = new Date(dateFrom.value);
    filtered = filtered.filter((payment) => payment.dueDate >= fromDate);
  }

  if (dateTo.value) {
    const toDate = new Date(dateTo.value);
    filtered = filtered.filter((payment) => payment.dueDate <= toDate);
  }

  return filtered.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
});

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * parseInt(pageSize.value);
  const end = start + parseInt(pageSize.value);
  return filteredPayments.value.slice(start, end);
});

const monthlyCollected = computed(() => {
  const thisMonth = new Date();
  return payments.value
    .filter(
      (p) =>
        p.status === "PAID" &&
        p.paidDate?.getMonth() === thisMonth.getMonth() &&
        p.paidDate?.getFullYear() === thisMonth.getFullYear()
    )
    .reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
});

const pendingPayments = computed(() => {
  return payments.value
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);
});

const overduePayments = computed(() => {
  const today = new Date();
  return payments.value
    .filter((p) => p.status !== "PAID" && p.dueDate < today)
    .reduce((sum, p) => sum + p.amount, 0);
});

const pendingPaymentsCount = computed(() => {
  return payments.value.filter((p) => p.status === "PENDING").length;
});

const overduePaymentsCount = computed(() => {
  const today = new Date();
  return payments.value.filter((p) => p.status !== "PAID" && p.dueDate < today)
    .length;
});

const averagePayment = computed(() => {
  const paidPayments = payments.value.filter((p) => p.status === "PAID");
  if (paidPayments.length === 0) return 0;
  return (
    paidPayments.reduce((sum, p) => sum + p.amount, 0) / paidPayments.length
  );
});

const monthlyCollectedPercentage = computed(() => 15); // Mock percentage

const canAddPayment = computed(() => {
  return (
    newPayment.value.tenantId &&
    newPayment.value.amount &&
    newPayment.value.dueDate &&
    newPayment.value.description
  );
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
    month: "short",
    day: "numeric",
  }).format(date);
};

const isOverdue = (payment: any) => {
  const today = new Date();
  return payment.status !== "PAID" && payment.dueDate < today;
};

const getDaysOverdue = (payment: any) => {
  const today = new Date();
  const diffTime = today.getTime() - payment.dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PAID: "Ödendi",
    PENDING: "Beklemede",
    OVERDUE: "Gecikmiş",
    PARTIAL: "Kısmi Ödendi",
  };
  return labels[status] || status;
};

const getPaymentStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    PAID: "default",
    PENDING: "secondary",
    OVERDUE: "destructive",
    PARTIAL: "outline",
  };
  return variants[status] || "default";
};

const getTenantInitials = (tenant: any) => {
  return tenant.name
    .split(" ")
    .map((n: string) => n.charAt(0))
    .join("")
    .toUpperCase();
};

// Actions
const clearFilters = () => {
  selectedTenant.value = "all";
  selectedProperty.value = "all";
  selectedStatus.value = "all";
  dateFrom.value = "";
  dateTo.value = "";
  currentPage.value = 1;
};

const viewPaymentDetails = (payment: any) => {
  navigateTo(`/finance/payments/${payment.id}`);
};

const markAsPaid = async (payment: any) => {
  payment.status = "PAID";
  payment.paidDate = new Date();
  console.log("Marked as paid:", payment.id);
};

const editPayment = (payment: any) => {
  // TODO: Implement payment editing
  console.log("Editing payment:", payment.id);
};

const sendReminder = (payment: any) => {
  // TODO: Implement reminder sending
  console.log("Sending reminder for payment:", payment.id);
};

const downloadReceipt = (payment: any) => {
  // TODO: Implement receipt download
  console.log("Downloading receipt for payment:", payment.id);
};

const deletePayment = async (payment: any) => {
  if (confirm(`Bu ödeme kaydını silmek istediğinize emin misiniz?`)) {
    const index = payments.value.findIndex((p) => p.id === payment.id);
    if (index !== -1) {
      payments.value.splice(index, 1);
    }
    console.log("Deleted payment:", payment.id);
  }
};

const addPayment = async () => {
  const tenant = tenants.value.find((t) => t.id === newPayment.value.tenantId);
  const property = properties.value.find((p) => p.id === "1"); // Mock property assignment

  const payment = {
    id: Date.now().toString(),
    tenant: {
      id: tenant?.id || "",
      name: tenant?.name || "",
      phone: "+90 5XX XXX XXXX",
      avatar: "/avatars/default.png",
    },
    property: {
      id: property?.id || "",
      name: property?.name || "",
      address: "Mock Address",
    },
    amount: parseInt(newPayment.value.amount),
    lateFee: 0,
    dueDate: new Date(newPayment.value.dueDate),
    paidDate: newPayment.value.paidDate
      ? new Date(newPayment.value.paidDate)
      : null,
    status: newPayment.value.status,
    paymentMethod: newPayment.value.paymentMethod,
    description: newPayment.value.description,
    notes: newPayment.value.notes,
  };

  payments.value.unshift(payment);

  // Reset form
  newPayment.value = {
    tenantId: "",
    amount: "",
    dueDate: "",
    paidDate: "",
    paymentMethod: "",
    status: "PAID",
    description: "",
    notes: "",
  };

  showAddPayment.value = false;
  console.log("Added payment:", payment.id);
};

const exportPayments = () => {
  // TODO: Implement payments export
  console.log("Exporting payments...");
};

// Check permissions
const userStore = useUserStore();
const hasPaymentAccess = ["ADMIN", "MANAGER", "ACCOUNTANT"].includes(
  userStore.user?.role || ""
);

if (!hasPaymentAccess) {
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
