<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin" />
      <span class="ml-2">Kullanıcı bilgileri yükleniyor...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <AlertCircle class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">Hata</h3>
      <p class="text-muted-foreground mb-4">{{ error }}</p>
      <Button variant="outline" @click="loadUserData">
        <RefreshCw class="h-4 w-4 mr-2" />
        Tekrar Dene
      </Button>
    </div>

    <!-- User Details -->
    <div v-else-if="user" class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <Button variant="outline" @click="navigateTo('/users')">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          <div>
            <h1 class="text-3xl font-bold tracking-tight">
              {{ user.firstName }} {{ user.lastName }}
            </h1>
            <p class="text-muted-foreground">Kullanıcı Detayları</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Button
            v-if="userStore.user?.role === 'ADMIN'"
            class="gap-2"
            @click="navigateTo(`/users/${user.id}/edit`)"
          >
            <Edit class="h-4 w-4" />
            Düzenle
          </Button>
        </div>
      </div>

      <!-- User Info Cards -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Basic Info -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <UserIcon class="h-5 w-5" />
              Temel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Ad Soyad</label
              >
              <p class="text-sm">{{ user.firstName }} {{ user.lastName }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >E-posta</label
              >
              <p class="text-sm">{{ user.email }}</p>
            </div>
            <div v-if="user.phone">
              <label class="text-sm font-medium text-muted-foreground"
                >Telefon</label
              >
              <p class="text-sm">{{ user.phone }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Durum</label
              >
              <Badge :variant="user.isActive ? 'default' : 'secondary'">
                {{ user.isActive ? "Aktif" : "Pasif" }}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <!-- Role & Permissions -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield class="h-5 w-5" />
              Rol ve İzinler
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Rol</label
              >
              <div class="flex items-center gap-2 mt-1">
                <Badge :variant="getRoleVariant(user.role)">
                  {{ getRoleLabel(user.role) }}
                </Badge>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >İzinler</label
              >
              <div class="flex flex-wrap gap-1 mt-1">
                <Badge
                  v-for="permission in getRolePermissions(user.role)"
                  :key="permission"
                  variant="outline"
                  class="text-xs"
                >
                  {{ permission }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Activity Info -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Clock class="h-5 w-5" />
              Aktivite Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Üyelik Tarihi</label
              >
              <p class="text-sm">{{ formatDate(user.createdAt) }}</p>
            </div>
            <div v-if="(user as any).lastLogin">
              <label class="text-sm font-medium text-muted-foreground"
                >Son Giriş</label
              >
              <p class="text-sm">{{ formatDate((user as any).lastLogin) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground"
                >Son Güncelleme</label
              >
              <p class="text-sm">{{ formatDate(user.updatedAt) }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Statistics Cards -->
      <div v-if="userStats" class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Mülkler</p>
                <p class="text-2xl font-bold">
                  {{ userStats.properties || 0 }}
                </p>
              </div>
              <Building class="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Sözleşmeler
                </p>
                <p class="text-2xl font-bold">{{ userStats.contracts || 0 }}</p>
              </div>
              <FileText class="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Ödemeler
                </p>
                <p class="text-2xl font-bold">{{ userStats.payments || 0 }}</p>
              </div>
              <CreditCard class="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Bakım Talepleri
                </p>
                <p class="text-2xl font-bold">
                  {{ userStats.maintenanceRequests || 0 }}
                </p>
              </div>
              <Wrench class="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Action Buttons for Admins -->
      <div
        v-if="userStore.user?.role === 'ADMIN'"
        class="flex justify-end space-x-2 pt-6 border-t"
      >
        <Button
          variant="outline"
          :disabled="toggleStatusLoading"
          class="gap-2"
          @click="toggleUserStatus"
        >
          <component
            :is="
              toggleStatusLoading ? Loader2 : user.isActive ? UserX : UserCheck
            "
            :class="toggleStatusLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'"
          />
          {{ user.isActive ? "Deaktif Et" : "Aktif Et" }}
        </Button>
        <Button class="gap-2" @click="navigateTo(`/users/${user.id}/edit`)">
          <Edit class="h-4 w-4" />
          Düzenle
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Shield,
  Clock,
  Building,
  FileText,
  CreditCard,
  Wrench,
  Loader2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-vue-next";

interface UserStats {
  properties?: number;
  contracts?: number;
  payments?: number;
  maintenanceRequests?: number;
  total?: number;
  active?: number;
  inactive?: number;
  byRole?: Record<string, number>;
  newThisMonth?: number;
}

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const route = useRoute();
const userStore = useUserStore();
const {
  currentUser: user,
  loading,
  error,
  loadUser,
  loadUserStats,
  toggleUserStatus: toggleUserStatusAction,
} = useUsers();

// Wait for user initialization
await userStore.initializeAuth();

// Check permissions only on client side to avoid SSR issues
if (import.meta.client && userStore.user?.role !== "ADMIN") {
  throw createError({
    statusCode: 403,
    statusMessage: "Bu sayfaya erişim yetkiniz yok",
  });
}

// Get user ID from route
const userId = route.params.id as string;

// User stats
const userStats = ref<UserStats | null>(null);
const toggleStatusLoading = ref(false);

// Load user data
const loadUserData = async () => {
  try {
    await loadUser(userId);
    if (user.value) {
      userStats.value = await loadUserStats();
    }
  } catch (err) {
    console.error("Failed to load user data:", err);
  }
};

// Toggle user status
const toggleUserStatus = async () => {
  if (!user.value) return;

  toggleStatusLoading.value = true;
  try {
    await toggleUserStatusAction(userId, !user.value.isActive);
    await loadUserData(); // Reload data
  } catch (err) {
    console.error("Failed to toggle user status:", err);
    alert("Kullanıcı durumu değiştirilemedi");
  } finally {
    toggleStatusLoading.value = false;
  }
};

// Helper functions
const getRoleLabel = (role: string) => {
  const roleLabels: Record<string, string> = {
    ADMIN: "Yönetici",
    PROPERTY_OWNER: "Mülk Sahibi",
    TENANT: "Kiracı",
    ACCOUNTANT: "Muhasebeci",
    MANAGER: "Müdür",
  };
  return roleLabels[role] || role;
};

const getRoleVariant = (
  role: string
): "default" | "destructive" | "outline" | "secondary" => {
  const variants: Record<
    string,
    "default" | "destructive" | "outline" | "secondary"
  > = {
    ADMIN: "destructive",
    PROPERTY_OWNER: "default",
    MANAGER: "secondary",
    ACCOUNTANT: "outline",
    TENANT: "outline",
  };
  return variants[role] || "outline";
};

const getRolePermissions = (role: string) => {
  const permissions: Record<string, string[]> = {
    ADMIN: ["Tüm İzinler", "Kullanıcı Yönetimi", "Sistem Ayarları"],
    PROPERTY_OWNER: ["Mülk Yönetimi", "Sözleşmeler", "Finansal Raporlar"],
    MANAGER: ["Mülk Yönetimi", "Bina Yönetimi", "Sözleşmeler"],
    ACCOUNTANT: ["Finansal İşlemler", "Raporlar", "Ödemeler"],
    TENANT: ["Profil Görüntüleme", "Ödeme Takibi", "Bakım Talepleri"],
  };
  return permissions[role] || [];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Load data on mount
onMounted(() => {
  loadUserData();
});
</script>
