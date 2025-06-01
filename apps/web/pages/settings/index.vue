<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Ayarlar</h1>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <!-- Settings Navigation -->
      <Card class="md:col-span-1">
        <CardHeader>
          <CardTitle>Ayar Kategorileri</CardTitle>
        </CardHeader>
        <CardContent>
          <nav class="space-y-2">
            <Button
              variant="ghost"
              class="w-full justify-start"
              :class="{ 'bg-secondary': currentSection === 'profile' }"
              @click="currentSection = 'profile'"
            >
              <User class="mr-2 h-4 w-4" />
              Profil Bilgileri
            </Button>
            <Button
              variant="ghost"
              class="w-full justify-start"
              :class="{ 'bg-secondary': currentSection === 'account' }"
              @click="currentSection = 'account'"
            >
              <Settings class="mr-2 h-4 w-4" />
              Hesap Ayarları
            </Button>
            <Button
              variant="ghost"
              class="w-full justify-start"
              :class="{ 'bg-secondary': currentSection === 'notifications' }"
              @click="currentSection = 'notifications'"
            >
              <Bell class="mr-2 h-4 w-4" />
              Bildirimler
            </Button>
            <Button
              variant="ghost"
              class="w-full justify-start"
              :class="{ 'bg-secondary': currentSection === 'security' }"
              @click="currentSection = 'security'"
            >
              <Shield class="mr-2 h-4 w-4" />
              Güvenlik
            </Button>
          </nav>
        </CardContent>
      </Card>

      <!-- Settings Content -->
      <div class="md:col-span-2 space-y-6">
        <!-- Profile Section -->
        <Card v-if="currentSection === 'profile'">
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
            <CardDescription>Kişisel bilgilerinizi güncelleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <form class="space-y-4" @submit.prevent="updateProfile">
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <Label for="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    v-model="profileForm.firstName"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <Label for="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    v-model="profileForm.lastName"
                    required
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label for="email">E-posta</Label>
                <Input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="phone">Telefon</Label>
                <Input id="phone" v-model="profileForm.phone" type="tel" />
              </div>

              <div class="space-y-2">
                <Label for="address">Adres</Label>
                <Textarea id="address" v-model="profileForm.address" rows="3" />
              </div>

              <div class="space-y-2">
                <Label for="avatar">Profil Fotoğrafı</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  @change="handleAvatarChange"
                />
              </div>

              <Button type="submit" :disabled="profileLoading">
                {{ profileLoading ? "Güncelleniyor..." : "Profili Güncelle" }}
              </Button>
            </form>
          </CardContent>
        </Card>

        <!-- Account Section -->
        <Card v-if="currentSection === 'account'">
          <CardHeader>
            <CardTitle>Hesap Ayarları</CardTitle>
            <CardDescription>Hesap tercihlerinizi yönetin</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Language Settings -->
            <div class="space-y-2">
              <Label for="language">Dil</Label>
              <Select v-model="accountForm.language">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Timezone -->
            <div class="space-y-2">
              <Label for="timezone">Saat Dilimi</Label>
              <Select v-model="accountForm.timezone">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Istanbul"
                    >İstanbul (UTC+3)</SelectItem
                  >
                  <SelectItem value="Europe/London">Londra (UTC+0)</SelectItem>
                  <SelectItem value="America/New_York"
                    >New York (UTC-5)</SelectItem
                  >
                </SelectContent>
              </Select>
            </div>

            <!-- Theme -->
            <div class="space-y-2">
              <Label for="theme">Tema</Label>
              <Select v-model="accountForm.theme">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Açık</SelectItem>
                  <SelectItem value="dark">Koyu</SelectItem>
                  <SelectItem value="system">Sistem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button :disabled="accountLoading" @click="updateAccount">
              {{ accountLoading ? "Güncelleniyor..." : "Ayarları Kaydet" }}
            </Button>
          </CardContent>
        </Card>

        <!-- Notifications Section -->
        <Card v-if="currentSection === 'notifications'">
          <CardHeader>
            <CardTitle>Bildirim Ayarları</CardTitle>
            <CardDescription
              >Hangi bildirimleri almak istediğinizi seçin</CardDescription
            >
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">E-posta Bildirimleri</p>
                  <p class="text-sm text-muted-foreground">
                    Önemli güncellemeler için e-posta alın
                  </p>
                </div>
                <Switch v-model="notificationForm.emailNotifications" />
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Ödeme Hatırlatıcıları</p>
                  <p class="text-sm text-muted-foreground">
                    Yaklaşan ödemeler için hatırlatıcı alın
                  </p>
                </div>
                <Switch v-model="notificationForm.paymentReminders" />
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Bakım Bildirimleri</p>
                  <p class="text-sm text-muted-foreground">
                    Bakım talepleri için bildirim alın
                  </p>
                </div>
                <Switch v-model="notificationForm.maintenanceNotifications" />
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Sözleşme Bildirimleri</p>
                  <p class="text-sm text-muted-foreground">
                    Sözleşme değişiklikleri için bildirim alın
                  </p>
                </div>
                <Switch v-model="notificationForm.contractNotifications" />
              </div>
            </div>

            <Button
              :disabled="notificationLoading"
              @click="updateNotifications"
            >
              {{
                notificationLoading ? "Güncelleniyor..." : "Bildirimleri Kaydet"
              }}
            </Button>
          </CardContent>
        </Card>

        <!-- Security Section -->
        <Card v-if="currentSection === 'security'">
          <CardHeader>
            <CardTitle>Güvenlik Ayarları</CardTitle>
            <CardDescription>Hesap güvenliğinizi yönetin</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Change Password -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium">Şifre Değiştir</h3>
              <form class="space-y-4" @submit.prevent="changePassword">
                <div class="space-y-2">
                  <Label for="currentPassword">Mevcut Şifre</Label>
                  <Input
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    type="password"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <Label for="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    type="password"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <Label for="confirmPassword">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" :disabled="passwordLoading">
                  {{
                    passwordLoading ? "Değiştiriliyor..." : "Şifreyi Değiştir"
                  }}
                </Button>
              </form>
            </div>

            <Separator />

            <!-- Two Factor Authentication -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium">İki Faktörlü Doğrulama</h3>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">İki faktörlü doğrulama</p>
                  <p class="text-sm text-muted-foreground">
                    Hesap güvenliğinizi artırın
                  </p>
                </div>
                <Switch v-model="securityForm.twoFactorEnabled" />
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Settings, Bell, Shield } from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();
const currentSection = ref("profile");

// Loading states
const profileLoading = ref(false);
const accountLoading = ref(false);
const notificationLoading = ref(false);
const passwordLoading = ref(false);

// Form data
const profileForm = reactive({
  firstName: userStore.user?.firstName || "",
  lastName: userStore.user?.lastName || "",
  email: userStore.user?.email || "",
  phone: userStore.user?.phone || "",
  address: userStore.user?.address || "",
});

const accountForm = reactive({
  language: "tr",
  timezone: "Europe/Istanbul",
  theme: "system",
});

const notificationForm = reactive({
  emailNotifications: true,
  paymentReminders: true,
  maintenanceNotifications: true,
  contractNotifications: true,
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const securityForm = reactive({
  twoFactorEnabled: false,
});

// Methods
const updateProfile = async () => {
  profileLoading.value = true;
  try {
    // TODO: Implement API call to update profile
    console.log("Updating profile:", profileForm);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Profil güncellendi!");
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Profil güncellenirken hata oluştu.");
  } finally {
    profileLoading.value = false;
  }
};

const updateAccount = async () => {
  accountLoading.value = true;
  try {
    // TODO: Implement API call to update account settings
    console.log("Updating account:", accountForm);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Hesap ayarları güncellendi!");
  } catch (error) {
    console.error("Error updating account:", error);
    alert("Hesap ayarları güncellenirken hata oluştu.");
  } finally {
    accountLoading.value = false;
  }
};

const updateNotifications = async () => {
  notificationLoading.value = true;
  try {
    // TODO: Implement API call to update notification settings
    console.log("Updating notifications:", notificationForm);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Bildirim ayarları güncellendi!");
  } catch (error) {
    console.error("Error updating notifications:", error);
    alert("Bildirim ayarları güncellenirken hata oluştu.");
  } finally {
    notificationLoading.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert("Yeni şifreler eşleşmiyor!");
    return;
  }

  passwordLoading.value = true;
  try {
    // TODO: Implement API call to change password
    console.log("Changing password");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Şifre değiştirildi!");

    // Clear form
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
  } catch (error) {
    console.error("Error changing password:", error);
    alert("Şifre değiştirilirken hata oluştu.");
  } finally {
    passwordLoading.value = false;
  }
};

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    // TODO: Implement file upload
    console.log("Avatar file selected:", file);
  }
};
</script>
