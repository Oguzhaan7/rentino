<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            class="gap-2"
            @click="navigateTo('/my-rental')"
          >
            <ArrowLeft class="h-4 w-4" />
            Geri Dön
          </Button>
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Bakım Talepleri</h1>
        <p class="text-muted-foreground">
          Ev ile ilgili bakım ve onarım talepleriniz
        </p>
      </div>
      <Button class="gap-2" @click="showCreateRequest = true">
        <Plus class="h-4 w-4" />
        Yeni Talep
      </Button>
    </div>

    <!-- Quick Stats -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Toplam Talep</CardTitle>
          <Wrench class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalRequests }}</div>
          <p class="text-xs text-muted-foreground">Tüm zamanlar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Açık Talepler</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">
            {{ openRequests }}
          </div>
          <p class="text-xs text-muted-foreground">İşlem bekliyor</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Devam Eden</CardTitle>
          <Settings class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">
            {{ inProgressRequests }}
          </div>
          <p class="text-xs text-muted-foreground">Çözümde</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Tamamlanan</CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ completedRequests }}
          </div>
          <p class="text-xs text-muted-foreground">Çözüldü</p>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Filtreler</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[200px]">
            <Label html-for="status-filter">Durum</Label>
            <Select v-model="selectedStatus">
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="OPEN">Açık</SelectItem>
                <SelectItem value="IN_PROGRESS">Devam Eden</SelectItem>
                <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex-1 min-w-[200px]">
            <Label html-for="category-filter">Kategori</Label>
            <Select v-model="selectedCategory">
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="ELECTRICAL">Elektrik</SelectItem>
                <SelectItem value="PLUMBING">Tesisat</SelectItem>
                <SelectItem value="HEATING">Isıtma</SelectItem>
                <SelectItem value="GENERAL">Genel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex-1 min-w-[200px]">
            <Label html-for="priority-filter">Öncelik</Label>
            <Select v-model="selectedPriority">
              <SelectTrigger>
                <SelectValue placeholder="Öncelik seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="LOW">Düşük</SelectItem>
                <SelectItem value="MEDIUM">Orta</SelectItem>
                <SelectItem value="HIGH">Yüksek</SelectItem>
                <SelectItem value="URGENT">Acil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-end">
            <Button variant="outline" @click="clearFilters">
              Filtreleri Temizle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Maintenance Requests List -->
    <div class="grid gap-4">
      <Card
        v-for="request in filteredRequests"
        :key="request.id"
        class="hover:shadow-md transition-shadow"
      >
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3">
              <div
                :class="['p-2 rounded-lg', getCategoryColor(request.category)]"
              >
                <component
                  :is="getCategoryIcon(request.category)"
                  class="h-5 w-5"
                />
              </div>
              <div>
                <CardTitle class="text-lg">{{ request.title }}</CardTitle>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ request.description }}
                </p>
                <div
                  class="flex items-center gap-4 mt-2 text-sm text-muted-foreground"
                >
                  <div class="flex items-center gap-1">
                    <Calendar class="h-3 w-3" />
                    {{ formatDate(request.createdAt) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <Clock class="h-3 w-3" />
                    {{ getElapsedTime(request.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Badge :variant="getPriorityVariant(request.priority)">
                {{ getPriorityLabel(request.priority) }}
              </Badge>
              <Badge :variant="getStatusVariant(request.status)">
                {{ getStatusLabel(request.status) }}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- Progress Timeline -->
            <div v-if="request.timeline && request.timeline.length > 0">
              <h4 class="font-medium mb-2">İşlem Geçmişi</h4>
              <div class="space-y-2">
                <div
                  v-for="event in request.timeline"
                  :key="event.id"
                  class="flex items-start gap-3 p-2 bg-muted/50 rounded-lg"
                >
                  <div
                    :class="[
                      'w-2 h-2 rounded-full mt-2',
                      getTimelineColor(event.type),
                    ]"
                  />
                  <div class="flex-1">
                    <div class="text-sm font-medium">
                      {{ event.description }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ formatDate(event.createdAt) }} - {{ event.author }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Assigned Technician -->
            <div
              v-if="request.assignedTo"
              class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
            >
              <Avatar class="h-8 w-8">
                <AvatarImage :src="request.assignedTo.avatar" />
                <AvatarFallback>{{
                  getTechnicianInitials(request.assignedTo)
                }}</AvatarFallback>
              </Avatar>
              <div>
                <div class="font-medium">{{ request.assignedTo.name }}</div>
                <div class="text-sm text-muted-foreground">
                  {{ request.assignedTo.title }}
                </div>
              </div>
              <div class="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  class="gap-2"
                  @click="callTechnician(request.assignedTo)"
                >
                  <Phone class="h-3 w-3" />
                  Ara
                </Button>
              </div>
            </div>

            <!-- Images -->
            <div v-if="request.images && request.images.length > 0">
              <h4 class="font-medium mb-2">Fotoğraflar</h4>
              <div class="grid grid-cols-3 gap-2">
                <img
                  v-for="image in request.images"
                  :key="image"
                  :src="image"
                  :alt="request.title"
                  class="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  @click="showImageModal(image)"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                class="gap-2"
                @click="viewRequestDetails(request)"
              >
                <Eye class="h-3 w-3" />
                Detayları Gör
              </Button>
              <Button
                v-if="request.status === 'OPEN'"
                variant="outline"
                size="sm"
                class="gap-2"
                @click="editRequest(request)"
              >
                <Edit class="h-3 w-3" />
                Düzenle
              </Button>
              <Button
                v-if="request.status === 'OPEN'"
                variant="outline"
                size="sm"
                class="gap-2 text-red-600"
                @click="cancelRequest(request)"
              >
                <X class="h-3 w-3" />
                İptal Et
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-if="filteredRequests.length === 0" class="text-center py-12">
      <Wrench class="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <h3 class="text-lg font-medium mb-2">Bakım talebi bulunamadı</h3>
      <p class="text-muted-foreground mb-4">
        {{
          requests.length === 0
            ? "Henüz bir bakım talebi oluşturmadınız."
            : "Seçili filtreler için talep bulunmuyor."
        }}
      </p>
      <div class="flex gap-2 justify-center">
        <Button class="gap-2" @click="showCreateRequest = true">
          <Plus class="h-4 w-4" />
          İlk Talebinizi Oluşturun
        </Button>
        <Button
          v-if="requests.length > 0"
          variant="outline"
          @click="clearFilters"
        >
          Filtreleri Temizle
        </Button>
      </div>
    </div>

    <!-- Create Request Modal -->
    <Dialog v-model:open="showCreateRequest">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Bakım Talebi</DialogTitle>
          <DialogDescription>
            Ev ile ilgili bakım veya onarım talebinizi oluşturun
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label html-for="request-category">Kategori</Label>
              <Select v-model="newRequest.category">
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELECTRICAL">Elektrik</SelectItem>
                  <SelectItem value="PLUMBING">Tesisat</SelectItem>
                  <SelectItem value="HEATING">Isıtma</SelectItem>
                  <SelectItem value="GENERAL">Genel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label html-for="request-priority">Öncelik</Label>
              <Select v-model="newRequest.priority">
                <SelectTrigger>
                  <SelectValue placeholder="Öncelik seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Düşük</SelectItem>
                  <SelectItem value="MEDIUM">Orta</SelectItem>
                  <SelectItem value="HIGH">Yüksek</SelectItem>
                  <SelectItem value="URGENT">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label html-for="request-title">Başlık</Label>
            <Input
              v-model="newRequest.title"
              placeholder="Kısa ve açıklayıcı bir başlık"
            />
          </div>

          <div>
            <Label html-for="request-description">Açıklama</Label>
            <Textarea
              v-model="newRequest.description"
              placeholder="Sorunu detaylarıyla açıklayın..."
              rows="4"
            />
          </div>

          <div>
            <Label html-for="request-images">Fotoğraflar (Opsiyonel)</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              @change="handleImageUpload"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Sorunu daha iyi anlamamız için fotoğraf ekleyebilirsiniz
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showCreateRequest = false">
            İptal
          </Button>
          <Button :disabled="!canCreateRequest" @click="createRequest">
            Talep Oluştur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  Plus,
  Wrench,
  Clock,
  Settings,
  CheckCircle,
  Calendar,
  Eye,
  Edit,
  X,
  Phone,
  Zap,
  Droplets,
  Thermometer,
} from "lucide-vue-next";

// Mock data
const requests = ref([
  {
    id: "1",
    title: "Musluk Tamiri",
    description: "Mutfak musluğu damlatıyor ve kapanmıyor",
    category: "PLUMBING",
    priority: "MEDIUM",
    status: "COMPLETED",
    createdAt: new Date("2024-01-10"),
    completedAt: new Date("2024-01-12"),
    assignedTo: {
      name: "Mehmet Yılmaz",
      title: "Tesisatçı",
      phone: "+90 532 123 4567",
      avatar: "/avatars/technician-1.png",
    },
    timeline: [
      {
        id: "1",
        type: "created",
        description: "Talep oluşturuldu",
        author: "Emre Soy",
        createdAt: new Date("2024-01-10T10:00:00"),
      },
      {
        id: "2",
        type: "assigned",
        description: "Teknisyen atandı",
        author: "Sistem",
        createdAt: new Date("2024-01-10T14:00:00"),
      },
      {
        id: "3",
        type: "started",
        description: "Çalışma başladı",
        author: "Mehmet Yılmaz",
        createdAt: new Date("2024-01-11T09:00:00"),
      },
      {
        id: "4",
        type: "completed",
        description: "Çalışma tamamlandı",
        author: "Mehmet Yılmaz",
        createdAt: new Date("2024-01-12T16:00:00"),
      },
    ],
    images: ["/maintenance/plumbing-1.jpg", "/maintenance/plumbing-2.jpg"],
  },
  {
    id: "2",
    title: "Elektrik Arızası",
    description: "Oturma odasındaki prizler çalışmıyor",
    category: "ELECTRICAL",
    priority: "HIGH",
    status: "IN_PROGRESS",
    createdAt: new Date("2024-01-15"),
    assignedTo: {
      name: "Ali Demir",
      title: "Elektrikçi",
      phone: "+90 533 234 5678",
      avatar: "/avatars/technician-2.png",
    },
    timeline: [
      {
        id: "1",
        type: "created",
        description: "Talep oluşturuldu",
        author: "Emre Soy",
        createdAt: new Date("2024-01-15T11:00:00"),
      },
      {
        id: "2",
        type: "assigned",
        description: "Teknisyen atandı",
        author: "Sistem",
        createdAt: new Date("2024-01-15T15:00:00"),
      },
      {
        id: "3",
        type: "started",
        description: "Çalışma başladı",
        author: "Ali Demir",
        createdAt: new Date("2024-01-16T10:00:00"),
      },
    ],
    images: ["/maintenance/electrical-1.jpg"],
  },
  {
    id: "3",
    title: "Isıtma Problemi",
    description: "Yatak odası radyatörü ısınmıyor",
    category: "HEATING",
    priority: "URGENT",
    status: "OPEN",
    createdAt: new Date("2024-01-18"),
    assignedTo: null,
    timeline: [
      {
        id: "1",
        type: "created",
        description: "Talep oluşturuldu",
        author: "Emre Soy",
        createdAt: new Date("2024-01-18T08:00:00"),
      },
    ],
    images: [],
  },
]);

// Reactive state
const selectedStatus = ref("all");
const selectedCategory = ref("all");
const selectedPriority = ref("all");
const showCreateRequest = ref(false);

const newRequest = ref({
  title: "",
  description: "",
  category: "",
  priority: "MEDIUM",
});

// Computed values
const filteredRequests = computed(() => {
  let filtered = requests.value;

  if (selectedStatus.value !== "all") {
    filtered = filtered.filter(
      (request) => request.status === selectedStatus.value
    );
  }

  if (selectedCategory.value !== "all") {
    filtered = filtered.filter(
      (request) => request.category === selectedCategory.value
    );
  }

  if (selectedPriority.value !== "all") {
    filtered = filtered.filter(
      (request) => request.priority === selectedPriority.value
    );
  }

  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});

const totalRequests = computed(() => requests.value.length);
const openRequests = computed(
  () => requests.value.filter((r) => r.status === "OPEN").length
);
const inProgressRequests = computed(
  () => requests.value.filter((r) => r.status === "IN_PROGRESS").length
);
const completedRequests = computed(
  () => requests.value.filter((r) => r.status === "COMPLETED").length
);

const canCreateRequest = computed(() => {
  return (
    newRequest.value.title &&
    newRequest.value.description &&
    newRequest.value.category
  );
});

// Helper functions
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const getElapsedTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "1 gün önce";
  return `${diffDays} gün önce`;
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    ELECTRICAL: Zap,
    PLUMBING: Droplets,
    HEATING: Thermometer,
    GENERAL: Wrench,
  };
  return icons[category] || Wrench;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    ELECTRICAL: "bg-yellow-100 text-yellow-700",
    PLUMBING: "bg-blue-100 text-blue-700",
    HEATING: "bg-red-100 text-red-700",
    GENERAL: "bg-gray-100 text-gray-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    OPEN: "Açık",
    IN_PROGRESS: "Devam Eden",
    COMPLETED: "Tamamlandı",
    CANCELLED: "İptal Edildi",
  };
  return labels[status] || status;
};

const getStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    OPEN: "secondary",
    IN_PROGRESS: "default",
    COMPLETED: "default",
    CANCELLED: "destructive",
  };
  return variants[status] || "default";
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    LOW: "Düşük",
    MEDIUM: "Orta",
    HIGH: "Yüksek",
    URGENT: "Acil",
  };
  return labels[priority] || priority;
};

const getPriorityVariant = (priority: string) => {
  const variants: Record<string, string> = {
    LOW: "outline",
    MEDIUM: "secondary",
    HIGH: "default",
    URGENT: "destructive",
  };
  return variants[priority] || "outline";
};

const getTimelineColor = (type: string) => {
  const colors: Record<string, string> = {
    created: "bg-blue-500",
    assigned: "bg-yellow-500",
    started: "bg-orange-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };
  return colors[type] || "bg-gray-500";
};

const getTechnicianInitials = (technician: any) => {
  return technician.name
    .split(" ")
    .map((n: string) => n.charAt(0))
    .join("")
    .toUpperCase();
};

// Actions
const clearFilters = () => {
  selectedStatus.value = "all";
  selectedCategory.value = "all";
  selectedPriority.value = "all";
};

const viewRequestDetails = (request: any) => {
  navigateTo(`/my-rental/maintenance/${request.id}`);
};

const editRequest = (request: any) => {
  // TODO: Implement request editing
  console.log("Editing request:", request.id);
};

const cancelRequest = async (request: any) => {
  if (
    confirm(
      `"${request.title}" talebini iptal etmek istediğinize emin misiniz?`
    )
  ) {
    // TODO: API call to cancel request
    request.status = "CANCELLED";
    console.log("Cancelled request:", request.id);
  }
};

const callTechnician = (technician: any) => {
  window.open(`tel:${technician.phone}`);
};

const createRequest = async () => {
  // TODO: API call to create request
  const request = {
    id: Date.now().toString(),
    ...newRequest.value,
    status: "OPEN",
    createdAt: new Date(),
    assignedTo: null,
    timeline: [
      {
        id: "1",
        type: "created",
        description: "Talep oluşturuldu",
        author: "Emre Soy",
        createdAt: new Date(),
      },
    ],
    images: [],
  };

  requests.value.unshift(request);

  // Reset form
  newRequest.value = {
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
  };

  showCreateRequest.value = false;
  console.log("Created request:", request.id);
};

const handleImageUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    // TODO: Handle file upload
    console.log("Files selected:", files.length);
  }
};

const showImageModal = (image: string) => {
  // TODO: Show image in modal
  console.log("Showing image:", image);
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
