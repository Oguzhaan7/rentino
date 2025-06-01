<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Kiracı Yönetimi</h1>
        <p class="text-muted-foreground">
          Kiracıları ve kiralama bilgilerini yönetin
        </p>
      </div>
      <Button class="gap-2" @click="navigateTo('/tenants/create')">
        <Plus class="h-4 w-4" />
        Yeni Kiracı
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin" />
      <span class="ml-2">Kiracılar yükleniyor...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <AlertCircle class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">Hata</h3>
      <p class="text-muted-foreground mb-4">{{ error }}</p>
      <Button variant="outline" @click="loadData">
        <RefreshCw class="h-4 w-4 mr-2" />
        Tekrar Dene
      </Button>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium">Toplam Kiracı</CardTitle>
            <UserCheck class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ totalTenants }}</div>
            <p class="text-xs text-muted-foreground">
              +{{ newTenantsThisMonth }} bu ay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium">Aktif Kiracı</CardTitle>
            <CheckCircle class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ activeTenants }}</div>
            <p class="text-xs text-muted-foreground">
              %{{
                Math.round((activeTenants / totalTenants) * 100) || 0
              }}
              doluluk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium">Geciken Ödeme</CardTitle>
            <AlertTriangle class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-red-600">
              {{ latePayments }}
            </div>
            <p class="text-xs text-muted-foreground">Ödemesi geciken</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium">Sözleşme Bitiyor</CardTitle>
            <Calendar class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-orange-600">
              {{ expiringContracts }}
            </div>
            <p class="text-xs text-muted-foreground">30 gün içinde</p>
          </CardContent>
        </Card>
      </div>

      <!-- Filters and Search -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <Input
                v-model="searchQuery"
                placeholder="Kiracı ara..."
                class="w-full"
              />
            </div>
            <Select v-model="selectedStatus">
              <SelectTrigger class="w-[200px]">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="INACTIVE">Pasif</SelectItem>
                <SelectItem value="EXPIRED">Süresi Dolmuş</SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="selectedProperty">
              <SelectTrigger class="w-[200px]">
                <SelectValue placeholder="Mülk seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Mülkler</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <!-- Tenants Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="tenant in filteredTenants"
          :key="tenant.id"
          class="relative"
        >
          <CardHeader class="pb-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <Avatar class="h-12 w-12">
                  <AvatarImage :src="tenant.avatar || ''" />
                  <AvatarFallback>{{
                    getTenantInitials(tenant)
                  }}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle class="text-lg"
                    >{{ tenant.firstName }} {{ tenant.lastName }}</CardTitle
                  >
                  <p class="text-sm text-muted-foreground">
                    {{ tenant.email }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ tenant.phone || "Telefon yok" }}
                  </p>
                </div>
              </div>
              <Badge :variant="getStatusVariant(tenant.status)">
                {{ getStatusLabel(tenant.status) }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <!-- Property Info -->
              <div v-if="tenant.property">
                <h4 class="text-sm font-medium mb-2">Kiralanan Mülk</h4>
                <div class="flex items-center gap-2 text-sm">
                  <Building class="h-4 w-4 text-muted-foreground" />
                  {{ tenant.property.name }}
                </div>
                <div
                  class="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <MapPin class="h-4 w-4" />
                  {{ tenant.property.address || "Adres belirtilmemiş" }}
                </div>
              </div>

              <!-- Contract Info -->
              <div v-if="tenant.contract">
                <h4 class="text-sm font-medium mb-2">Sözleşme Bilgileri</h4>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span>Başlangıç:</span>
                    <span>{{ formatDate(tenant.contract.startDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Bitiş:</span>
                    <span>{{ formatDate(tenant.contract.endDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Kira:</span>
                    <span class="font-medium">{{
                      formatCurrency(tenant.contract.monthlyRent)
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Depozito:</span>
                    <span>{{ formatCurrency(tenant.contract.deposit) }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Status -->
              <div>
                <h4 class="text-sm font-medium mb-2">Ödeme Durumu</h4>
                <div class="flex items-center gap-2">
                  <div
                    :class="[
                      'h-2 w-2 rounded-full',
                      tenant.paymentStatus === 'UP_TO_DATE' && 'bg-green-500',
                      tenant.paymentStatus === 'LATE' && 'bg-red-500',
                      tenant.paymentStatus === 'OVERDUE' && 'bg-red-700',
                    ]"
                  />
                  <span class="text-sm">{{
                    getPaymentStatusLabel(tenant.paymentStatus)
                  }}</span>
                </div>
                <p
                  v-if="tenant.lastPayment"
                  class="text-xs text-muted-foreground mt-1"
                >
                  Son ödeme: {{ formatDate(tenant.lastPayment) }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  class="gap-2 flex-1"
                  @click="viewTenant(tenant)"
                >
                  <Eye class="h-3 w-3" />
                  Detay
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="editTenant(tenant)">
                      <Edit class="mr-2 h-4 w-4" />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="tenant.contract"
                      @click="viewContract(tenant)"
                    >
                      <FileText class="mr-2 h-4 w-4" />
                      Sözleşme
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="viewPayments(tenant)">
                      <CreditCard class="mr-2 h-4 w-4" />
                      Ödemeler
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="sendNotificationToTenant(tenant)">
                      <MessageSquare class="mr-2 h-4 w-4" />
                      Bildirim Gönder
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      class="text-red-600"
                      @click="terminateContract(tenant)"
                    >
                      <UserX class="mr-2 h-4 w-4" />
                      Sözleşme Sonlandır
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTenants.length === 0" class="text-center py-12">
        <UserCheck class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-lg font-medium mb-2">Kiracı bulunamadı</h3>
        <p class="text-muted-foreground mb-4">
          Arama kriterlerinize uygun kiracı bulunmuyor.
        </p>
        <Button variant="outline" @click="clearFilters">
          Filtreleri Temizle
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Building,
  MapPin,
  Eye,
  MoreHorizontal,
  Edit,
  FileText,
  CreditCard,
  MessageSquare,
  UserX,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

const userStore = useUserStore();
const {
  tenants,
  stats,
  loading,
  error,
  loadTenants,
  loadTenantStats,
  updateTenantStatus,
  terminateContract: terminateContractAction,
  sendNotification,
} = useTenants();

// Wait for user initialization
await userStore.initializeAuth();

// Check permissions only on client side to avoid SSR issues
if (import.meta.client && userStore.user?.role !== "ADMIN") {
  throw createError({
    statusCode: 403,
    statusMessage: "Bu sayfaya erişim yetkiniz yok",
  });
}

// Reactive filters
const searchQuery = ref("");
const selectedStatus = ref("all");
const selectedProperty = ref("all");

// Computed stats
const totalTenants = computed(() => stats.value?.total || 0);
const activeTenants = computed(() => stats.value?.active || 0);
const latePayments = computed(() => stats.value?.latePayments || 0);
const expiringContracts = computed(() => stats.value?.expiringContracts || 0);
const newTenantsThisMonth = computed(() => stats.value?.newThisMonth || 0);

// Filtered tenants
const filteredTenants = computed(() => {
  if (!tenants.value) return [];

  return tenants.value.filter((tenant) => {
    const matchesSearch =
      searchQuery.value === "" ||
      tenant.firstName
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      tenant.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (tenant.property?.name || "")
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());

    const matchesStatus =
      selectedStatus.value === "all" || tenant.status === selectedStatus.value;

    const matchesProperty =
      selectedProperty.value === "all" ||
      tenant.property?.id === selectedProperty.value;

    return matchesSearch && matchesStatus && matchesProperty;
  });
});

// Helper functions
const getTenantInitials = (tenant: any) => {
  return `${tenant.firstName.charAt(0)}${tenant.lastName.charAt(
    0
  )}`.toUpperCase();
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Pasif",
    EXPIRED: "Süresi Dolmuş",
  };
  return labels[status] || status;
};

const getStatusVariant = (
  status: string
): "default" | "destructive" | "outline" | "secondary" => {
  const variants: Record<
    string,
    "default" | "destructive" | "outline" | "secondary"
  > = {
    ACTIVE: "default",
    INACTIVE: "secondary",
    EXPIRED: "destructive",
  };
  return variants[status] || "outline";
};

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    UP_TO_DATE: "Güncel",
    LATE: "Gecikmiş",
    OVERDUE: "Vadesi Geçmiş",
  };
  return labels[status] || status;
};

const formatDate = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
};

// Actions
const viewTenant = (tenant: any) => {
  navigateTo(`/tenants/${tenant.id}`);
};

const editTenant = (tenant: any) => {
  navigateTo(`/tenants/${tenant.id}/edit`);
};

const viewContract = (tenant: any) => {
  navigateTo(`/contracts/${tenant.contract?.id}`);
};

const viewPayments = (tenant: any) => {
  navigateTo(`/finance/payments?tenant=${tenant.id}`);
};

const sendNotificationToTenant = async (tenant: any) => {
  const message = prompt("Kiracıya göndermek istediğiniz mesajı yazın:");
  if (message) {
    try {
      await sendNotification(tenant.id, message);
      alert("Bildirim başarıyla gönderildi!");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Bildirim gönderilirken hata oluştu!");
    }
  }
};

const terminateContract = async (tenant: any) => {
  if (
    confirm(
      `${tenant.firstName} ${tenant.lastName} ile olan sözleşmeyi sonlandırmak istediğinize emin misiniz?`
    )
  ) {
    try {
      await terminateContractAction(tenant.id);
      alert("Sözleşme başarıyla sonlandırıldı!");
    } catch (error) {
      console.error("Error terminating contract:", error);
      alert("Sözleşme sonlandırılırken hata oluştu!");
    }
  }
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedStatus.value = "all";
  selectedProperty.value = "all";
};

// Load data on mount
const loadData = async () => {
  try {
    await Promise.all([
      loadTenants({ page: 1, limit: 100 }),
      loadTenantStats(),
    ]);
  } catch (error) {
    console.error("Error loading tenants data:", error);
  }
};

onMounted(loadData);
</script>
