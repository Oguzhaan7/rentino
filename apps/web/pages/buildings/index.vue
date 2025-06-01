<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Binalar</h1>
      <Button
        v-if="
          userStore.user?.role === 'ADMIN' || userStore.user?.role === 'MANAGER'
        "
        @click="navigateTo('/buildings/create')"
      >
        <Plus class="mr-2 h-4 w-4" />
        Yeni Bina
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardHeader>
        <CardTitle>Filtreler</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex gap-4">
          <div class="flex-1">
            <Input v-model="searchQuery" placeholder="Bina ara..." />
          </div>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="MAINTENANCE">Bakımda</SelectItem>
              <SelectItem value="INACTIVE">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Buildings Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="building in filteredBuildings"
        :key="building.id"
        class="cursor-pointer hover:shadow-lg transition-shadow"
      >
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">{{ building.name }}</CardTitle>
            <Badge :variant="getStatusVariant(building.status)">
              {{ getStatusText(building.status) }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div class="flex items-center text-sm text-muted-foreground">
              <MapPin class="mr-2 h-4 w-4" />
              {{ building.address }}
            </div>
            <div class="flex items-center text-sm text-muted-foreground">
              <Building2 class="mr-2 h-4 w-4" />
              {{ building.totalUnits }} daire
            </div>
            <div class="flex items-center text-sm text-muted-foreground">
              <Users class="mr-2 h-4 w-4" />
              {{ building._count?.properties || 0 }} mülk
            </div>
            <div
              v-if="building.manager"
              class="flex items-center text-sm text-muted-foreground"
            >
              <DollarSign class="mr-2 h-4 w-4" />
              Yönetici: {{ building.manager.firstName }}
              {{ building.manager.lastName }}
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="viewBuilding(building.id)"
            >
              <Eye class="mr-2 h-4 w-4" />
              Görüntüle
            </Button>
            <Button
              v-if="
                userStore.user?.role === 'ADMIN' ||
                userStore.user?.role === 'MANAGER'
              "
              variant="outline"
              size="sm"
              @click="editBuilding(building.id)"
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
      v-if="!loading && filteredBuildings.length === 0"
      class="text-center py-12"
    >
      <Building2 class="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 class="mt-2 text-sm font-semibold text-gray-900">Bina bulunamadı</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        {{
          searchQuery
            ? "Arama kriterlerinize uygun bina bulunamadı."
            : "Henüz hiç bina eklenmemiş."
        }}
      </p>
      <div
        v-if="
          userStore.user?.role === 'ADMIN' || userStore.user?.role === 'MANAGER'
        "
        class="mt-6"
      >
        <Button @click="navigateTo('/buildings/create')">
          <Plus class="mr-2 h-4 w-4" />
          İlk Binayı Ekle
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
  Building2,
  Users,
  DollarSign,
  Eye,
  Edit,
} from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();
const searchQuery = ref("");
const statusFilter = ref("all");

// Use buildings composable
const {
  buildings: _buildings,
  loading,
  error,
  loadBuildings,
  filterBuildings,
  getStatusVariant,
  getStatusText,
} = useBuildings();

// Filtered buildings computed property
const filteredBuildings = computed(() => {
  return filterBuildings(searchQuery.value, statusFilter.value);
});

const viewBuilding = (id: string) => {
  navigateTo(`/buildings/${id}`);
};

const editBuilding = (id: string) => {
  navigateTo(`/buildings/${id}/edit`);
};

// Load buildings on mount
onMounted(async () => {
  try {
    await loadBuildings();
  } catch (error) {
    console.error("Error loading buildings:", error);
  }
});
</script>
