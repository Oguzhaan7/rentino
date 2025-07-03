<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Bakım Raporları</h1>
        <p class="text-muted-foreground">
          Bakım talepleri ve servis performans analizi
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
        <div class="grid gap-4 md:grid-cols-5">
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
            <Label>Durum</Label>
            <Select v-model="filters.status">
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Bekliyor</SelectItem>
                <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="cancelled">İptal Edildi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Kategori</Label>
            <Select v-model="filters.category">
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                <SelectItem value="plumbing">Tesisatçı</SelectItem>
                <SelectItem value="electrical">Elektrikçi</SelectItem>
                <SelectItem value="hvac">Klima/Kalorifer</SelectItem>
                <SelectItem value="general">Genel Bakım</SelectItem>
                <SelectItem value="cleaning">Temizlik</SelectItem>
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
          <CardTitle class="text-sm font-medium">Toplam Talepler</CardTitle>
          <Wrench class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.totalRequests }}</div>
          <p class="text-xs text-muted-foreground">
            <span
              :class="
                summary.requestChange >= 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ summary.requestChange >= 0 ? "+" : ""
              }}{{ summary.requestChange }}%
            </span>
            önceki dönemden
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Tamamlanma Oranı</CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.completionRate }}%</div>
          <p class="text-xs text-muted-foreground">
            {{ summary.completedRequests }}/{{
              summary.totalRequests
            }}
            tamamlandı
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Ortalama Süre</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.averageTime }}</div>
          <p class="text-xs text-muted-foreground">gün ortalama tamamlama</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Toplam Maliyet</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ₺{{ summary.totalCost.toLocaleString() }}
          </div>
          <p class="text-xs text-muted-foreground">Bu dönem bakım maliyeti</p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts Section -->
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Aylık Bakım Talepleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="h-[300px] flex items-center justify-center text-muted-foreground"
          >
            <BarChart3 class="h-8 w-8 mr-2" />
            Aylık talep grafiği burada görüntülenecek
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kategori Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="h-[300px] flex items-center justify-center text-muted-foreground"
          >
            <PieChart class="h-8 w-8 mr-2" />
            Kategori dağılımı grafiği burada görüntülenecek
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Status Overview -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Bekleyen Talepler</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-yellow-600">
            {{ statusCounts.pending }}
          </div>
          <div class="space-y-1 mt-2">
            <div
              v-for="item in pendingBreakdown"
              :key="item.category"
              class="flex justify-between text-xs"
            >
              <span>{{ item.category }}</span>
              <span class="font-medium">{{ item.count }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Devam Eden</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">
            {{ statusCounts.inProgress }}
          </div>
          <div class="space-y-1 mt-2">
            <div
              v-for="item in inProgressBreakdown"
              :key="item.category"
              class="flex justify-between text-xs"
            >
              <span>{{ item.category }}</span>
              <span class="font-medium">{{ item.count }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Tamamlanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ statusCounts.completed }}
          </div>
          <div class="space-y-1 mt-2">
            <div
              v-for="item in completedBreakdown"
              :key="item.category"
              class="flex justify-between text-xs"
            >
              <span>{{ item.category }}</span>
              <span class="font-medium">{{ item.count }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">İptal Edilen</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">
            {{ statusCounts.cancelled }}
          </div>
          <div class="space-y-1 mt-2">
            <div
              v-for="item in cancelledBreakdown"
              :key="item.category"
              class="flex justify-between text-xs"
            >
              <span>{{ item.category }}</span>
              <span class="font-medium">{{ item.count }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Maintenance Requests Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Bakım Talepleri Detayları</CardTitle>
          <div class="flex items-center space-x-2">
            <Label>Görünüm:</Label>
            <Select v-model="viewMode">
              <SelectTrigger class="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="urgent">Acil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Talep No</TableHead>
                <TableHead>Mülk/Daire</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Teknisyen</TableHead>
                <TableHead>Maliyet</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead class="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="request in maintenanceRequests"
                :key="request.id"
              >
                <TableCell class="font-medium">#{{ request.id }}</TableCell>
                <TableCell>
                  <div>
                    <p class="font-medium">{{ request.propertyName }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ request.unitNumber }}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{{ request.category }}</Badge>
                </TableCell>
                <TableCell class="max-w-[200px] truncate">{{
                  request.description
                }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(request.status)">
                    {{ request.status }}
                  </Badge>
                </TableCell>
                <TableCell>{{ request.technician || "-" }}</TableCell>
                <TableCell>{{
                  request.cost ? `₺${request.cost.toLocaleString()}` : "-"
                }}</TableCell>
                <TableCell>{{ formatDate(request.createdAt) }}</TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" class="h-8 w-8 p-0">
                        <span class="sr-only">Menüyü aç</span>
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="viewRequestDetails(request)">
                        <Eye class="mr-2 h-4 w-4" />
                        Detayları Gör
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        v-if="request.status === 'Bekliyor'"
                        @click="assignTechnician(request)"
                      >
                        <UserPlus class="mr-2 h-4 w-4" />
                        Teknisyen Ata
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        v-if="request.status === 'Devam Ediyor'"
                        @click="markCompleted(request)"
                      >
                        <CheckCircle class="mr-2 h-4 w-4" />
                        Tamamlandı İşaretle
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="downloadWorkOrder(request)">
                        <Download class="mr-2 h-4 w-4" />
                        İş Emri İndir
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

    <!-- Technician Performance -->
    <Card>
      <CardHeader>
        <CardTitle>Teknisyen Performansı</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teknisyen</TableHead>
                <TableHead>Toplam İş</TableHead>
                <TableHead>Tamamlanan</TableHead>
                <TableHead>Ortalama Süre</TableHead>
                <TableHead>Müşteri Puanı</TableHead>
                <TableHead>Bu Ay Maliyet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="technician in technicianPerformance"
                :key="technician.id"
              >
                <TableCell class="font-medium">{{ technician.name }}</TableCell>
                <TableCell>{{ technician.totalJobs }}</TableCell>
                <TableCell>
                  <div class="flex items-center space-x-2">
                    <span>{{ technician.completedJobs }}</span>
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-green-600 h-2 rounded-full"
                        :style="{
                          width: `${
                            (technician.completedJobs / technician.totalJobs) *
                            100
                          }%`,
                        }"
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>{{ technician.averageTime }} gün</TableCell>
                <TableCell>
                  <div class="flex items-center">
                    <Star class="h-4 w-4 text-yellow-400 mr-1" />
                    {{ technician.rating }}
                  </div>
                </TableCell>
                <TableCell
                  >₺{{ technician.monthlyCost.toLocaleString() }}</TableCell
                >
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  FileText,
  Download,
  Search,
  Wrench,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  Eye,
  UserPlus,
  MoreHorizontal,
  Star,
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

// Role-based access control
const userStore = useUserStore();

// Ensure user has permission to view maintenance reports
if (
  !["ADMIN", "PROPERTY_OWNER", "MANAGER"].includes(userStore.user?.role || "")
) {
  throw createError({
    statusCode: 403,
    statusMessage: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
  });
}

// Component state
const filters = ref({
  dateRange: "this-month",
  status: "all",
  category: "all",
  property: "all",
});

const viewMode = ref("all");

// Mock data - replace with real API calls
const properties = ref([
  { id: "1", name: "Merkez Plaza" },
  { id: "2", name: "Yeşil Apartmanı" },
  { id: "3", name: "Modern Residans" },
]);

const summary = ref({
  totalRequests: 45,
  requestChange: 12,
  completionRate: 87,
  completedRequests: 39,
  averageTime: 3.2,
  totalCost: 85000,
});

const statusCounts = ref({
  pending: 8,
  inProgress: 5,
  completed: 28,
  cancelled: 4,
});

const pendingBreakdown = ref([
  { category: "Tesisatçı", count: 3 },
  { category: "Elektrikçi", count: 2 },
  { category: "Genel", count: 3 },
]);

const inProgressBreakdown = ref([
  { category: "Klima", count: 2 },
  { category: "Tesisatçı", count: 2 },
  { category: "Elektrikçi", count: 1 },
]);

const completedBreakdown = ref([
  { category: "Genel", count: 12 },
  { category: "Tesisatçı", count: 8 },
  { category: "Elektrikçi", count: 5 },
  { category: "Temizlik", count: 3 },
]);

const cancelledBreakdown = ref([
  { category: "Genel", count: 2 },
  { category: "Tesisatçı", count: 1 },
  { category: "Elektrikçi", count: 1 },
]);

const maintenanceRequests = ref([
  {
    id: 1001,
    propertyName: "Merkez Plaza",
    unitNumber: "A-101",
    category: "Tesisatçı",
    description: "Mutfak lavabosunda sızıntı var",
    status: "Tamamlandı",
    technician: "Mehmet Kaya",
    cost: 250,
    createdAt: new Date("2024-11-01"),
  },
  {
    id: 1002,
    propertyName: "Yeşil Apartmanı",
    unitNumber: "B-205",
    category: "Elektrikçi",
    description: "Salon prizinde elektrik yok",
    status: "Devam Ediyor",
    technician: "Ali Demir",
    cost: null,
    createdAt: new Date("2024-11-03"),
  },
  {
    id: 1003,
    propertyName: "Modern Residans",
    unitNumber: "C-302",
    category: "Klima",
    description: "Klima çalışmıyor, soğutmuyor",
    status: "Bekliyor",
    technician: null,
    cost: null,
    createdAt: new Date("2024-11-05"),
  },
]);

const technicianPerformance = ref([
  {
    id: 1,
    name: "Mehmet Kaya",
    totalJobs: 15,
    completedJobs: 14,
    averageTime: 2.8,
    rating: 4.7,
    monthlyCost: 12000,
  },
  {
    id: 2,
    name: "Ali Demir",
    totalJobs: 12,
    completedJobs: 10,
    averageTime: 3.5,
    rating: 4.3,
    monthlyCost: 9500,
  },
  {
    id: 3,
    name: "Fatma Özkan",
    totalJobs: 8,
    completedJobs: 8,
    averageTime: 2.1,
    rating: 4.9,
    monthlyCost: 7800,
  },
]);

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Tamamlandı":
      return "success";
    case "Devam Ediyor":
      return "default";
    case "Bekliyor":
      return "secondary";
    case "İptal Edildi":
      return "destructive";
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
  // Implementation for generating maintenance report
  console.log("Generating maintenance report...");
};

const exportData = () => {
  // Implementation for exporting data to Excel
  console.log("Exporting maintenance data to Excel...");
};

const viewRequestDetails = (request: any) => {
  // Implementation for viewing request details
  console.log("Viewing request details:", request);
};

const assignTechnician = (request: any) => {
  // Implementation for assigning technician
  console.log("Assigning technician to request:", request.id);
};

const markCompleted = (request: any) => {
  // Implementation for marking request as completed
  console.log("Marking request as completed:", request.id);
};

const downloadWorkOrder = (request: any) => {
  // Implementation for downloading work order
  console.log("Downloading work order for request:", request.id);
};

// Page metadata
definePageMeta({
  title: "Bakım Raporları",
  middleware: "auth",
});
</script>
