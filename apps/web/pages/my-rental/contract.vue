<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Sözleşme Detayları</h1>
        <p class="text-muted-foreground">Kira sözleşmenizin detaylı bilgileri</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" class="gap-2" @click="downloadContract">
          <Download class="h-4 w-4" />
          PDF İndir
        </Button>
        <Button variant="outline" class="gap-2" @click="navigateTo('/my-rental')">
          <ArrowLeft class="h-4 w-4" />
          Geri Dön
        </Button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Main Contract Information -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Contract Overview -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <FileText class="h-5 w-5" />
              Sözleşme Genel Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-6">
              <!-- Contract Status -->
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 class="font-medium">Sözleşme Durumu</h4>
                  <p class="text-sm text-muted-foreground">Mevcut durum</p>
                </div>
                <Badge :variant="getStatusVariant(contract.status)" class="text-sm">
                  {{ getStatusLabel(contract.status) }}
                </Badge>
              </div>

              <!-- Basic Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div>
                    <Label class="text-sm font-medium text-muted-foreground">Sözleşme No</Label>
                    <p class="font-medium">{{ contract.contractNumber }}</p>
                  </div>
                  <div>
                    <Label class="text-sm font-medium text-muted-foreground">Başlangıç Tarihi</Label>
                    <p class="font-medium">
                      {{ formatDate(contract.startDate) }}
                    </p>
                  </div>
                  <div>
                    <Label class="text-sm font-medium text-muted-foreground">Bitiş Tarihi</Label>
                    <p class="font-medium">
                      {{ formatDate(contract.endDate) }}
                    </p>
                  </div>
                </div>
                <div class="space-y-3">
                  <div>
                    <Label class="text-sm font-medium text-muted-foreground">Süre</Label>
                    <p class="font-medium">{{ getContractDuration() }} ay</p>
                  </div>
                  <div>
                    <Label class="text-sm font-medium text-muted-foreground">Kalan Süre</Label>
                    <p class="font-medium">{{ getRemainingDays() }} gün</p>
                  </div>
                  <div>
                    <Label class="text-sm font-medium text-muted-foreground">Yenileme Türü</Label>
                    <p class="font-medium">
                      {{ getRenewalTypeLabel(contract.renewalType) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Financial Terms -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <DollarSign class="h-5 w-5" />
              Mali Koşullar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 bg-muted rounded-lg">
                  <h4 class="font-medium text-sm text-muted-foreground">Aylık Kira</h4>
                  <p class="text-2xl font-bold">
                    {{ formatCurrency(contract.monthlyRent) }}
                  </p>
                </div>
                <div class="p-4 bg-muted rounded-lg">
                  <h4 class="font-medium text-sm text-muted-foreground">Depozito</h4>
                  <p class="text-2xl font-bold">
                    {{ formatCurrency(contract.deposit) }}
                  </p>
                </div>
                <div class="p-4 bg-muted rounded-lg">
                  <h4 class="font-medium text-sm text-muted-foreground">Toplam Ödenen</h4>
                  <p class="text-2xl font-bold">
                    {{ formatCurrency(contract.totalPaid) }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label class="text-sm font-medium text-muted-foreground">Ödeme Günü</Label>
                  <p class="font-medium">Her ayın {{ contract.paymentDay }}. günü</p>
                </div>
                <div>
                  <Label class="text-sm font-medium text-muted-foreground">Kira Artış Oranı</Label>
                  <p class="font-medium">{{ contract.increaseRate }}% (yıllık)</p>
                </div>
              </div>

              <!-- Payment Method -->
              <div>
                <Label class="text-sm font-medium text-muted-foreground">Ödeme Yöntemi</Label>
                <div class="flex items-center gap-2 mt-1">
                  <CreditCard class="h-4 w-4" />
                  <span class="font-medium">{{ getPaymentMethodLabel(contract.paymentMethod) }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Property Details -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Building class="h-5 w-5" />
              Kiralanan Mülk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div class="flex items-start gap-4">
                <div
                  class="w-24 h-24 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center"
                >
                  <Building class="w-10 h-10 text-white" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-lg">
                    {{ contract.property.name }}
                  </h3>
                  <p class="text-muted-foreground flex items-center gap-1">
                    <MapPin class="h-4 w-4" />
                    {{ contract.property.fullAddress }}
                  </p>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                    <div>
                      <span class="text-muted-foreground">Oda:</span>
                      <span class="ml-1 font-medium">{{ contract.property.rooms }}</span>
                    </div>
                    <div>
                      <span class="text-muted-foreground">Alan:</span>
                      <span class="ml-1 font-medium">{{ contract.property.area }} m²</span>
                    </div>
                    <div>
                      <span class="text-muted-foreground">Kat:</span>
                      <span class="ml-1 font-medium">{{ contract.property.floor }}</span>
                    </div>
                    <div>
                      <span class="text-muted-foreground">Eşyalı:</span>
                      <span class="ml-1 font-medium">{{ contract.property.furnished ? "Evet" : "Hayır" }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Property Features -->
              <div>
                <h4 class="font-medium mb-2">Mülk Özellikleri</h4>
                <div class="flex flex-wrap gap-2">
                  <Badge v-for="feature in contract.property.features" :key="feature" variant="secondary">
                    {{ feature }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Terms and Conditions -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Clipboard class="h-5 w-5" />
              Sözleşme Maddeleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="(term, index) in contract.terms" :key="index" class="border-l-4 border-primary pl-4">
                <h4 class="font-medium">{{ term.title }}</h4>
                <p class="text-sm text-muted-foreground">
                  {{ term.description }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Progress Indicator -->
        <Card>
          <CardHeader>
            <CardTitle>Sözleşme İlerlemesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span>Tamamlanan Süre</span>
                  <span>{{ getCompletionPercentage() }}%</span>
                </div>
                <div class="w-full bg-secondary rounded-full h-2">
                  <div
                    class="bg-primary h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${getCompletionPercentage()}%` }"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="text-center p-2 bg-muted rounded">
                  <div class="font-bold">{{ getElapsedDays() }}</div>
                  <div class="text-muted-foreground">Geçen gün</div>
                </div>
                <div class="text-center p-2 bg-muted rounded">
                  <div class="font-bold">{{ getRemainingDays() }}</div>
                  <div class="text-muted-foreground">Kalan gün</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Landlord Information -->
        <Card>
          <CardHeader>
            <CardTitle>Ev Sahibi Bilgileri</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-center gap-3">
              <Avatar class="h-10 w-10">
                <AvatarImage :src="contract.landlord.avatar" />
                <AvatarFallback>{{ getLandlordInitials() }}</AvatarFallback>
              </Avatar>
              <div>
                <p class="font-medium">{{ contract.landlord.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ contract.landlord.title }}
                </p>
              </div>
            </div>

            <Separator />

            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <Phone class="h-4 w-4 text-muted-foreground" />
                <span>{{ contract.landlord.phone }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Mail class="h-4 w-4 text-muted-foreground" />
                <span>{{ contract.landlord.email }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Important Dates -->
        <Card>
          <CardHeader>
            <CardTitle>Önemli Tarihler</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm">Sonraki Ödeme</span>
              <Badge variant="outline">{{ formatDate(contract.nextPaymentDate) }}</Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Sözleşme Bitiş</span>
              <Badge variant="outline">{{ formatDate(contract.endDate) }}</Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Yenileme Bildirimi</span>
              <Badge variant="outline">{{ formatDate(contract.renewalNoticeDate) }}</Badge>
            </div>
          </CardContent>
        </Card>

        <!-- Actions -->
        <Card>
          <CardHeader>
            <CardTitle>İşlemler</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Button class="w-full gap-2" @click="requestRenewal">
              <RefreshCw class="h-4 w-4" />
              Yenileme Talebi
            </Button>
            <Button variant="outline" class="w-full gap-2" @click="downloadContract">
              <Download class="h-4 w-4" />
              Sözleşme PDF
            </Button>
            <Button variant="outline" class="w-full gap-2" @click="contactLandlord">
              <MessageCircle class="h-4 w-4" />
              Ev Sahibi ile İletişim
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Download,
  ArrowLeft,
  FileText,
  DollarSign,
  Building,
  MapPin,
  Clipboard,
  Phone,
  Mail,
  RefreshCw,
  MessageCircle,
  CreditCard,
} from "lucide-vue-next";

// Mock contract data
const contract = ref({
  contractNumber: "CT-2024-001",
  status: "ACTIVE",
  startDate: new Date("2023-01-01"),
  endDate: new Date("2024-12-31"),
  monthlyRent: 5000,
  deposit: 10000,
  totalPaid: 65000,
  paymentDay: 1,
  increaseRate: 10,
  paymentMethod: "BANK_TRANSFER",
  renewalType: "AUTOMATIC",
  nextPaymentDate: new Date("2024-02-01"),
  renewalNoticeDate: new Date("2024-11-01"),
  property: {
    name: "Merkez Plaza A1",
    fullAddress: "Kadıköy Mah. Bağdat Cad. No:123 Daire:5 Kadıköy/İstanbul",
    rooms: "2+1",
    area: 85,
    floor: 3,
    furnished: true,
    features: ["Balkon", "Klima", "Beyaz Eşya", "İnternet", "Otopark", "Güvenlik"],
  },
  landlord: {
    name: "Fatma Demir",
    title: "Mülk Sahibi",
    phone: "+90 533 234 5678",
    email: "fatma@example.com",
    avatar: "/avatars/02.png",
  },
  terms: [
    {
      title: "Kira Ödemesi",
      description: "Kira ödemesi her ayın 1. günü yapılacaktır. 5 gün gecikme toleransı vardır.",
    },
    {
      title: "Depozito",
      description:
        "Sözleşme başlangıcında ödenen depozito, sözleşme sonunda hasarsız teslim koşuluyla iade edilecektir.",
    },
    {
      title: "Bakım ve Onarım",
      description: "Küçük bakımlar kiracı, büyük onarımlar ev sahibi tarafından karşılanacaktır.",
    },
    {
      title: "Erken Çıkış",
      description: "Sözleşme süresinden önce çıkış için 30 gün önceden bildirim yapılmalıdır.",
    },
  ],
});

// Helper functions
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    EXPIRED: "Süresi Dolmuş",
    TERMINATED: "Sonlandırılmış",
    PENDING: "Beklemede",
  };
  return labels[status] || status;
};

const getStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    ACTIVE: "default",
    EXPIRED: "destructive",
    TERMINATED: "secondary",
    PENDING: "secondary",
  };
  return variants[status] || "default";
};

const getRenewalTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    AUTOMATIC: "Otomatik Yenileme",
    MANUAL: "Manuel Yenileme",
    NO_RENEWAL: "Yenileme Yok",
  };
  return labels[type] || type;
};

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    BANK_TRANSFER: "Banka Havalesi",
    CASH: "Nakit",
    CHECK: "Çek",
    CREDIT_CARD: "Kredi Kartı",
  };
  return labels[method] || method;
};

const getContractDuration = () => {
  const start = new Date(contract.value.startDate);
  const end = new Date(contract.value.endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return diffMonths;
};

const getRemainingDays = () => {
  const today = new Date();
  const endDate = new Date(contract.value.endDate);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const getElapsedDays = () => {
  const today = new Date();
  const startDate = new Date(contract.value.startDate);
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const getCompletionPercentage = () => {
  const totalDays = getElapsedDays() + getRemainingDays();
  const elapsed = getElapsedDays();
  return totalDays > 0 ? Math.round((elapsed / totalDays) * 100) : 0;
};

const getLandlordInitials = () => {
  const names = contract.value.landlord.name.split(" ");
  return names
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();
};

// Actions
const downloadContract = () => {
  // TODO: Implement contract PDF download
  console.log("Downloading contract PDF...");
};

const requestRenewal = () => {
  // TODO: Implement renewal request
  console.log("Requesting contract renewal...");
};

const contactLandlord = () => {
  // TODO: Implement landlord contact
  console.log("Contacting landlord...");
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
