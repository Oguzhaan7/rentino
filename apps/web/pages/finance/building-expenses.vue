<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Bina Gider Yönetimi</h1>
        <p class="text-muted-foreground">
          Bina bazlı giderler ve aidat yönetimi
        </p>
      </div>
      <div class="flex gap-2">
        <Button class="gap-2" @click="showAddExpense = true">
          <Plus class="h-4 w-4" />
          Bina Gideri Ekle
        </Button>
        <Button class="gap-2" variant="outline" @click="showCreateDues = true">
          <Receipt class="h-4 w-4" />
          Aidat Oluştur
        </Button>
        <Button variant="outline" class="gap-2" @click="exportExpenses">
          <Download class="h-4 w-4" />
          Dışa Aktar
        </Button>
      </div>
    </div>

    <!-- Building Selection -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Bina Seçimi</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label html-for="building-select">Bina</Label>
            <Select
              v-model="selectedBuilding"
              @update:model-value="loadBuildingExpenses"
            >
              <SelectTrigger>
                <SelectValue placeholder="Bina seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Binalar</SelectItem>
                <SelectItem
                  v-for="building in buildings"
                  :key="building.id"
                  :value="building.id"
                >
                  {{ building.name }} - {{ building.address }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label html-for="year-select">Yıl</Label>
            <Select v-model="selectedYear">
              <SelectTrigger>
                <SelectValue placeholder="Yıl seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label html-for="expense-type">Gider Türü</Label>
            <Select v-model="selectedExpenseType">
              <SelectTrigger>
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="MAINTENANCE">Bakım</SelectItem>
                <SelectItem value="UTILITIES">Faturalar</SelectItem>
                <SelectItem value="CLEANING">Temizlik</SelectItem>
                <SelectItem value="SECURITY">Güvenlik</SelectItem>
                <SelectItem value="INSURANCE">Sigorta</SelectItem>
                <SelectItem value="REPAIR">Onarım</SelectItem>
                <SelectItem value="OTHER">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium"
            >Toplam Bina Giderleri</CardTitle
          >
          <Building2 class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">
            {{ formatCurrency(totalBuildingExpenses) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ buildingExpenses.length }} gider
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
          <CardTitle class="text-sm font-medium">Ödenen Giderler</CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ formatCurrency(paidExpenses) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ paidExpensesCount }} gider
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Bekleyen Giderler</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">
            {{ formatCurrency(pendingExpenses) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ pendingExpensesCount }} gider
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Building Expenses Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Bina Giderleri</CardTitle>
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
                <th class="text-left p-3">Başlık</th>
                <th class="text-left p-3">Bina</th>
                <th class="text-left p-3">Gider Türü</th>
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
                  <div class="font-medium">{{ expense.building.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ expense.building.address }}
                  </div>
                </td>
                <td class="p-3">
                  <Badge variant="outline">{{
                    getExpenseTypeLabel(expense.expenseType)
                  }}</Badge>
                </td>
                <td class="p-3">
                  <div class="font-bold text-red-600">
                    {{ formatCurrency(expense.amount) }}
                  </div>
                </td>
                <td class="p-3">
                  <div class="text-sm">
                    {{ formatDate(expense.expenseDate) }}
                  </div>
                  <div v-if="expense.paidAt" class="text-xs text-green-600">
                    Ödendi: {{ formatDate(expense.paidAt) }}
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

    <!-- Add Building Expense Dialog -->
    <Dialog v-model:open="showAddExpense">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Bina Gideri Ekle</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="addBuildingExpense">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label html-for="building">Bina *</Label>
              <Select v-model="newExpense.buildingId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Bina seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="building in buildings"
                    :key="building.id"
                    :value="building.id"
                  >
                    {{ building.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label html-for="expense-type">Gider Türü *</Label>
              <Select v-model="newExpense.expenseType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAINTENANCE">Bakım</SelectItem>
                  <SelectItem value="UTILITIES">Faturalar</SelectItem>
                  <SelectItem value="CLEANING">Temizlik</SelectItem>
                  <SelectItem value="SECURITY">Güvenlik</SelectItem>
                  <SelectItem value="INSURANCE">Sigorta</SelectItem>
                  <SelectItem value="REPAIR">Onarım</SelectItem>
                  <SelectItem value="OTHER">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label html-for="title">Başlık *</Label>
              <Input
                v-model="newExpense.title"
                placeholder="Gider başlığı"
                required
              />
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
              <Label html-for="invoice-number">Fatura No</Label>
              <Input
                v-model="newExpense.invoiceNumber"
                placeholder="Fatura numarası"
              />
            </div>

            <div>
              <Label html-for="paid-at">Ödeme Tarihi</Label>
              <Input v-model="newExpense.paidAt" type="date" />
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

    <!-- Create Dues Dialog -->
    <Dialog v-model:open="showCreateDues">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>Aidat Oluştur</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="createDues">
          <div>
            <Label html-for="dues-building">Bina *</Label>
            <Select v-model="newDues.buildingId" required>
              <SelectTrigger>
                <SelectValue placeholder="Bina seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="building in buildings"
                  :key="building.id"
                  :value="building.id"
                >
                  {{ building.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label html-for="period">Dönem *</Label>
              <Input
                v-model="newDues.period"
                placeholder="Ocak 2024"
                required
              />
            </div>

            <div>
              <Label html-for="dues-amount">Aidat Tutarı *</Label>
              <Input
                v-model="newDues.amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <Label html-for="due-date">Vade Tarihi *</Label>
            <Input v-model="newDues.dueDate" type="date" required />
          </div>

          <div>
            <Label html-for="dues-description">Açıklama</Label>
            <Textarea
              v-model="newDues.description"
              placeholder="Aidat açıklaması..."
              rows="3"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              @click="showCreateDues = false"
            >
              İptal
            </Button>
            <Button type="submit" class="gap-2">
              <Receipt class="h-4 w-4" />
              Aidat Oluştur
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
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Edit,
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
const hasBuildingExpenseAccess = ["ADMIN", "MANAGER", "ACCOUNTANT"].includes(
  userStore.user?.role || ""
);

if (!hasBuildingExpenseAccess) {
  throw createError({
    statusCode: 403,
    statusMessage: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
  });
}

// Reactive data
const showAddExpense = ref(false);
const showCreateDues = ref(false);
const selectedBuilding = ref("all");
const selectedYear = ref("2024");
const selectedExpenseType = ref("all");
const pageSize = ref("25");
const currentPage = ref(1);

const newExpense = ref({
  buildingId: "",
  title: "",
  description: "",
  amount: "",
  expenseDate: "",
  expenseType: "",
  invoiceNumber: "",
  paidAt: "",
  isPaid: false,
});

const newDues = ref({
  buildingId: "",
  period: "",
  amount: "",
  dueDate: "",
  description: "",
});

// Mock data
const buildings = ref([
  {
    id: "1",
    name: "Merkez Plaza",
    address: "Kadıköy, İstanbul",
    totalUnits: 24,
    occupiedUnits: 18,
  },
  {
    id: "2",
    name: "Güneş Residence",
    address: "Beşiktaş, İstanbul",
    totalUnits: 16,
    occupiedUnits: 14,
  },
  {
    id: "3",
    name: "Yıldız Apartmanı",
    address: "Şişli, İstanbul",
    totalUnits: 12,
    occupiedUnits: 10,
  },
]);

const buildingExpenses = ref([
  {
    id: "1",
    title: "Asansör Bakımı",
    description: "Aylık rutin asansör bakım hizmeti",
    building: {
      id: "1",
      name: "Merkez Plaza",
      address: "Kadıköy, İstanbul",
    },
    expenseType: "MAINTENANCE",
    amount: 1500,
    expenseDate: new Date("2024-01-15"),
    invoiceNumber: "ASN-2024-001",
    isPaid: true,
    paidAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    title: "Elektrik Faturası",
    description: "Ortak alan elektrik tüketimi",
    building: {
      id: "1",
      name: "Merkez Plaza",
      address: "Kadıköy, İstanbul",
    },
    expenseType: "UTILITIES",
    amount: 2400,
    expenseDate: new Date("2024-01-25"),
    invoiceNumber: "ELK-2024-002",
    isPaid: true,
    paidAt: new Date("2024-01-30"),
  },
  {
    id: "3",
    title: "Temizlik Hizmeti",
    description: "Aylık ortak alan temizlik hizmeti",
    building: {
      id: "2",
      name: "Güneş Residence",
      address: "Beşiktaş, İstanbul",
    },
    expenseType: "CLEANING",
    amount: 1800,
    expenseDate: new Date("2024-01-28"),
    invoiceNumber: "TEM-2024-003",
    isPaid: false,
    paidAt: null,
  },
  {
    id: "4",
    title: "Güvenlik Hizmeti",
    description: "Aylık güvenlik hizmeti",
    building: {
      id: "2",
      name: "Güneş Residence",
      address: "Beşiktaş, İstanbul",
    },
    expenseType: "SECURITY",
    amount: 3200,
    expenseDate: new Date("2024-02-01"),
    invoiceNumber: "GUV-2024-004",
    isPaid: false,
    paidAt: null,
  },
  {
    id: "5",
    title: "Çatı Onarımı",
    description: "Çatı su sızıntısı onarımı",
    building: {
      id: "3",
      name: "Yıldız Apartmanı",
      address: "Şişli, İstanbul",
    },
    expenseType: "REPAIR",
    amount: 5500,
    expenseDate: new Date("2024-01-20"),
    invoiceNumber: "ONR-2024-005",
    isPaid: true,
    paidAt: new Date("2024-01-25"),
  },
]);

// Computed values
const filteredExpenses = computed(() => {
  let filtered = buildingExpenses.value;

  if (selectedBuilding.value !== "all") {
    filtered = filtered.filter(
      (exp) => exp.building.id === selectedBuilding.value
    );
  }

  if (selectedExpenseType.value !== "all") {
    filtered = filtered.filter(
      (exp) => exp.expenseType === selectedExpenseType.value
    );
  }

  if (selectedYear.value !== "all") {
    filtered = filtered.filter(
      (exp) =>
        new Date(exp.expenseDate).getFullYear().toString() ===
        selectedYear.value
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
const totalBuildingExpenses = computed(() =>
  buildingExpenses.value.reduce((sum, exp) => sum + exp.amount, 0)
);

const monthlyExpenses = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return buildingExpenses.value
    .filter((exp) => {
      const expDate = new Date(exp.expenseDate);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, exp) => sum + exp.amount, 0);
});

const monthlyExpensesCount = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return buildingExpenses.value.filter((exp) => {
    const expDate = new Date(exp.expenseDate);
    return (
      expDate.getMonth() === currentMonth &&
      expDate.getFullYear() === currentYear
    );
  }).length;
});

const paidExpenses = computed(() =>
  buildingExpenses.value
    .filter((exp) => exp.isPaid)
    .reduce((sum, exp) => sum + exp.amount, 0)
);
const pendingExpenses = computed(() =>
  buildingExpenses.value
    .filter((exp) => !exp.isPaid)
    .reduce((sum, exp) => sum + exp.amount, 0)
);

const paidExpensesCount = computed(
  () => buildingExpenses.value.filter((exp) => exp.isPaid).length
);
const pendingExpensesCount = computed(
  () => buildingExpenses.value.filter((exp) => !exp.isPaid).length
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

const getExpenseTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    MAINTENANCE: "Bakım",
    UTILITIES: "Faturalar",
    CLEANING: "Temizlik",
    SECURITY: "Güvenlik",
    INSURANCE: "Sigorta",
    REPAIR: "Onarım",
    OTHER: "Diğer",
  };
  return labels[type] || type;
};

// Actions
const loadBuildingExpenses = () => {
  currentPage.value = 1;
  console.log("Loading expenses for building:", selectedBuilding.value);
};

const viewExpenseDetails = (expense: any) => {
  navigateTo(`/finance/building-expenses/${expense.id}`);
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

const addBuildingExpense = async () => {
  const selectedBuildingData = buildings.value.find(
    (b) => b.id === newExpense.value.buildingId
  );

  if (!selectedBuildingData) return;

  const expense = {
    id: Date.now().toString(),
    title: newExpense.value.title,
    description: newExpense.value.description,
    building: {
      id: selectedBuildingData.id,
      name: selectedBuildingData.name,
      address: selectedBuildingData.address,
    },
    expenseType: newExpense.value.expenseType,
    amount: parseFloat(newExpense.value.amount),
    expenseDate: new Date(newExpense.value.expenseDate),
    invoiceNumber: newExpense.value.invoiceNumber || "",
    isPaid: newExpense.value.isPaid,
    paidAt: newExpense.value.paidAt ? new Date(newExpense.value.paidAt) : null,
  };

  buildingExpenses.value.unshift(expense);

  // Reset form
  newExpense.value = {
    buildingId: "",
    title: "",
    description: "",
    amount: "",
    expenseDate: "",
    expenseType: "",
    invoiceNumber: "",
    paidAt: "",
    isPaid: false,
  };

  showAddExpense.value = false;
  console.log("Added building expense:", expense.id);
};

const createDues = async () => {
  const selectedBuildingData = buildings.value.find(
    (b) => b.id === newDues.value.buildingId
  );

  if (!selectedBuildingData) return;

  // TODO: Implement dues creation logic
  console.log("Creating dues for building:", newDues.value);

  // Reset form
  newDues.value = {
    buildingId: "",
    period: "",
    amount: "",
    dueDate: "",
    description: "",
  };

  showCreateDues.value = false;
};

const exportExpenses = () => {
  // TODO: Implement building expenses export
  console.log("Exporting building expenses...");
};
</script>
