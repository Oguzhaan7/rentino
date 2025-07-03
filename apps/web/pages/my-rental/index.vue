<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">Kiralama Bilgilerim</h1>
      <p class="text-muted-foreground">Kira sözleşmesi ve ödeme bilgileriniz</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Aylık Kira</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatCurrency(rentalInfo.monthlyRent) }}
          </div>
          <p class="text-xs text-muted-foreground">Sonraki ödeme: {{ formatDate(rentalInfo.nextPaymentDate) }}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Sözleşme Durumu</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <Badge :variant="getContractStatusVariant(rentalInfo.contractStatus)">
              {{ getContractStatusLabel(rentalInfo.contractStatus) }}
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground">Bitiş: {{ formatDate(rentalInfo.contractEndDate) }}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Kalan Süre</CardTitle>
          <Calendar class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ getRemainingDays() }}</div>
          <p class="text-xs text-muted-foreground">gün kaldı</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Ödeme Durumu</CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <Badge :variant="getPaymentStatusVariant(rentalInfo.paymentStatus)">
              {{ getPaymentStatusLabel(rentalInfo.paymentStatus) }}
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground">Son ödeme: {{ formatDate(rentalInfo.lastPaymentDate) }}</p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Property Information -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Building class="h-5 w-5" />
              Mülk Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div class="flex items-start gap-4">
                <div
                  class="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                >
                  <Building class="w-8 h-8 text-white" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-lg">
                    {{ rentalInfo.property.name }}
                  </h3>
                  <p class="text-muted-foreground flex items-center gap-1">
                    <MapPin class="h-4 w-4" />
                    {{ rentalInfo.property.address }}
                  </p>
                  <div class="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <span class="text-muted-foreground">Oda Sayısı:</span>
                      <span class="ml-2 font-medium">{{ rentalInfo.property.rooms }}</span>
                    </div>
                    <div>
                      <span class="text-muted-foreground">Alan:</span>
                      <span class="ml-2 font-medium">{{ rentalInfo.property.area }} m²</span>
                    </div>
                    <div>
                      <span class="text-muted-foreground">Kat:</span>
                      <span class="ml-2 font-medium">{{ rentalInfo.property.floor }}</span>
                    </div>
                    <div>
                      <span class="text-muted-foreground">Eşyalı:</span>
                      <span class="ml-2 font-medium">{{ rentalInfo.property.furnished ? "Evet" : "Hayır" }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Amenities -->
              <div>
                <h4 class="font-medium mb-2">Özellikler</h4>
                <div class="flex flex-wrap gap-2">
                  <Badge v-for="amenity in rentalInfo.property.amenities" :key="amenity" variant="secondary">
                    {{ amenity }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Recent Payments -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="flex items-center gap-2">
                <CreditCard class="h-5 w-5" />
                Son Ödemeler
              </CardTitle>
              <Button variant="outline" class="gap-2" @click="navigateTo('/my-rental/payments')">
                <Eye class="h-4 w-4" />
                Tümünü Gör
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="payment in recentPayments"
                :key="payment.id"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'h-2 w-2 rounded-full',
                      payment.status === 'PAID' && 'bg-green-500',
                      payment.status === 'PENDING' && 'bg-yellow-500',
                      payment.status === 'OVERDUE' && 'bg-red-500',
                    ]"
                  />
                  <div>
                    <div class="font-medium">
                      {{ formatCurrency(payment.amount) }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ payment.description }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm">{{ formatDate(payment.date) }}</div>
                  <Badge :variant="getPaymentStatusVariant(payment.status)">
                    {{ getPaymentStatusLabel(payment.status) }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Recent Maintenance Requests -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="flex items-center gap-2">
                <Wrench class="h-5 w-5" />
                Son Bakım Talepleri
              </CardTitle>
              <Button variant="outline" class="gap-2" @click="navigateTo('/my-rental/maintenance')">
                <Eye class="h-4 w-4" />
                Tümünü Gör
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="request in recentMaintenanceRequests"
                :key="request.id"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <component :is="getMaintenanceIcon(request.category)" class="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div class="font-medium">{{ request.title }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ request.description }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm">{{ formatDate(request.createdAt) }}</div>
                  <Badge :variant="getMaintenanceStatusVariant(request.status)">
                    {{ getMaintenanceStatusLabel(request.status) }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Button class="w-full gap-2" @click="navigateTo('/my-rental/contract')">
              <FileText class="h-4 w-4" />
              Sözleşme Detayları
            </Button>
            <Button variant="outline" class="w-full gap-2" @click="navigateTo('/my-rental/payments')">
              <CreditCard class="h-4 w-4" />
              Ödeme Geçmişi
            </Button>
            <Button variant="outline" class="w-full gap-2" @click="createMaintenanceRequest">
              <Wrench class="h-4 w-4" />
              Bakım Talebi Oluştur
            </Button>
            <Button variant="outline" class="w-full gap-2" @click="downloadInvoice">
              <Download class="h-4 w-4" />
              Fatura İndir
            </Button>
          </CardContent>
        </Card>

        <!-- Contact Information -->
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div>
              <h4 class="font-medium mb-1">Mülk Yöneticisi</h4>
              <p class="text-sm text-muted-foreground">
                {{ contactInfo.manager.name }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ contactInfo.manager.phone }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ contactInfo.manager.email }}
              </p>
            </div>
            <Separator />
            <div>
              <h4 class="font-medium mb-1">Acil Durum</h4>
              <p class="text-sm text-muted-foreground">
                {{ contactInfo.emergency.phone }}
              </p>
              <p class="text-xs text-muted-foreground">7/24 ulaşılabilir</p>
            </div>
            <Separator />
            <div>
              <h4 class="font-medium mb-1">Teknik Servis</h4>
              <p class="text-sm text-muted-foreground">
                {{ contactInfo.technical.phone }}
              </p>
              <p class="text-xs text-muted-foreground">Pazartesi-Cuma 09:00-18:00</p>
            </div>
          </CardContent>
        </Card>

        <!-- Important Notes -->
        <Card>
          <CardHeader>
            <CardTitle>Önemli Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3 text-sm">
              <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-blue-800">
                  <strong>Ödeme Hatırlatması:</strong> Kira ödemelerinizi her ayın {{ rentalInfo.paymentDay }}. günü
                  yapınız.
                </p>
              </div>
              <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-yellow-800">
                  <strong>Sözleşme Yenileme:</strong> Sözleşmenizin bitiş tarihine {{ getRemainingDays() }} gün kaldı.
                </p>
              </div>
              <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-green-800">
                  <strong>Bakım Talepleri:</strong> Acil olmayan bakım talepleri için sistem üzerinden talepte bulunun.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DollarSign,
  FileText,
  Calendar,
  CheckCircle,
  Building,
  MapPin,
  CreditCard,
  Eye,
  Wrench,
  Download,
  Zap,
  Droplets,
  Thermometer,
} from "lucide-vue-next";

// Mock data
const rentalInfo = ref({
  monthlyRent: 5000,
  nextPaymentDate: new Date("2024-02-01"),
  contractStatus: "ACTIVE",
  contractEndDate: new Date("2024-12-31"),
  paymentStatus: "UP_TO_DATE",
  lastPaymentDate: new Date("2024-01-01"),
  paymentDay: 1,
  property: {
    name: "Merkez Plaza A1",
    address: "Kadıköy Mah. Bağdat Cad. No:123 Kadıköy/İstanbul",
    rooms: "2+1",
    area: 85,
    floor: 3,
    furnished: true,
    amenities: ["Balkon", "Klima", "Beyaz Eşya", "İnternet", "Otopark"],
  },
});

const recentPayments = ref([
  {
    id: "1",
    amount: 5000,
    description: "Ocak 2024 Kira Ödemesi",
    date: new Date("2024-01-01"),
    status: "PAID",
  },
  {
    id: "2",
    amount: 5000,
    description: "Aralık 2023 Kira Ödemesi",
    date: new Date("2023-12-01"),
    status: "PAID",
  },
  {
    id: "3",
    amount: 5000,
    description: "Kasım 2023 Kira Ödemesi",
    date: new Date("2023-11-01"),
    status: "PAID",
  },
]);

const recentMaintenanceRequests = ref([
  {
    id: "1",
    title: "Musluk Tamiri",
    description: "Mutfak musluğu damlatıyor",
    category: "PLUMBING",
    status: "COMPLETED",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    title: "Elektrik Arızası",
    description: "Salon elektrik kontağı çalışmıyor",
    category: "ELECTRICAL",
    status: "IN_PROGRESS",
    createdAt: new Date("2024-01-08"),
  },
]);

const contactInfo = ref({
  manager: {
    name: "Ahmet Yılmaz",
    phone: "+90 532 123 4567",
    email: "ahmet@example.com",
  },
  emergency: {
    phone: "+90 532 999 9999",
  },
  technical: {
    phone: "+90 532 888 8888",
  },
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

const getRemainingDays = () => {
  const today = new Date();
  const endDate = new Date(rentalInfo.value.contractEndDate);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const getContractStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    EXPIRED: "Süresi Dolmuş",
    TERMINATED: "Sonlandırılmış",
  };
  return labels[status] || status;
};

const getContractStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    ACTIVE: "default",
    EXPIRED: "destructive",
    TERMINATED: "secondary",
  };
  return variants[status] || "default";
};

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    UP_TO_DATE: "Güncel",
    PAID: "Ödendi",
    PENDING: "Bekliyor",
    LATE: "Gecikmiş",
    OVERDUE: "Vadesi Geçmiş",
  };
  return labels[status] || status;
};

const getPaymentStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    UP_TO_DATE: "default",
    PAID: "default",
    PENDING: "secondary",
    LATE: "destructive",
    OVERDUE: "destructive",
  };
  return variants[status] || "default";
};

const getMaintenanceStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: "Bekliyor",
    IN_PROGRESS: "İşlemde",
    COMPLETED: "Tamamlandı",
    CANCELLED: "İptal Edildi",
  };
  return labels[status] || status;
};

const getMaintenanceStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    PENDING: "secondary",
    IN_PROGRESS: "default",
    COMPLETED: "default",
    CANCELLED: "destructive",
  };
  return variants[status] || "default";
};

const getMaintenanceIcon = (category: string) => {
  const icons: Record<string, any> = {
    ELECTRICAL: Zap,
    PLUMBING: Droplets,
    HEATING: Thermometer,
    GENERAL: Wrench,
  };
  return icons[category] || Wrench;
};

// Actions
const createMaintenanceRequest = () => {
  navigateTo("/my-rental/maintenance/create");
};

const downloadInvoice = () => {
  // TODO: Implement invoice download
  console.log("Downloading invoice...");
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
