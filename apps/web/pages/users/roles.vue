<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Kullanıcı Rolleri</h1>
        <p class="text-muted-foreground">
          Sistem rollerini ve izinlerini yönetin
        </p>
      </div>
      <Button variant="outline" class="gap-2" @click="navigateTo('/users')">
        <ArrowLeft class="h-4 w-4" />
        Geri Dön
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin" />
      <span class="ml-2">Roller yükleniyor...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <AlertCircle class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">Hata</h3>
      <p class="text-muted-foreground mb-4">{{ error }}</p>
      <Button variant="outline" @click="loadRoles">
        <RefreshCw class="h-4 w-4 mr-2" />
        Tekrar Dene
      </Button>
    </div>

    <!-- Role Overview Cards -->
    <div v-else class="space-y-6">
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="role in roles" :key="role.id" class="relative">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  :class="[
                    'p-2 rounded-lg',
                    role.color === 'red' && 'bg-red-100 text-red-600',
                    role.color === 'blue' && 'bg-blue-100 text-blue-600',
                    role.color === 'green' && 'bg-green-100 text-green-600',
                    role.color === 'purple' && 'bg-purple-100 text-purple-600',
                    role.color === 'orange' && 'bg-orange-100 text-orange-600',
                  ]"
                >
                  <component
                    :is="getIconComponent(role.icon)"
                    class="h-5 w-5"
                  />
                </div>
                <div>
                  <CardTitle class="text-lg">{{ role.name }}</CardTitle>
                  <p class="text-sm text-muted-foreground">
                    {{ role.userCount }} kullanıcı
                  </p>
                </div>
              </div>
              <Badge :variant="role.isActive ? 'default' : 'secondary'">
                {{ role.isActive ? "Aktif" : "Pasif" }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground mb-4">
              {{ role.description }}
            </p>

            <div class="space-y-3">
              <div>
                <h4 class="text-sm font-medium mb-2">Ana İzinler</h4>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="permission in role.permissions.slice(0, 3)"
                    :key="permission"
                    variant="outline"
                    class="text-xs"
                  >
                    {{ getPermissionLabel(permission) }}
                  </Badge>
                  <Badge
                    v-if="role.permissions.length > 3"
                    variant="secondary"
                    class="text-xs"
                  >
                    +{{ role.permissions.length - 3 }} daha
                  </Badge>
                </div>
              </div>

              <div class="flex justify-between items-center pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  class="gap-2"
                  @click="showRoleDetails(role)"
                >
                  <Eye class="h-3 w-3" />
                  Detaylar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="gap-2"
                  disabled
                  @click="showRolePermissions(role)"
                >
                  <Settings class="h-3 w-3" />
                  Ayarlar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Role Details Modal -->
      <Dialog v-model:open="showDetailsModal">
        <DialogContent class="max-w-2xl">
          <DialogHeader>
            <DialogTitle class="flex items-center gap-3">
              <div
                v-if="selectedRole"
                :class="[
                  'p-2 rounded-lg',
                  selectedRole?.color === 'red' && 'bg-red-100 text-red-600',
                  selectedRole?.color === 'blue' && 'bg-blue-100 text-blue-600',
                  selectedRole?.color === 'green' &&
                    'bg-green-100 text-green-600',
                  selectedRole?.color === 'purple' &&
                    'bg-purple-100 text-purple-600',
                  selectedRole?.color === 'orange' &&
                    'bg-orange-100 text-orange-600',
                ]"
              >
                <component
                  :is="getIconComponent(selectedRole?.icon)"
                  class="h-5 w-5"
                />
              </div>
              {{ selectedRole?.name }} Rolü
            </DialogTitle>
            <DialogDescription>
              {{ selectedRole?.description }}
            </DialogDescription>
          </DialogHeader>

          <div v-if="selectedRole && currentRoleStats" class="space-y-6">
            <!-- Role Statistics -->
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-muted rounded-lg">
                <div class="text-2xl font-bold">
                  {{ currentRoleStats.activeUsers }}
                </div>
                <div class="text-sm text-muted-foreground">Aktif Kullanıcı</div>
              </div>
              <div class="text-center p-4 bg-muted rounded-lg">
                <div class="text-2xl font-bold">
                  {{ currentRolePermissions?.permissions.length || 0 }}
                </div>
                <div class="text-sm text-muted-foreground">İzin</div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-muted rounded-lg">
                <div class="text-2xl font-bold">
                  {{ currentRoleStats.createdThisMonth }}
                </div>
                <div class="text-sm text-muted-foreground">Bu Ay Eklenen</div>
              </div>
              <div class="text-center p-4 bg-muted rounded-lg">
                <div class="text-2xl font-bold">
                  {{ currentRoleStats.userCount }}
                </div>
                <div class="text-sm text-muted-foreground">
                  Toplam Kullanıcı
                </div>
              </div>
            </div>

            <!-- Permissions -->
            <div v-if="currentRolePermissions">
              <h3 class="text-lg font-semibold mb-3">İzinler</h3>
              <div class="grid gap-3">
                <div
                  v-for="(
                    permissions, groupName
                  ) in currentRolePermissions.groups"
                  :key="groupName"
                >
                  <h4 class="text-sm font-medium text-muted-foreground mb-2">
                    {{ groupName }}
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <Badge
                      v-for="permission in permissions"
                      :key="permission"
                      variant="outline"
                      class="text-xs"
                    >
                      {{ getPermissionLabel(permission) }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <!-- Last Login Info -->
            <div v-if="currentRoleStats.lastLogin" class="pt-4 border-t">
              <p class="text-sm text-muted-foreground">
                Son giriş: {{ formatDate(currentRoleStats.lastLogin) }}
              </p>
            </div>
          </div>

          <div
            v-if="loadingDetails"
            class="flex items-center justify-center py-8"
          >
            <Loader2 class="h-6 w-6 animate-spin" />
            <span class="ml-2">Detaylar yükleniyor...</span>
          </div>
        </DialogContent>
      </Dialog>

      <!-- Permission Matrix -->
      <Card>
        <CardHeader>
          <CardTitle>İzin Matrisi</CardTitle>
          <CardDescription>Tüm rollerin izin karşılaştırması</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left p-2">İzin</th>
                  <th
                    v-for="role in roles"
                    :key="role.id"
                    class="text-center p-2 min-w-[100px]"
                  >
                    <div class="flex flex-col items-center gap-1">
                      <component
                        :is="getIconComponent(role.icon)"
                        class="h-4 w-4"
                      />
                      <span class="text-xs">{{ role.name }}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="permission in allPermissions"
                  :key="permission"
                  class="border-b"
                >
                  <td class="p-2 font-medium">
                    {{ getPermissionLabel(permission) }}
                  </td>
                  <td
                    v-for="role in roles"
                    :key="role.id"
                    class="text-center p-2"
                  >
                    <CheckCircle
                      v-if="role.permissions.includes(permission)"
                      class="h-4 w-4 text-green-500 mx-auto"
                    />
                    <X v-else class="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Eye,
  Settings,
  Loader2,
  AlertCircle,
  RefreshCw,
  Shield,
  Home,
  Users,
  Calculator,
  User,
  CheckCircle,
  X,
} from "lucide-vue-next";

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isActive: boolean;
  permissions: string[];
  color: string;
  icon: string;
}

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();
const {
  roles,
  selectedRole,
  rolePermissions: currentRolePermissions,
  roleStats: currentRoleStats,
  loading,
  error,
  loadRoles,
  loadRolePermissions,
  loadRoleStats,
  getPermissionLabel,
} = useRoles();

// Wait for user initialization
await userStore.initializeAuth();

// Check permissions only on client side to avoid SSR issues
if (import.meta.client && userStore.user?.role !== "ADMIN") {
  throw createError({
    statusCode: 403,
    statusMessage: "Bu sayfaya erişim yetkiniz yok",
  });
}

// Modal states
const showDetailsModal = ref(false);
const loadingDetails = ref(false);

// Get all unique permissions from all roles
const allPermissions = computed(() => {
  const permissionSet = new Set<string>();
  roles.value.forEach((role) => {
    role.permissions.forEach((permission) => {
      permissionSet.add(permission);
    });
  });
  return Array.from(permissionSet);
});

// Show role details
const showRoleDetails = async (role: Role) => {
  selectedRole.value = role;
  showDetailsModal.value = true;
  loadingDetails.value = true;

  try {
    await Promise.all([loadRolePermissions(role.id), loadRoleStats(role.id)]);
  } catch (err) {
    console.error("Failed to load role details:", err);
  } finally {
    loadingDetails.value = false;
  }
};

// Show role permissions (future feature)
const showRolePermissions = (role: Role) => {
  // This will be implemented in future versions
  console.log("Edit role permissions:", role);
};

// Get icon component by name
const getIconComponent = (iconName?: string) => {
  const iconMap = {
    Shield: Shield,
    Home: Home,
    Users: Users,
    Calculator: Calculator,
    User: User,
  };
  return iconMap[iconName as keyof typeof iconMap] || User;
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Load roles on mount
onMounted(() => {
  loadRoles();
});
</script>
