<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Mülkler</h1>
      <Button
        v-if="userStore.canManageProperties"
        @click="navigateTo('/properties/create')"
      >
        <Plus class="mr-2 h-4 w-4" />
        Yeni Mülk
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardHeader>
        <CardTitle>Filtreler</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input v-model="searchQuery" placeholder="Mülk ara..." />
          </div>
          <Select v-model="statusFilter">
            <SelectTrigger>
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="AVAILABLE">Müsait</SelectItem>
              <SelectItem value="RENTED">Kiralanmış</SelectItem>
              <SelectItem value="UNDER_MAINTENANCE">Bakımda</SelectItem>
              <SelectItem value="ON_SALE">Satılık</SelectItem>
              <SelectItem value="SOLD">Satıldı</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="typeFilter">
            <SelectTrigger>
              <SelectValue placeholder="Tür seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="APARTMENT">Daire</SelectItem>
              <SelectItem value="HOUSE">Ev</SelectItem>
              <SelectItem value="OFFICE">Ofis</SelectItem>
              <SelectItem value="SHOP">Dükkan</SelectItem>
              <SelectItem value="LAND">Arsa</SelectItem>
              <SelectItem value="WAREHOUSE">Depo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" @click="clearFilters">
            <X class="mr-2 h-4 w-4" />
            Temizle
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Properties Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="property in filteredProperties"
        :key="property.id"
        class="cursor-pointer hover:shadow-lg transition-shadow"
      >
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">{{ property.title }}</CardTitle>
            <Badge :variant="getStatusVariant(property.status)">
              {{ getStatusText(property.status) }}
            </Badge>
          </div>
          <div class="flex items-center text-sm text-muted-foreground">
            <Badge variant="outline" class="mr-2">
              {{ getTypeText(property.type) }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div class="flex items-center text-sm text-muted-foreground">
              <MapPin class="mr-2 h-4 w-4" />
              {{ property.address }}
            </div>
            <div class="flex items-center text-sm text-muted-foreground">
              <Home class="mr-2 h-4 w-4" />
              {{ property.totalArea }} m²
            </div>
            <div
              v-if="property.numberOfRooms"
              class="flex items-center text-sm text-muted-foreground"
            >
              <Bed class="mr-2 h-4 w-4" />
              {{ property.numberOfRooms }} oda
            </div>
            <div
              v-if="property.floor"
              class="flex items-center text-sm text-muted-foreground"
            >
              <Building class="mr-2 h-4 w-4" />
              {{ property.floor }}. kat
            </div>
            <div
              v-if="property.building"
              class="flex items-center text-sm text-muted-foreground"
            >
              <Building2 class="mr-2 h-4 w-4" />
              {{ property.building.name }}
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="viewProperty(property.id)"
            >
              <Eye class="mr-2 h-4 w-4" />
              Görüntüle
            </Button>
            <Button
              v-if="userStore.canManageProperties"
              variant="outline"
              size="sm"
              @click="editProperty(property.id)"
            >
              <Edit class="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center py-8">
      <div class="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
        {{ error }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && filteredProperties.length === 0"
      class="text-center py-12"
    >
      <Home class="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 class="mt-2 text-sm font-semibold text-gray-900">Mülk bulunamadı</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        Arama kriterlerinizi değiştirin veya yeni bir mülk ekleyin.
      </p>
      <div class="mt-6">
        <Button
          v-if="userStore.canManageProperties"
          @click="navigateTo('/properties/create')"
        >
          <Plus class="mr-2 h-4 w-4" />
          Yeni Mülk Ekle
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MapPin,
  Building,
  Eye,
  Edit,
  X,
  Home,
  Bed,
  Building2,
} from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();
const {
  properties,
  loading,
  error,
  loadProperties,
  getStatusVariant,
  getStatusText,
  getTypeText,
} = useProperties();

const searchQuery = ref("");
const statusFilter = ref("all");
const typeFilter = ref("all");

const clearFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "all";
  typeFilter.value = "all";
};

const filteredProperties = computed(() => {
  let filtered = properties.value;

  if (searchQuery.value) {
    filtered = filtered.filter(
      (property) =>
        property.title
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        property.address
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        property.district
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
    );
  }

  if (statusFilter.value !== "all") {
    filtered = filtered.filter(
      (property) => property.status === statusFilter.value
    );
  }

  if (typeFilter.value !== "all") {
    filtered = filtered.filter(
      (property) => property.type === typeFilter.value
    );
  }

  return filtered;
});

const viewProperty = (id: string) => {
  navigateTo(`/properties/${id}`);
};

const editProperty = (id: string) => {
  navigateTo(`/properties/${id}/edit`);
};

// Load properties on mount
onMounted(async () => {
  await loadProperties();
});
</script>
