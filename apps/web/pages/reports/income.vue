<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Gelir Raporları</h1>
        <p class="text-muted-foreground">
          Kira gelirleri ve mali performans analizi
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="generateReport">
          <FileText class="mr-2 h-4 w-4" />
          Rapor Oluştur
        </Button>
        <Button @click="exportData">
          <Download class="mr-2 h-4 w-4" />
          Excel'e Aktar
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <CardHeader>
        <CardTitle>Filtreleme Seçenekleri</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-4">
          <div class="space-y-2">
            <Label>Tarih Aralığı</Label>
            <Select v-model="filters.dateRange">
              <SelectTrigger>
                <SelectValue placeholder="Tarih seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">Bu Ay</SelectItem>
                <SelectItem value="last-month">Geçen Ay</SelectItem>
                <SelectItem value="this-quarter">Bu Çeyrek</SelectItem>
                <SelectItem value="this-year">Bu Yıl</SelectItem>
                <SelectItem value="custom">Özel Aralık</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Mülk</Label>
            <Select v-model="filters.property">
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

          <div class="space-y-2">
            <Label>Rapor Türü</Label>
            <Select v-model="filters.reportType">
              <SelectTrigger>
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Özet</SelectItem>
                <SelectItem value="detailed">Detaylı</SelectItem>
                <SelectItem value="comparison">Karşılaştırmalı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-end">
            <Button class="w-full" @click="applyFilters">
              <Search class="mr-2 h-4 w-4" />
              Filtrele
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Summary Cards -->
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
            ₺{{ summary.totalIncome.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">
            <span
              :class="
                summary.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ summary.incomeChange >= 0 ? "+" : ""
              }}{{ summary.incomeChange }}%
            </span>
            önceki dönemden
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Kira Tahsilatı</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ₺{{ summary.rentCollection.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ summary.collectionRate }}% tahsilat oranı
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
            ₺{{ summary.overduePayments.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ summary.overdueCount }} geciken ödeme
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Ortalama Kira</CardTitle>
          <BarChart3 class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ₺{{ summary.averageRent.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">Daire başına aylık</p>
        </CardContent>
      </Card>
    </div>

    <!-- Chart Section -->
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Aylık Gelir Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="h-[300px] flex items-center justify-center text-muted-foreground"
          >
            <TrendingUp class="h-8 w-8 mr-2" />
            Gelir trendi grafiği burada görüntülenecek
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gelir Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="h-[300px] flex items-center justify-center text-muted-foreground"
          >
            <PieChart class="h-8 w-8 mr-2" />
            Gelir dağılımı grafiği burada görüntülenecek
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Income Details Table -->
    <Card>
      <CardHeader>
        <CardTitle>Gelir Detayları</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mülk</TableHead>
                <TableHead>Daire</TableHead>
                <TableHead>Kiracı</TableHead>
                <TableHead>Aylık Kira</TableHead>
                <TableHead>Son Ödeme</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead class="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="income in incomeDetails" :key="income.id">
                <TableCell class="font-medium">{{
                  income.propertyName
                }}</TableCell>
                <TableCell>{{ income.unitNumber }}</TableCell>
                <TableCell>{{ income.tenantName }}</TableCell>
                <TableCell
                  >₺{{ income.monthlyRent.toLocaleString() }}</TableCell
                >
                <TableCell>{{ formatDate(income.lastPayment) }}</TableCell>
                <TableCell>
                  <Badge :variant="getPaymentStatusVariant(income.status)">
                    {{ income.status }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" class="h-8 w-8 p-0">
                        <span class="sr-only">Menüyü aç</span>
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="viewDetails(income)">
                        <Eye class="mr-2 h-4 w-4" />
                        Detayları Gör
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="sendReminder(income)">
                        <Mail class="mr-2 h-4 w-4" />
                        Hatırlatma Gönder
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="downloadReceipt(income)">
                        <Download class="mr-2 h-4 w-4" />
                        Makbuz İndir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Generate Report Modal -->
    <Dialog :open="showReportModal" @update:open="showReportModal = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gelir Raporu Oluştur</DialogTitle>
          <DialogDescription>
            Belirtilen kriterlere göre detaylı gelir raporu oluşturun
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Rapor Formatı</Label>
            <Select v-model="reportGeneration.format">
              <SelectTrigger>
                <SelectValue placeholder="Format seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="word">Word</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>İçerik Detayı</Label>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox v-model="reportGeneration.includeSummary" />
                <Label>Özet Bilgiler</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox v-model="reportGeneration.includeCharts" />
                <Label>Grafikler</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox v-model="reportGeneration.includeDetails" />
                <Label>Detay Tablolar</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showReportModal = false"
            >İptal</Button
          >
          <Button @click="generateDetailedReport">Rapor Oluştur</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  FileText,
  Download,
  Search,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  BarChart3,
  PieChart,
  Eye,
  Mail,
  MoreHorizontal,
} from "lucide-vue-next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Role-based access control
const userStore = useUserStore();

// Ensure user has permission to view income reports
if (
  !["ADMIN", "PROPERTY_OWNER", "MANAGER", "ACCOUNTANT"].includes(
    userStore.user?.role || ""
  )
) {
  throw createError({
    statusCode: 403,
    statusMessage: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
  });
}

// Filters
const filters = ref({
  dateRange: "this-month",
  property: "all",
  reportType: "summary",
});

// Modal state
const showReportModal = ref(false);

// Report generation options
const reportGeneration = ref({
  format: "pdf",
  includeSummary: true,
  includeCharts: true,
  includeDetails: false,
});

// Mock data - replace with real API calls
const properties = ref([
  { id: "1", name: "Merkez Plaza" },
  { id: "2", name: "Yeşil Apartmanı" },
  { id: "3", name: "Modern Residans" },
]);

const summary = ref({
  totalIncome: 524000,
  incomeChange: 8.5,
  rentCollection: 486000,
  collectionRate: 92.7,
  overduePayments: 38000,
  overdueCount: 5,
  averageRent: 4200,
});

const incomeDetails = ref([
  {
    id: 1,
    propertyName: "Merkez Plaza",
    unitNumber: "A-101",
    tenantName: "Ahmet Yılmaz",
    monthlyRent: 4500,
    lastPayment: new Date("2024-11-01"),
    status: "Ödendi",
  },
  {
    id: 2,
    propertyName: "Merkez Plaza",
    unitNumber: "A-102",
    tenantName: "Fatma Demir",
    monthlyRent: 4200,
    lastPayment: new Date("2024-10-28"),
    status: "Gecikmiş",
  },
  {
    id: 3,
    propertyName: "Yeşil Apartmanı",
    unitNumber: "B-201",
    tenantName: "Mehmet Kaya",
    monthlyRent: 3800,
    lastPayment: new Date("2024-11-05"),
    status: "Ödendi",
  },
  {
    id: 4,
    propertyName: "Modern Residans",
    unitNumber: "C-301",
    tenantName: "Ayşe Özkan",
    monthlyRent: 5200,
    lastPayment: new Date("2024-11-03"),
    status: "Ödendi",
  },
  {
    id: 5,
    propertyName: "Yeşil Apartmanı",
    unitNumber: "B-105",
    tenantName: "Ali Çelik",
    monthlyRent: 3600,
    lastPayment: new Date("2024-10-15"),
    status: "Gecikmiş",
  },
]);

const getPaymentStatusVariant = (status: string) => {
  switch (status) {
    case "Ödendi":
      return "success";
    case "Gecikmiş":
      return "destructive";
    case "Bekliyor":
      return "secondary";
    default:
      return "outline";
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const applyFilters = () => {
  // Implementation for applying filters
  console.log("Applying filters:", filters.value);
};

const generateReport = () => {
  showReportModal.value = true;
};

const generateDetailedReport = () => {
  // Implementation for generating detailed report
  console.log("Generating report with options:", reportGeneration.value);
  showReportModal.value = false;
};

const exportData = () => {
  // Implementation for exporting data to Excel
  console.log("Exporting data to Excel...");
};

const viewDetails = (income: any) => {
  // Implementation for viewing income details
  console.log("Viewing details for:", income);
};

const sendReminder = (income: any) => {
  // Implementation for sending payment reminder
  console.log("Sending reminder to:", income.tenantName);
};

const downloadReceipt = (income: any) => {
  // Implementation for downloading receipt
  console.log("Downloading receipt for:", income);
};

// Page metadata
definePageMeta({
  title: "Gelir Raporları",
  middleware: "auth",
});
</script>
