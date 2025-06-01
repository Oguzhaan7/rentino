<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Doluluk Raporları</h1>
        <p class="text-muted-foreground">
          Mülk doluluk oranları ve boşluk analizi
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
                <SelectItem value="current">Mevcut Durum</SelectItem>
                <SelectItem value="this-month">Bu Ay</SelectItem>
                <SelectItem value="this-quarter">Bu Çeyrek</SelectItem>
                <SelectItem value="this-year">Bu Yıl</SelectItem>
                <SelectItem value="comparison">Yıllık Karşılaştırma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Mülk Türü</Label>
            <Select v-model="filters.propertyType">
              <SelectTrigger>
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="apartment">Apartman</SelectItem>
                <SelectItem value="house">Ev</SelectItem>
                <SelectItem value="commercial">Ticari</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Bölge</Label>
            <Select v-model="filters.region">
              <SelectTrigger>
                <SelectValue placeholder="Bölge seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Bölgeler</SelectItem>
                <SelectItem value="center">Merkez</SelectItem>
                <SelectItem value="north">Kuzey</SelectItem>
                <SelectItem value="south">Güney</SelectItem>
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
          <CardTitle class="text-sm font-medium">Genel Doluluk</CardTitle>
          <PieChart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.overallOccupancy }}%</div>
          <p class="text-xs text-muted-foreground">
            {{ summary.occupiedUnits }}/{{ summary.totalUnits }} daire
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Boş Daireler</CardTitle>
          <Home class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.vacantUnits }}</div>
          <p class="text-xs text-muted-foreground">
            Ortalama {{ summary.averageVacantDays }} gün boş
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Yeni Kiracılar</CardTitle>
          <UserPlus class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.newTenants }}</div>
          <p class="text-xs text-muted-foreground">
            Bu ay {{ summary.moveIns }} giriş
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Çıkışlar</CardTitle>
          <UserMinus class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.moveOuts }}</div>
          <p class="text-xs text-muted-foreground">
            Bu ay {{ summary.expectedMoveOuts }} beklenen
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Chart Section -->
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Doluluk Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="h-[300px] flex items-center justify-center text-muted-foreground"
          >
            <TrendingUp class="h-8 w-8 mr-2" />
            Doluluk trendi grafiği burada görüntülenecek
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mülk Türü Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="h-[300px] flex items-center justify-center text-muted-foreground"
          >
            <PieChart class="h-8 w-8 mr-2" />
            Mülk türü dağılımı grafiği burada görüntülenecek
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Property Details Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Mülk Doluluk Detayları</CardTitle>
          <div class="flex items-center space-x-2">
            <Label>Görünüm:</Label>
            <Select v-model="viewMode">
              <SelectTrigger class="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Özet</SelectItem>
                <SelectItem value="detailed">Detaylı</SelectItem>
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
                <TableHead>Mülk Adı</TableHead>
                <TableHead>Toplam Daire</TableHead>
                <TableHead>Dolu</TableHead>
                <TableHead>Boş</TableHead>
                <TableHead>Doluluk Oranı</TableHead>
                <TableHead>Ortalama Kira</TableHead>
                <TableHead>Son Değişim</TableHead>
                <TableHead class="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="property in occupancyDetails" :key="property.id">
                <TableCell class="font-medium">
                  <div>
                    <p>{{ property.name }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ property.address }}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{{ property.totalUnits }}</TableCell>
                <TableCell>
                  <div class="flex items-center">
                    <span class="text-green-600 font-medium">{{
                      property.occupiedUnits
                    }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center">
                    <span class="text-red-600 font-medium">{{
                      property.vacantUnits
                    }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center space-x-2">
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-green-600 h-2 rounded-full"
                        :style="{ width: `${property.occupancyRate}%` }"
                      />
                    </div>
                    <span class="text-sm font-medium"
                      >{{ property.occupancyRate }}%</span
                    >
                  </div>
                </TableCell>
                <TableCell
                  >₺{{ property.averageRent.toLocaleString() }}</TableCell
                >
                <TableCell>
                  <Badge :variant="getChangeVariant(property.lastChange)">
                    {{ property.lastChange }}
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
                      <DropdownMenuItem @click="viewPropertyDetails(property)">
                        <Eye class="mr-2 h-4 w-4" />
                        Detayları Gör
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="viewUnits(property)">
                        <Building class="mr-2 h-4 w-4" />
                        Daire Listesi
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        @click="generatePropertyReport(property)"
                      >
                        <FileText class="mr-2 h-4 w-4" />
                        Mülk Raporu
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

    <!-- Unit Details Modal (if detailed view) -->
    <Dialog :open="showUnitsModal" @update:open="showUnitsModal = $event">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle
            >{{ selectedProperty?.name }} - Daire Detayları</DialogTitle
          >
          <DialogDescription>
            Mülkteki tüm dairelerin doluluk durumu
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent class="p-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">
                    {{ selectedProperty?.occupiedUnits }}
                  </div>
                  <p class="text-sm text-muted-foreground">Dolu Daireler</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="p-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-red-600">
                    {{ selectedProperty?.vacantUnits }}
                  </div>
                  <p class="text-sm text-muted-foreground">Boş Daireler</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="p-4">
                <div class="text-center">
                  <div class="text-2xl font-bold">
                    ₺{{ selectedProperty?.averageRent.toLocaleString() }}
                  </div>
                  <p class="text-sm text-muted-foreground">Ortalama Kira</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="p-4">
                <div class="text-center">
                  <div class="text-2xl font-bold">
                    {{ selectedProperty?.occupancyRate }}%
                  </div>
                  <p class="text-sm text-muted-foreground">Doluluk Oranı</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Daire No</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Kiracı</TableHead>
                  <TableHead>Kira</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead>Bitiş</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="unit in unitDetails" :key="unit.id">
                  <TableCell class="font-medium">{{ unit.number }}</TableCell>
                  <TableCell>
                    <Badge
                      :variant="
                        unit.status === 'Dolu' ? 'success' : 'secondary'
                      "
                    >
                      {{ unit.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ unit.tenant || "-" }}</TableCell>
                  <TableCell>{{
                    unit.rent ? `₺${unit.rent.toLocaleString()}` : "-"
                  }}</TableCell>
                  <TableCell>{{
                    unit.startDate ? formatDate(unit.startDate) : "-"
                  }}</TableCell>
                  <TableCell>{{
                    unit.endDate ? formatDate(unit.endDate) : "-"
                  }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showUnitsModal = false"
            >Kapat</Button
          >
          <Button @click="downloadUnitReport">Rapor İndir</Button>
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
  PieChart,
  Home,
  UserPlus,
  UserMinus,
  TrendingUp,
  Eye,
  Building,
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

// Role-based access control
const userStore = useUserStore();

// Ensure user has permission to view occupancy reports
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
  dateRange: "current",
  propertyType: "all",
  region: "all",
});

const viewMode = ref("summary");
const showUnitsModal = ref(false);
const selectedProperty = ref(null);

// Mock data - replace with real API calls
const summary = ref({
  overallOccupancy: 85,
  occupiedUnits: 34,
  totalUnits: 40,
  vacantUnits: 6,
  averageVacantDays: 15,
  newTenants: 3,
  moveIns: 4,
  moveOuts: 2,
  expectedMoveOuts: 1,
});

const occupancyDetails = ref([
  {
    id: 1,
    name: "Merkez Plaza",
    address: "Kızılay, Ankara",
    totalUnits: 20,
    occupiedUnits: 18,
    vacantUnits: 2,
    occupancyRate: 90,
    averageRent: 4200,
    lastChange: "Yeni Giriş",
  },
  {
    id: 2,
    name: "Yeşil Apartmanı",
    address: "Çankaya, Ankara",
    totalUnits: 12,
    occupiedUnits: 10,
    vacantUnits: 2,
    occupancyRate: 83,
    averageRent: 3800,
    lastChange: "Çıkış",
  },
  {
    id: 3,
    name: "Modern Residans",
    address: "Balgat, Ankara",
    totalUnits: 8,
    occupiedUnits: 6,
    vacantUnits: 2,
    occupancyRate: 75,
    averageRent: 5200,
    lastChange: "Değişiklik Yok",
  },
]);

const unitDetails = ref([
  {
    id: 1,
    number: "A-101",
    status: "Dolu",
    tenant: "Ahmet Yılmaz",
    rent: 4500,
    startDate: new Date("2023-01-15"),
    endDate: new Date("2024-01-15"),
  },
  {
    id: 2,
    number: "A-102",
    status: "Boş",
    tenant: null,
    rent: null,
    startDate: null,
    endDate: null,
  },
  // Add more units as needed
]);

const getChangeVariant = (change: string) => {
  switch (change) {
    case "Yeni Giriş":
      return "success";
    case "Çıkış":
      return "destructive";
    case "Değişiklik Yok":
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
  // Implementation for generating occupancy report
  console.log("Generating occupancy report...");
};

const exportData = () => {
  // Implementation for exporting data to Excel
  console.log("Exporting occupancy data to Excel...");
};

const viewPropertyDetails = (property: any) => {
  // Implementation for viewing property details
  console.log("Viewing property details:", property);
};

const viewUnits = (property: any) => {
  selectedProperty.value = property;
  showUnitsModal.value = true;
};

const generatePropertyReport = (property: any) => {
  // Implementation for generating property-specific report
  console.log("Generating property report for:", property.name);
};

const downloadUnitReport = () => {
  // Implementation for downloading unit report
  console.log("Downloading unit report for:", selectedProperty.value?.name);
  showUnitsModal.value = false;
};

// Page metadata
definePageMeta({
  title: "Doluluk Raporları",
  middleware: "auth",
});
</script>
