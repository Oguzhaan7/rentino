<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Yeni Kullanıcı</h1>
        <p class="text-muted-foreground">Sisteme yeni kullanıcı ekleyin</p>
      </div>
      <Button variant="outline" class="gap-2" @click="navigateTo('/users')">
        <ArrowLeft class="h-4 w-4" />
        Geri Dön
      </Button>
    </div>

    <!-- Form -->
    <Card class="max-w-2xl">
      <CardHeader>
        <CardTitle>Kullanıcı Bilgileri</CardTitle>
        <CardDescription> Yeni kullanıcının bilgilerini girin </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-6" @submit.prevent="createUser">
          <!-- Personal Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="firstName">Ad *</Label>
              <Input
                id="firstName"
                v-model="form.firstName"
                placeholder="Ad"
                required
                :class="{ 'border-red-500': errors.firstName }"
              />
              <p v-if="errors.firstName" class="text-sm text-red-500">
                {{ errors.firstName }}
              </p>
            </div>
            <div class="space-y-2">
              <Label for="lastName">Soyad *</Label>
              <Input
                id="lastName"
                v-model="form.lastName"
                placeholder="Soyad"
                required
                :class="{ 'border-red-500': errors.lastName }"
              />
              <p v-if="errors.lastName" class="text-sm text-red-500">
                {{ errors.lastName }}
              </p>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="email">Email *</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="email@example.com"
                required
                :class="{ 'border-red-500': errors.email }"
              />
              <p v-if="errors.email" class="text-sm text-red-500">
                {{ errors.email }}
              </p>
            </div>
            <div class="space-y-2">
              <Label for="phone">Telefon</Label>
              <Input
                id="phone"
                v-model="form.phone"
                placeholder="+90 5XX XXX XX XX"
                :class="{ 'border-red-500': errors.phone }"
              />
              <p v-if="errors.phone" class="text-sm text-red-500">
                {{ errors.phone }}
              </p>
            </div>
          </div>

          <!-- Role and Status -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="role">Rol *</Label>
              <Select v-model="form.role" required>
                <SelectTrigger :class="{ 'border-red-500': errors.role }">
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    <div class="flex items-center gap-2">
                      <Shield class="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="PROPERTY_OWNER">
                    <div class="flex items-center gap-2">
                      <Building class="h-4 w-4" />
                      Mülk Sahibi
                    </div>
                  </SelectItem>
                  <SelectItem value="MANAGER">
                    <div class="flex items-center gap-2">
                      <Users class="h-4 w-4" />
                      Yönetici
                    </div>
                  </SelectItem>
                  <SelectItem value="ACCOUNTANT">
                    <div class="flex items-center gap-2">
                      <Calculator class="h-4 w-4" />
                      Muhasebeci
                    </div>
                  </SelectItem>
                  <SelectItem value="TENANT">
                    <div class="flex items-center gap-2">
                      <Home class="h-4 w-4" />
                      Kiracı
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.role" class="text-sm text-red-500">
                {{ errors.role }}
              </p>
            </div>
            <div class="space-y-2">
              <Label for="status">Durum</Label>
              <Select v-model="form.status">
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">
                    <div class="flex items-center gap-2">
                      <CheckCircle class="h-4 w-4 text-green-500" />
                      Aktif
                    </div>
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    <div class="flex items-center gap-2">
                      <Circle class="h-4 w-4 text-gray-500" />
                      Pasif
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <Label for="password">Şifre *</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Güçlü bir şifre girin"
              required
              :class="{ 'border-red-500': errors.password }"
            />
            <p v-if="errors.password" class="text-sm text-red-500">
              {{ errors.password }}
            </p>
            <p class="text-sm text-muted-foreground">
              Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam
              içermelidir.
            </p>
          </div>

          <!-- Additional Settings -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <Checkbox
                id="sendWelcomeEmail"
                v-model:checked="form.sendWelcomeEmail"
              />
              <Label
                for="sendWelcomeEmail"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Hoş geldin e-postası gönder
              </Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox
                id="requirePasswordChange"
                v-model:checked="form.requirePasswordChange"
              />
              <Label
                for="requirePasswordChange"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                İlk girişte şifre değiştirmeyi zorunlu kıl
              </Label>
            </div>
          </div>

          <!-- Role-specific Information -->
          <div
            v-if="form.role === 'TENANT'"
            class="space-y-4 p-4 bg-muted rounded-lg"
          >
            <h3 class="font-medium">Kiracı Bilgileri</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="nationalId">TC Kimlik No</Label>
                <Input
                  id="nationalId"
                  v-model="form.nationalId"
                  placeholder="11111111111"
                />
              </div>
              <div class="space-y-2">
                <Label for="emergencyContact">Acil Durum İletişim</Label>
                <Input
                  id="emergencyContact"
                  v-model="form.emergencyContact"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              @click="navigateTo('/users')"
            >
              İptal
            </Button>
            <Button type="submit" :disabled="isSubmitting" class="gap-2">
              <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
              <UserPlus v-else class="h-4 w-4" />
              {{ isSubmitting ? "Oluşturuluyor..." : "Kullanıcı Oluştur" }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  Shield,
  Building,
  Users,
  Calculator,
  Home,
  CheckCircle,
  Circle,
  UserPlus,
  Loader2,
} from "lucide-vue-next";
import type { User } from "@/types/user";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();
const { createUser: createUserAction } = useUsers();

// Wait for user initialization
await userStore.initializeAuth();

// Check permissions only on client side to avoid SSR issues
if (import.meta.client && userStore.user?.role !== "ADMIN") {
  throw createError({
    statusCode: 403,
    statusMessage: "Bu sayfaya erişim yetkiniz yok",
  });
}

// Form state
const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  status: "ACTIVE",
  password: "",
  nationalId: "",
  emergencyContact: "",
  sendWelcomeEmail: true,
  requirePasswordChange: true,
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

// Validation
const validateForm = () => {
  errors.value = {};

  if (!form.firstName.trim()) {
    errors.value.firstName = "Ad gereklidir";
  }

  if (!form.lastName.trim()) {
    errors.value.lastName = "Soyad gereklidir";
  }

  if (!form.email.trim()) {
    errors.value.email = "Email gereklidir";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = "Geçerli bir email adresi girin";
  }

  if (!form.role) {
    errors.value.role = "Rol seçimi gereklidir";
  }

  if (!form.password.trim()) {
    errors.value.password = "Şifre gereklidir";
  } else if (form.password.length < 8) {
    errors.value.password = "Şifre en az 8 karakter olmalıdır";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    errors.value.password = "Şifre büyük harf, küçük harf ve rakam içermelidir";
  }

  if (form.phone && !/^\+90\s5\d{2}\s\d{3}\s\d{2}\s\d{2}$/.test(form.phone)) {
    errors.value.phone = "Geçerli telefon numarası formatı: +90 5XX XXX XX XX";
  }

  return Object.keys(errors.value).length === 0;
};

// Submit handler
const createUser = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const userData = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      role: form.role as User["role"],
      isActive: form.status === "ACTIVE",
      password: form.password,
      nationalId: form.nationalId || undefined,
      emergencyContact: form.emergencyContact || undefined,
    };

    await createUserAction(userData);

    alert("Kullanıcı başarıyla oluşturuldu");
    await navigateTo("/users");
  } catch (error) {
    console.error("Kullanıcı oluşturulurken hata oluştu:", error);
    alert("Kullanıcı oluşturulurken hata oluştu");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
