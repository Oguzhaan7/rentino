<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Gider Yönetimi</h1>
        <p class="text-muted-foreground">
          Genel giderler ve finansal harcamalar
        </p>
      </div>
      <div class="flex gap-2">
        <Button class="gap-2" @click="showAddExpense = true">
          <Plus class="h-4 w-4" />
          Gider Ekle
        </Button>
        <Button variant="outline" class="gap-2" @click="exportExpenses">
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
          <CardTitle class="text-sm font-medium">Toplam Giderler</CardTitle>
          <Calculator class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">
            {{ formatCurrency(totalExpenses) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ expenses.length }} gider
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Bu Ay</CardTitle>
          <Calendar class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">
            {{ formatCurrency(monthlyExpenses) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ monthlyExpensesCount }} gider
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Ortalama Gider</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatCurrency(averageExpense) }}
          </div>
          <p class="text-xs text-muted-foreground">Son 6 ay ortalaması</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">En Yüksek Kategori</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ topExpenseCategory.name }}</div>
          <p class="text-xs text-muted-foreground">
            {{ formatCurrency(topExpenseCategory.amount) }}
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
            <Label html-for="category-filter">Kategori</Label>
            <Select v-model="selectedCategory">
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                <SelectItem value="MAINTENANCE">Bakım & Onarım</SelectItem>
                <SelectItem value="UTILITIES">Faturalar</SelectItem>
                <SelectItem value="INSURANCE">Sigorta</SelectItem>
                <SelectItem value="TAX">Vergiler</SelectItem>
                <SelectItem value="MARKETING">Pazarlama</SelectItem>
                <SelectItem value="LEGAL">Hukuki</SelectItem>
                <SelectItem value="OFFICE">Ofis Giderleri</SelectItem>
                <SelectItem value="OTHER">Diğer</SelectItem>
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
                <SelectItem value="general">Genel Giderler</SelectItem>
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
            <Label html-for="payment-status">Ödeme Durumu</Label>
            <Select v-model="selectedPaymentStatus">
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="PAID">Ödendi</SelectItem>
                <SelectItem value="PENDING">Beklemede</SelectItem>
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

    <!-- Expenses Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Gider Listesi</CardTitle>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">
              {{ filteredExpenses.length }} gider
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
                <th class="text-left p-3">Açıklama</th>
                <th class="text-left p-3">Kategori</th>
                <th class="text-left p-3">Mülk</th>
                <th class="text-left p-3">Tutar</th>
                <th class="text-left p-3">Tarih</th>
                <th class="text-left p-3">Fatura No</th>
                <th class="text-left p-3">Durum</th>
                <th class="text-left p-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="expense in paginatedExpenses"
                :key="expense.id"
                class="border-b hover:bg-muted/50"
              >
                <td class="p-3">
                  <div class="font-medium">{{ expense.title }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ expense.description }}
                  </div>
                </td>
                <td class="p-3">
                  <Badge variant="outline">{{
                    getCategoryLabel(expense.category)
                  }}</Badge>
                </td>
                <td class="p-3">
                  <div v-if="expense.property" class="font-medium">
                    {{ expense.property.name }}
                  </div>
                  <div v-else class="text-muted-foreground">Genel Gider</div>
                </td>
                <td class="p-3">
                  <div class="font-bold text-red-600">
                    {{ formatCurrency(expense.amount) }}
                  </div>
                  <div
                    v-if="expense.taxAmount"
                    class="text-sm text-muted-foreground"
                  >
                    +{{ formatCurrency(expense.taxAmount) }} KDV
                  </div>
                </td>
                <td class="p-3">
                  <div class="text-sm">
                    {{ formatDate(expense.expenseDate) }}
                  </div>
                </td>
                <td class="p-3">
                  <div v-if="expense.invoiceNumber" class="text-sm">
                    {{ expense.invoiceNumber }}
                  </div>
                  <div v-else class="text-sm text-muted-foreground">-</div>
                </td>
                <td class="p-3">
                  <Badge :variant="expense.isPaid ? 'default' : 'secondary'">
                    {{ expense.isPaid ? "Ödendi" : "Beklemede" }}
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
                        <DropdownMenuItem @click="viewExpenseDetails(expense)">
                          <Eye class="mr-2 h-4 w-4" />
                          Detayları Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="editExpense(expense)">
                          <Edit class="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          v-if="expense.invoiceNumber"
                          @click="downloadInvoice(expense)"
                        >
                          <Download class="mr-2 h-4 w-4" />
                          Fatura İndir
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          v-if="!expense.isPaid"
                          @click="markAsPaid(expense)"
                        >
                          <CheckCircle class="mr-2 h-4 w-4" />
                          Ödendi İşaretle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          class="text-red-600"
                          @click="deleteExpense(expense)"
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
                filteredExpenses.length
              )
            }}
            / {{ filteredExpenses.length }}
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

    <!-- Add Expense Dialog -->
    <Dialog v-model:open="showAddExpense">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Gider Ekle</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="addExpense">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label html-for="title">Başlık *</Label>
              <Input
                v-model="newExpense.title"
                placeholder="Gider başlığı"
                required
              />
            </div>

            <div>
              <Label html-for="category">Kategori *</Label>
              <Select v-model="newExpense.category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAINTENANCE">Bakım & Onarım</SelectItem>
                  <SelectItem value="UTILITIES">Faturalar</SelectItem>
                  <SelectItem value="INSURANCE">Sigorta</SelectItem>
                  <SelectItem value="TAX">Vergiler</SelectItem>
                  <SelectItem value="MARKETING">Pazarlama</SelectItem>
                  <SelectItem value="LEGAL">Hukuki</SelectItem>
                  <SelectItem value="OFFICE">Ofis Giderleri</SelectItem>
                  <SelectItem value="OTHER">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label html-for="amount">Tutar *</Label>
              <Input
                v-model="newExpense.amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label html-for="expense-date">Gider Tarihi *</Label>
              <Input v-model="newExpense.expenseDate" type="date" required />
            </div>

            <div>
              <Label html-for="property">Mülk</Label>
              <Select v-model="newExpense.propertyId">
                <SelectTrigger>
                  <SelectValue placeholder="Mülk seçin (isteğe bağlı)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Genel Gider</SelectItem>
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
              <Label html-for="invoice-number">Fatura No</Label>
              <Input
                v-model="newExpense.invoiceNumber"
                placeholder="Fatura numarası"
              />
            </div>

            <div>
              <Label html-for="tax-amount">KDV Tutarı</Label>
              <Input
                v-model="newExpense.taxAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div class="flex items-center space-x-2">
              <Checkbox id="is-paid" v-model="newExpense.isPaid" />
              <Label html-for="is-paid">Ödendi</Label>
            </div>
          </div>

          <div>
            <Label html-for="description">Açıklama</Label>
            <Textarea
              v-model="newExpense.description"
              placeholder="Gider açıklaması..."
              rows="3"
            />
          </div>

          <div>
            <Label html-for="notes">Notlar</Label>
            <Textarea
              v-model="newExpense.notes"
              placeholder="İç notlar..."
              rows="2"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              @click="showAddExpense = false"
            >
              İptal
            </Button>
            <Button type="submit" class="gap-2">
              <Plus class="h-4 w-4" />
              Gider Ekle
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
  Calculator,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Eye,
  Edit,
  Trash,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

// Check permissions
const userStore = useUserStore();
const hasExpenseAccess = ["ADMIN", "PROPERTY_OWNER", "ACCOUNTANT"].includes(
  userStore.user?.role || ""
);

if (!hasExpenseAccess) {
  throw createError({
    statusCode: 403,
    statusMessage: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
  });
}

// Reactive data
const showAddExpense = ref(false);
const selectedCategory = ref("all");
const selectedProperty = ref("all");
const selectedPaymentStatus = ref("all");
const dateFrom = ref("");
const dateTo = ref("");
const pageSize = ref("25");
const currentPage = ref(1);

const newExpense = ref({
  title: "",
  category: "",
  amount: "",
  expenseDate: "",
  propertyId: "",
  invoiceNumber: "",
  taxAmount: "",
  isPaid: false,
  description: "",
  notes: "",
});

// Mock data
const properties = ref([
  { id: "1", name: "Merkez Plaza A1", address: "Kadıköy, İstanbul" },
  { id: "2", name: "Güneş Residence B2", address: "Beşiktaş, İstanbul" },
  { id: "3", name: "Yıldız Apartmanı C3", address: "Şişli, İstanbul" },
]);

const expenses = ref([
  {
    id: "1",
    title: "Asansör Bakımı",
    description: "Aylık rutin asansör bakım hizmeti",
    category: "MAINTENANCE",
    amount: 1500,
    taxAmount: 270,
    expenseDate: new Date("2024-01-15"),
    property: { id: "1", name: "Merkez Plaza A1" },
    invoiceNumber: "BAK-2024-001",
    isPaid: true,
    paidAt: new Date("2024-01-20"),
    notes: "Zamanında ödendi",
  },
  {
    id: "2",
    title: "Elektrik Faturası",
    description: "Ocak ayı elektrik tüketimi",
    category: "UTILITIES",
    amount: 850,
    taxAmount: 153,
    expenseDate: new Date("2024-01-25"),
    property: { id: "2", name: "Güneş Residence B2" },
    invoiceNumber: "ELK-2024-002",
    isPaid: true,
    paidAt: new Date("2024-01-30"),
    notes: "",
  },
  {
    id: "3",
    title: "Sigorta Primi",
    description: "Yıllık bina sigortası",
    category: "INSURANCE",
    amount: 3200,
    taxAmount: 0,
    expenseDate: new Date("2024-01-01"),
    property: null,
    invoiceNumber: "SIG-2024-001",
    isPaid: false,
    paidAt: null,
    notes: "Ödeme beklemede",
  },
  {
    id: "4",
    title: "Temizlik Malzemesi",
    description: "Aylık temizlik malzemeleri",
    category: "MAINTENANCE",
    amount: 320,
    taxAmount: 57.6,
    expenseDate: new Date("2024-01-28"),
    property: { id: "3", name: "Yıldız Apartmanı C3" },
    invoiceNumber: "TEM-2024-003",
    isPaid: true,
    paidAt: new Date("2024-02-01"),
    notes: "",
  },
  {
    id: "5",
    title: "Emlak Vergisi",
    description: "2024 yılı emlak vergisi",
    category: "TAX",
    amount: 2100,
    taxAmount: 0,
    expenseDate: new Date("2024-01-05"),
    property: null,
    invoiceNumber: "VRG-2024-001",
    isPaid: false,
    paidAt: null,
    notes: "Vade tarihi: 31 Mayıs",
  },
]);

// Computed values
const filteredExpenses = computed(() => {
  let filtered = expenses.value;

  if (selectedCategory.value !== "all") {
    filtered = filtered.filter(
      (exp) => exp.category === selectedCategory.value
    );
  }

  if (selectedProperty.value !== "all") {
    if (selectedProperty.value === "general") {
      filtered = filtered.filter((exp) => !exp.property);
    } else {
      filtered = filtered.filter(
        (exp) => exp.property?.id === selectedProperty.value
      );
    }
  }

  if (selectedPaymentStatus.value !== "all") {
    const isPaid = selectedPaymentStatus.value === "PAID";
    filtered = filtered.filter((exp) => exp.isPaid === isPaid);
  }

  if (dateFrom.value) {
    filtered = filtered.filter(
      (exp) => new Date(exp.expenseDate) >= new Date(dateFrom.value)
    );
  }

  if (dateTo.value) {
    filtered = filtered.filter(
      (exp) => new Date(exp.expenseDate) <= new Date(dateTo.value)
    );
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredExpenses.value.length / parseInt(pageSize.value))
);

const paginatedExpenses = computed(() => {
  const start = (currentPage.value - 1) * parseInt(pageSize.value);
  const end = start + parseInt(pageSize.value);
  return filteredExpenses.value.slice(start, end);
});

// Statistics
const totalExpenses = computed(() =>
  expenses.value.reduce(
    (sum, exp) => sum + exp.amount + (exp.taxAmount || 0),
    0
  )
);

const monthlyExpenses = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return expenses.value
    .filter((exp) => {
      const expDate = new Date(exp.expenseDate);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, exp) => sum + exp.amount + (exp.taxAmount || 0), 0);
});

const monthlyExpensesCount = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return expenses.value.filter((exp) => {
    const expDate = new Date(exp.expenseDate);
    return (
      expDate.getMonth() === currentMonth &&
      expDate.getFullYear() === currentYear
    );
  }).length;
});

const averageExpense = computed(() => {
  if (expenses.value.length === 0) return 0;
  return totalExpenses.value / expenses.value.length;
});

const topExpenseCategory = computed(() => {
  const categoryTotals = expenses.value.reduce((acc, exp) => {
    const category = exp.category;
    if (!acc[category]) {
      acc[category] = { amount: 0, name: getCategoryLabel(category) };
    }
    acc[category].amount += exp.amount + (exp.taxAmount || 0);
    return acc;
  }, {} as Record<string, { amount: number; name: string }>);

  const top = Object.values(categoryTotals).reduce(
    (max, cat) => (cat.amount > max.amount ? cat : max),
    { amount: 0, name: "-" }
  );

  return top;
});

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

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    MAINTENANCE: "Bakım & Onarım",
    UTILITIES: "Faturalar",
    INSURANCE: "Sigorta",
    TAX: "Vergiler",
    MARKETING: "Pazarlama",
    LEGAL: "Hukuki",
    OFFICE: "Ofis Giderleri",
    OTHER: "Diğer",
  };
  return labels[category] || category;
};

// Actions
const applyFilters = () => {
  currentPage.value = 1;
  console.log("Applying filters...");
};

const clearFilters = () => {
  selectedCategory.value = "all";
  selectedProperty.value = "all";
  selectedPaymentStatus.value = "all";
  dateFrom.value = "";
  dateTo.value = "";
  currentPage.value = 1;
};

const viewExpenseDetails = (expense: any) => {
  navigateTo(`/finance/expenses/${expense.id}`);
};

const editExpense = (expense: any) => {
  // TODO: Implement expense editing
  console.log("Editing expense:", expense.id);
};

const downloadInvoice = (expense: any) => {
  // TODO: Implement invoice download
  console.log("Downloading invoice for expense:", expense.id);
};

const markAsPaid = async (expense: any) => {
  expense.isPaid = true;
  expense.paidAt = new Date();
  console.log("Marked as paid:", expense.id);
};

const deleteExpense = async (expense: any) => {
  // TODO: Implement expense deletion
  console.log("Deleting expense:", expense.id);
};

const addExpense = async () => {
  const selectedProperty = properties.value.find(
    (p) => p.id === newExpense.value.propertyId
  );

  const expense = {
    id: Date.now().toString(),
    title: newExpense.value.title,
    description: newExpense.value.description,
    category: newExpense.value.category,
    amount: parseFloat(newExpense.value.amount),
    taxAmount: newExpense.value.taxAmount
      ? parseFloat(newExpense.value.taxAmount)
      : 0,
    expenseDate: new Date(newExpense.value.expenseDate),
    property: selectedProperty || null,
    invoiceNumber: newExpense.value.invoiceNumber || "",
    isPaid: newExpense.value.isPaid,
    paidAt: newExpense.value.isPaid ? new Date() : null,
    notes: newExpense.value.notes,
  };

  expenses.value.unshift(expense);

  // Reset form
  newExpense.value = {
    title: "",
    category: "",
    amount: "",
    expenseDate: "",
    propertyId: "",
    invoiceNumber: "",
    taxAmount: "",
    isPaid: false,
    description: "",
    notes: "",
  };

  showAddExpense.value = false;
  console.log("Added expense:", expense.id);
};

const exportExpenses = () => {
  // TODO: Implement expenses export
  console.log("Exporting expenses...");
};
</script>
