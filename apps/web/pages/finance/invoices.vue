<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Fatura Yönetimi</h1>
        <p class="text-muted-foreground">Fatura oluşturma ve takip işlemleri</p>
      </div>
      <div class="flex gap-2">
        <Button class="gap-2" @click="showCreateInvoice = true">
          <Plus class="h-4 w-4" />
          Fatura Oluştur
        </Button>
        <Button variant="outline" class="gap-2" @click="exportInvoices">
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
          <CardTitle class="text-sm font-medium">Toplam Faturalar</CardTitle>
          <Receipt class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatCurrency(totalInvoices) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ invoices.length }} fatura
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Ödenen Faturalar</CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ formatCurrency(paidInvoices) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ paidInvoicesCount }} fatura
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Bekleyen Faturalar</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">
            {{ formatCurrency(pendingInvoices) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ pendingInvoicesCount }} fatura
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Geciken Faturalar</CardTitle>
          <AlertTriangle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">
            {{ formatCurrency(overdueInvoices) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ overdueInvoicesCount }} fatura
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
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="PAID">Ödendi</SelectItem>
                <SelectItem value="PENDING">Beklemede</SelectItem>
                <SelectItem value="OVERDUE">Gecikmiş</SelectItem>
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

        <div class="flex gap-2 mt-4">
          <Button class="gap-2" @click="applyFilters">
            <Filter class="h-4 w-4" />
            Filtrele
          </Button>
          <Button variant="outline" @click="clearFilters">
            Filtreleri Temizle
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Invoices Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Fatura Listesi</CardTitle>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">
              {{ filteredInvoices.length }} fatura
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
                <th class="text-left p-3">Fatura No</th>
                <th class="text-left p-3">Kiracı</th>
                <th class="text-left p-3">Mülk</th>
                <th class="text-left p-3">Tutar</th>
                <th class="text-left p-3">Düzenleme Tarihi</th>
                <th class="text-left p-3">Vade Tarihi</th>
                <th class="text-left p-3">Durum</th>
                <th class="text-left p-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="invoice in paginatedInvoices"
                :key="invoice.id"
                class="border-b hover:bg-muted/50"
              >
                <td class="p-3">
                  <div class="font-medium">{{ invoice.invoiceNumber }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ invoice.type }}
                  </div>
                </td>
                <td class="p-3">
                  <div class="flex items-center gap-3">
                    <Avatar class="h-8 w-8">
                      <AvatarImage :src="invoice.tenant.avatar" />
                      <AvatarFallback>{{
                        getTenantInitials(invoice.tenant)
                      }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div class="font-medium">{{ invoice.tenant.name }}</div>
                      <div class="text-sm text-muted-foreground">
                        {{ invoice.tenant.phone }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="p-3">
                  <div class="font-medium">{{ invoice.property.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ invoice.property.address }}
                  </div>
                </td>
                <td class="p-3">
                  <div class="font-bold">
                    {{ formatCurrency(invoice.amount) }}
                  </div>
                  <div
                    v-if="invoice.taxAmount"
                    class="text-sm text-muted-foreground"
                  >
                    +{{ formatCurrency(invoice.taxAmount) }} KDV
                  </div>
                </td>
                <td class="p-3">
                  <div class="text-sm">{{ formatDate(invoice.issueDate) }}</div>
                </td>
                <td class="p-3">
                  <div class="text-sm">{{ formatDate(invoice.dueDate) }}</div>
                  <div
                    v-if="invoice.status === 'OVERDUE'"
                    class="text-xs text-red-600"
                  >
                    {{ getDaysOverdue(invoice.dueDate) }} gün gecikmiş
                  </div>
                </td>
                <td class="p-3">
                  <Badge :variant="getInvoiceStatusVariant(invoice.status)">
                    {{ getInvoiceStatusLabel(invoice.status) }}
                  </Badge>
                </td>
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="sm">
                          <MoreVertical class="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="viewInvoiceDetails(invoice)">
                          <Eye class="mr-2 h-4 w-4" />
                          Detayları Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="editInvoice(invoice)">
                          <Edit class="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="downloadInvoicePDF(invoice)">
                          <Download class="mr-2 h-4 w-4" />
                          PDF İndir
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          v-if="invoice.status === 'PENDING'"
                          @click="markAsPaid(invoice)"
                        >
                          <CheckCircle class="mr-2 h-4 w-4" />
                          Ödendi İşaretle
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="sendInvoiceReminder(invoice)">
                          <Mail class="mr-2 h-4 w-4" />
                          Hatırlatma Gönder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          class="text-red-600"
                          @click="deleteInvoice(invoice)"
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
                filteredInvoices.length
              )
            }}
            / {{ filteredInvoices.length }}
          </div>
          <div class="flex gap-2">
            <Button
              :disabled="currentPage === 1"
              variant="outline"
              size="sm"
              @click="currentPage--"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <span class="px-3 py-1 text-sm"
              >{{ currentPage }} / {{ totalPages }}</span
            >
            <Button
              :disabled="currentPage === totalPages"
              variant="outline"
              size="sm"
              @click="currentPage++"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create Invoice Dialog -->
    <Dialog v-model:open="showCreateInvoice">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Fatura Oluştur</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="createInvoice">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label html-for="tenant">Kiracı *</Label>
              <Select v-model="newInvoice.tenantId" required>
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
              <Label html-for="property">Mülk *</Label>
              <Select v-model="newInvoice.propertyId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Mülk seçin" />
                </SelectTrigger>
                <SelectContent>
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
              <Label html-for="invoice-type">Fatura Türü *</Label>
              <Select v-model="newInvoice.type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Fatura türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENT">Kira</SelectItem>
                  <SelectItem value="DEPOSIT">Depozit</SelectItem>
                  <SelectItem value="UTILITIES">Aidat</SelectItem>
                  <SelectItem value="MAINTENANCE">Bakım</SelectItem>
                  <SelectItem value="OTHER">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label html-for="amount">Tutar *</Label>
              <Input
                v-model="newInvoice.amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label html-for="tax-rate">KDV Oranı (%)</Label>
              <Input
                v-model="newInvoice.taxRate"
                type="number"
                step="0.01"
                placeholder="18.00"
              />
            </div>

            <div>
              <Label html-for="issue-date">Düzenleme Tarihi *</Label>
              <Input v-model="newInvoice.issueDate" type="date" required />
            </div>

            <div>
              <Label html-for="due-date">Vade Tarihi *</Label>
              <Input v-model="newInvoice.dueDate" type="date" required />
            </div>

            <div>
              <Label html-for="period">Dönem</Label>
              <Input v-model="newInvoice.period" placeholder="Ocak 2024" />
            </div>
          </div>

          <div>
            <Label html-for="description">Açıklama</Label>
            <Textarea
              v-model="newInvoice.description"
              placeholder="Fatura açıklaması..."
              rows="3"
            />
          </div>

          <div>
            <Label html-for="notes">Notlar</Label>
            <Textarea
              v-model="newInvoice.notes"
              placeholder="İç notlar..."
              rows="2"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              @click="showCreateInvoice = false"
            >
              İptal
            </Button>
            <Button type="submit" class="gap-2">
              <Plus class="h-4 w-4" />
              Fatura Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Plus,
  Download,
  Receipt,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Eye,
  Edit,
  Mail,
  Trash,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

// Check permissions
const userStore = useUserStore();
const hasInvoiceAccess = ["ADMIN", "PROPERTY_OWNER", "ACCOUNTANT"].includes(
  userStore.user?.role || ""
);

if (!hasInvoiceAccess) {
  throw createError({
    statusCode: 403,
    statusMessage: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
  });
}

// Reactive data
const showCreateInvoice = ref(false);
const selectedTenant = ref("all");
const selectedProperty = ref("all");
const selectedStatus = ref("all");
const dateFrom = ref("");
const dateTo = ref("");
const pageSize = ref("25");
const currentPage = ref(1);

const newInvoice = ref({
  tenantId: "",
  propertyId: "",
  type: "",
  amount: "",
  taxRate: "18",
  issueDate: "",
  dueDate: "",
  period: "",
  description: "",
  notes: "",
});

// Mock data
const tenants = ref([
  {
    id: "1",
    name: "Ahmet Yılmaz",
    phone: "+90 532 123 4567",
    avatar: "/avatars/01.png",
  },
  {
    id: "2",
    name: "Fatma Demir",
    phone: "+90 538 987 6543",
    avatar: "/avatars/02.png",
  },
  {
    id: "3",
    name: "Mehmet Kaya",
    phone: "+90 535 456 7890",
    avatar: "/avatars/03.png",
  },
]);

const properties = ref([
  { id: "1", name: "Merkez Plaza A1", address: "Kadıköy, İstanbul" },
  { id: "2", name: "Güneş Residence B2", address: "Beşiktaş, İstanbul" },
  { id: "3", name: "Yıldız Apartmanı C3", address: "Şişli, İstanbul" },
]);

const invoices = ref([
  {
    id: "1",
    invoiceNumber: "FAT-2024-001",
    tenant: {
      id: "1",
      name: "Ahmet Yılmaz",
      phone: "+90 532 123 4567",
      avatar: "/avatars/01.png",
    },
    property: {
      id: "1",
      name: "Merkez Plaza A1",
      address: "Kadıköy, İstanbul",
    },
    type: "RENT",
    amount: 5000,
    taxAmount: 900,
    issueDate: new Date("2024-01-01"),
    dueDate: new Date("2024-01-15"),
    paidDate: new Date("2024-01-10"),
    status: "PAID",
    period: "Ocak 2024",
    description: "Aylık kira ödemesi",
    notes: "Zamanında ödendi",
  },
  {
    id: "2",
    invoiceNumber: "FAT-2024-002",
    tenant: {
      id: "2",
      name: "Fatma Demir",
      phone: "+90 538 987 6543",
      avatar: "/avatars/02.png",
    },
    property: {
      id: "2",
      name: "Güneş Residence B2",
      address: "Beşiktaş, İstanbul",
    },
    type: "UTILITIES",
    amount: 750,
    taxAmount: 135,
    issueDate: new Date("2024-02-01"),
    dueDate: new Date("2024-02-10"),
    paidDate: null,
    status: "PENDING",
    period: "Şubat 2024",
    description: "Aylık aidat ödemesi",
    notes: "",
  },
  {
    id: "3",
    invoiceNumber: "FAT-2024-003",
    tenant: {
      id: "3",
      name: "Mehmet Kaya",
      phone: "+90 535 456 7890",
      avatar: "/avatars/03.png",
    },
    property: {
      id: "3",
      name: "Yıldız Apartmanı C3",
      address: "Şişli, İstanbul",
    },
    type: "RENT",
    amount: 4500,
    taxAmount: 810,
    issueDate: new Date("2024-01-01"),
    dueDate: new Date("2024-01-05"),
    paidDate: null,
    status: "OVERDUE",
    period: "Ocak 2024",
    description: "Aylık kira ödemesi",
    notes: "Gecikmiş ödeme",
  },
]);

// Computed values
const filteredInvoices = computed(() => {
  let filtered = invoices.value;

  if (selectedTenant.value !== "all") {
    filtered = filtered.filter((inv) => inv.tenant.id === selectedTenant.value);
  }

  if (selectedProperty.value !== "all") {
    filtered = filtered.filter(
      (inv) => inv.property.id === selectedProperty.value
    );
  }

  if (selectedStatus.value !== "all") {
    filtered = filtered.filter((inv) => inv.status === selectedStatus.value);
  }

  if (dateFrom.value) {
    filtered = filtered.filter(
      (inv) => new Date(inv.issueDate) >= new Date(dateFrom.value)
    );
  }

  if (dateTo.value) {
    filtered = filtered.filter(
      (inv) => new Date(inv.issueDate) <= new Date(dateTo.value)
    );
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredInvoices.value.length / parseInt(pageSize.value))
);

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * parseInt(pageSize.value);
  const end = start + parseInt(pageSize.value);
  return filteredInvoices.value.slice(start, end);
});

// Statistics
const totalInvoices = computed(() =>
  invoices.value.reduce(
    (sum, inv) => sum + inv.amount + (inv.taxAmount || 0),
    0
  )
);
const paidInvoices = computed(() =>
  invoices.value
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount + (inv.taxAmount || 0), 0)
);
const pendingInvoices = computed(() =>
  invoices.value
    .filter((inv) => inv.status === "PENDING")
    .reduce((sum, inv) => sum + inv.amount + (inv.taxAmount || 0), 0)
);
const overdueInvoices = computed(() =>
  invoices.value
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.amount + (inv.taxAmount || 0), 0)
);

const paidInvoicesCount = computed(
  () => invoices.value.filter((inv) => inv.status === "PAID").length
);
const pendingInvoicesCount = computed(
  () => invoices.value.filter((inv) => inv.status === "PENDING").length
);
const overdueInvoicesCount = computed(
  () => invoices.value.filter((inv) => inv.status === "OVERDUE").length
);

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("tr-TR").format(new Date(date));
};

const getTenantInitials = (tenant: any) => {
  return tenant.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
};

const getDaysOverdue = (dueDate: Date) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const getInvoiceStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PAID: "Ödendi",
    PENDING: "Beklemede",
    OVERDUE: "Gecikmiş",
  };
  return labels[status] || status;
};

const getInvoiceStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    PAID: "default",
    PENDING: "secondary",
    OVERDUE: "destructive",
  };
  return variants[status] || "default";
};

// Actions
const applyFilters = () => {
  currentPage.value = 1;
  console.log("Applying filters...");
};

const clearFilters = () => {
  selectedTenant.value = "all";
  selectedProperty.value = "all";
  selectedStatus.value = "all";
  dateFrom.value = "";
  dateTo.value = "";
  currentPage.value = 1;
};

const viewInvoiceDetails = (invoice: any) => {
  navigateTo(`/finance/invoices/${invoice.id}`);
};

const editInvoice = (invoice: any) => {
  // TODO: Implement invoice editing
  console.log("Editing invoice:", invoice.id);
};

const downloadInvoicePDF = (invoice: any) => {
  // TODO: Implement PDF download
  console.log("Downloading PDF for invoice:", invoice.id);
};

const markAsPaid = async (invoice: any) => {
  invoice.status = "PAID";
  invoice.paidDate = new Date();
  console.log("Marked as paid:", invoice.id);
};

const sendInvoiceReminder = (invoice: any) => {
  // TODO: Implement reminder sending
  console.log("Sending reminder for invoice:", invoice.id);
};

const deleteInvoice = async (invoice: any) => {
  // TODO: Implement invoice deletion
  console.log("Deleting invoice:", invoice.id);
};

const createInvoice = async () => {
  const selectedTenantData = tenants.value.find(
    (t) => t.id === newInvoice.value.tenantId
  );
  const selectedPropertyData = properties.value.find(
    (p) => p.id === newInvoice.value.propertyId
  );

  if (!selectedTenantData || !selectedPropertyData) return;

  const taxAmount =
    parseFloat(newInvoice.value.amount) *
    (parseFloat(newInvoice.value.taxRate) / 100);

  const invoice = {
    id: Date.now().toString(),
    invoiceNumber: `FAT-2024-${String(invoices.value.length + 1).padStart(
      3,
      "0"
    )}`,
    tenant: selectedTenantData,
    property: selectedPropertyData,
    type: newInvoice.value.type,
    amount: parseFloat(newInvoice.value.amount),
    taxAmount: taxAmount,
    issueDate: new Date(newInvoice.value.issueDate),
    dueDate: new Date(newInvoice.value.dueDate),
    paidDate: null,
    status: "PENDING",
    period: newInvoice.value.period,
    description: newInvoice.value.description,
    notes: newInvoice.value.notes,
  };

  invoices.value.unshift(invoice);

  // Reset form
  newInvoice.value = {
    tenantId: "",
    propertyId: "",
    type: "",
    amount: "",
    taxRate: "18",
    issueDate: "",
    dueDate: "",
    period: "",
    description: "",
    notes: "",
  };

  showCreateInvoice.value = false;
  console.log("Created invoice:", invoice.id);
};

const exportInvoices = () => {
  // TODO: Implement invoices export
  console.log("Exporting invoices...");
};
</script>
