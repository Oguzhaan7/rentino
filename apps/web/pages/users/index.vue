<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
        <p class="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
      </div>
      <Button class="gap-2" @click="navigateTo('/users/create')">
        <Plus class="h-4 w-4" />
        Yeni Kullanıcı
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Toplam Kullanıcı</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalUsers }}</div>
          <p class="text-xs text-muted-foreground">
            +{{ newUsersThisMonth }} bu ay
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Aktif Kullanıcı</CardTitle>
          <UserCheck class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ activeUsers }}</div>
          <p class="text-xs text-muted-foreground">
            %{{ Math.round((activeUsers / totalUsers) * 100) }} oranında
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Admin Kullanıcı</CardTitle>
          <Shield class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ adminUsers }}</div>
          <p class="text-xs text-muted-foreground">Yönetici yetkisi</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Kiracı Kullanıcı</CardTitle>
          <Home class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ tenantUsers }}</div>
          <p class="text-xs text-muted-foreground">Aktif kiracı</p>
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
              placeholder="Kullanıcı ara..."
              class="w-full"
            />
          </div>
          <Select v-model="selectedRole">
            <SelectTrigger class="w-[200px]">
              <SelectValue placeholder="Rol seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Roller</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="PROPERTY_OWNER">Mülk Sahibi</SelectItem>
              <SelectItem value="MANAGER">Yönetici</SelectItem>
              <SelectItem value="ACCOUNTANT">Muhasebeci</SelectItem>
              <SelectItem value="TENANT">Kiracı</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="selectedStatus">
            <SelectTrigger class="w-[200px]">
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="INACTIVE">Pasif</SelectItem>
              <SelectItem value="SUSPENDED">Askıya Alınmış</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Users Table -->
    <Card>
      <CardHeader>
        <CardTitle>Kullanıcılar</CardTitle>
        <CardDescription> Sistem kullanıcılarının listesi </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Giriş</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead class="w-[100px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="user in filteredUsers" :key="user.id">
                <TableCell>
                  <div class="flex items-center gap-3">
                    <Avatar class="h-8 w-8">
                      <AvatarImage :src="user.avatar || ''" />
                      <AvatarFallback>{{
                        getUserInitials(user)
                      }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div class="font-medium">
                        {{ user.firstName }} {{ user.lastName }}
                      </div>
                      <div class="text-sm text-muted-foreground">
                        {{ user.phone || "Telefon yok" }}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{{ user.email }}</TableCell>
                <TableCell>
                  <Badge :variant="getRoleVariant(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(user.isActive)">
                    {{ getStatusLabel(user.isActive) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="text-sm">Henüz mevcut değil</div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    {{ formatDate(user.createdAt) }}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" class="h-8 w-8 p-0">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="editUser(user)">
                        <Edit class="mr-2 h-4 w-4" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        :class="
                          user.isActive ? 'text-orange-600' : 'text-green-600'
                        "
                        @click="toggleUserStatus(user)"
                      >
                        <Ban v-if="user.isActive" class="mr-2 h-4 w-4" />
                        <CheckCircle v-else class="mr-2 h-4 w-4" />
                        {{ user.isActive ? "Pasifleştir" : "Aktifleştir" }}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        class="text-red-600"
                        @click="deleteUser(user)"
                      >
                        <Trash2 class="mr-2 h-4 w-4" />
                        Sil
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
  </div>
</template>

<script setup lang="ts">
import {
  Plus,
  Users,
  UserCheck,
  Shield,
  Home,
  MoreHorizontal,
  Edit,
  Ban,
  CheckCircle,
  Trash2,
} from "lucide-vue-next";
import type { User } from "@/types/user";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();
const {
  users,
  stats,
  loading: _loading,
  error: _error,
  loadUsers,
  loadUserStats,
  deleteUser: deleteUserAction,
  toggleUserStatus: toggleUserStatusAction,
} = useUsers();

// Wait for user initialization before checking permissions
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
const selectedRole = ref("all");
const selectedStatus = ref("all");

// Computed stats
const totalUsers = computed(() => stats.value?.total || 0);
const activeUsers = computed(() => stats.value?.active || 0);
const adminUsers = computed(() => stats.value?.byRole?.ADMIN || 0);
const tenantUsers = computed(() => stats.value?.byRole?.TENANT || 0);
const newUsersThisMonth = computed(() => stats.value?.newThisMonth || 0);

// Filtered users
const filteredUsers = computed(() => {
  if (!users.value) return [];

  return users.value.filter((user) => {
    const matchesSearch =
      searchQuery.value === "" ||
      user.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesRole =
      selectedRole.value === "all" || user.role === selectedRole.value;

    const matchesStatus =
      selectedStatus.value === "all" ||
      (selectedStatus.value === "ACTIVE" && user.isActive) ||
      (selectedStatus.value === "INACTIVE" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });
});

// Helper functions
const getUserInitials = (user: User) => {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN: "Admin",
    PROPERTY_OWNER: "Mülk Sahibi",
    MANAGER: "Yönetici",
    ACCOUNTANT: "Muhasebeci",
    TENANT: "Kiracı",
  };
  return labels[role] || role;
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
    TENANT: "secondary",
  };
  return variants[role] || "default";
};

const getStatusLabel = (isActive: boolean) => {
  return isActive ? "Aktif" : "Pasif";
};

const getStatusVariant = (isActive: boolean): "default" | "secondary" => {
  return isActive ? "default" : "secondary";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Actions
const editUser = (user: User) => {
  navigateTo(`/users/${user.id}/edit`);
};

const toggleUserStatus = async (user: User) => {
  try {
    await toggleUserStatusAction(user.id, !user.isActive);
  } catch (error) {
    console.error("Error toggling user status:", error);
  }
};

const deleteUser = async (user: User) => {
  if (
    confirm(
      `${user.firstName} ${user.lastName} kullanıcısını silmek istediğinize emin misiniz?`
    )
  ) {
    try {
      await deleteUserAction(user.id);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
};

// Load data on mount
const loadData = async () => {
  try {
    await Promise.all([loadUsers({ page: 1, limit: 100 }), loadUserStats()]);
  } catch (error) {
    console.error("Error loading users data:", error);
  }
};

onMounted(loadData);
</script>
