<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Yeni Kiracı</h1>
        <p class="text-muted-foreground">Sisteme yeni kiracı ekleyin</p>
      </div>
      <Button variant="outline" class="gap-2" @click="navigateTo('/tenants')">
        <ArrowLeft class="h-4 w-4" />
        Geri Dön
      </Button>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Personal Information -->
        <Card>
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
            <CardDescription>
              Kiracının kişisel bilgilerini girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form class="space-y-4" @submit.prevent="createTenant">
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
                  <Label for="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    v-model="form.phone"
                    placeholder="+90 5XX XXX XX XX"
                    required
                    :class="{ 'border-red-500': errors.phone }"
                  />
                  <p v-if="errors.phone" class="text-sm text-red-500">
                    {{ errors.phone }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="nationalId">TC Kimlik No *</Label>
                  <Input
                    id="nationalId"
                    v-model="form.nationalId"
                    placeholder="11111111111"
                    required
                    :class="{ 'border-red-500': errors.nationalId }"
                  />
                  <p v-if="errors.nationalId" class="text-sm text-red-500">
                    {{ errors.nationalId }}
                  </p>
                </div>
                <div class="space-y-2">
                  <Label for="birthDate">Doğum Tarihi</Label>
                  <Input id="birthDate" v-model="form.birthDate" type="date" />
                </div>
              </div>

              <div class="space-y-2">
                <Label for="address">Adres</Label>
                <Textarea
                  id="address"
                  v-model="form.address"
                  placeholder="Tam adres"
                  rows="3"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Emergency Contact -->
        <Card>
          <CardHeader>
            <CardTitle>Acil Durum İletişim</CardTitle>
            <CardDescription>
              Acil durumlarda ulaşılabilecek kişi bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="emergencyContactName">İsim</Label>
                <Input
                  id="emergencyContactName"
                  v-model="form.emergencyContact.name"
                  placeholder="Acil durum iletişim ismi"
                />
              </div>
              <div class="space-y-2">
                <Label for="emergencyContactPhone">Telefon</Label>
                <Input
                  id="emergencyContactPhone"
                  v-model="form.emergencyContact.phone"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="emergencyContactRelation">Yakınlık</Label>
              <Select v-model="form.emergencyContact.relation">
                <SelectTrigger>
                  <SelectValue placeholder="Yakınlık derecesi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PARENT">Ebeveyn</SelectItem>
                  <SelectItem value="SIBLING">Kardeş</SelectItem>
                  <SelectItem value="SPOUSE">Eş</SelectItem>
                  <SelectItem value="FRIEND">Arkadaş</SelectItem>
                  <SelectItem value="OTHER">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <!-- Employment Information -->
        <Card>
          <CardHeader>
            <CardTitle>İş Bilgileri</CardTitle>
            <CardDescription> Kiracının iş ve gelir bilgileri </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="employmentStatus">İstihdam Durumu</Label>
                <Select v-model="form.employment.status">
                  <SelectTrigger>
                    <SelectValue placeholder="İstihdam durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYED">Çalışan</SelectItem>
                    <SelectItem value="SELF_EMPLOYED"
                      >Serbest Meslek</SelectItem
                    >
                    <SelectItem value="UNEMPLOYED">İşsiz</SelectItem>
                    <SelectItem value="STUDENT">Öğrenci</SelectItem>
                    <SelectItem value="RETIRED">Emekli</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label for="monthlyIncome">Aylık Gelir</Label>
                <Input
                  id="monthlyIncome"
                  v-model.number="form.employment.monthlyIncome"
                  type="number"
                  placeholder="0"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="employer">İşveren/Şirket</Label>
              <Input
                id="employer"
                v-model="form.employment.employer"
                placeholder="Şirket adı"
              />
            </div>
            <div class="space-y-2">
              <Label for="jobTitle">Pozisyon</Label>
              <Input
                id="jobTitle"
                v-model="form.employment.jobTitle"
                placeholder="İş unvanı"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Submit Button -->
        <div class="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            @click="navigateTo('/tenants')"
          >
            İptal
          </Button>
          <Button :disabled="isSubmitting" class="gap-2" @click="createTenant">
            <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
            <UserPlus v-else class="h-4 w-4" />
            {{ isSubmitting ? "Oluşturuluyor..." : "Kiracı Oluştur" }}
          </Button>
        </div>
      </div>

      <!-- Property Assignment -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mülk Atama</CardTitle>
            <CardDescription> Kiracıya atanacak mülkü seçin </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="property">Mülk *</Label>
              <Select v-model="form.propertyId" required>
                <SelectTrigger :class="{ 'border-red-500': errors.propertyId }">
                  <SelectValue placeholder="Mülk seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="property in availableProperties"
                    :key="property.id"
                    :value="property.id"
                  >
                    <div class="flex flex-col">
                      <span class="font-medium">{{ property.name }}</span>
                      <span class="text-sm text-muted-foreground">{{
                        property.address
                      }}</span>
                      <span class="text-sm text-green-600"
                        >{{ formatCurrency(property.rent) }}/ay</span
                      >
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.propertyId" class="text-sm text-red-500">
                {{ errors.propertyId }}
              </p>
            </div>

            <!-- Selected Property Details -->
            <div v-if="selectedProperty" class="p-4 bg-muted rounded-lg">
              <h4 class="font-medium mb-2">Seçili Mülk Detayları</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Aylık Kira:</span>
                  <span class="font-medium">{{
                    formatCurrency(selectedProperty.rent)
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Depozito:</span>
                  <span class="font-medium">{{
                    formatCurrency(selectedProperty.deposit)
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Oda Sayısı:</span>
                  <span>{{ selectedProperty.rooms }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Alan:</span>
                  <span>{{ selectedProperty.area }} m²</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Contract Information -->
        <Card>
          <CardHeader>
            <CardTitle>Sözleşme Bilgileri</CardTitle>
            <CardDescription> Kiralama sözleşmesi detayları </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-2">
                <Label for="startDate">Başlangıç Tarihi *</Label>
                <Input
                  id="startDate"
                  v-model="form.contract.startDate"
                  type="date"
                  required
                  :class="{ 'border-red-500': errors.startDate }"
                />
                <p v-if="errors.startDate" class="text-sm text-red-500">
                  {{ errors.startDate }}
                </p>
              </div>
              <div class="space-y-2">
                <Label for="endDate">Bitiş Tarihi *</Label>
                <Input
                  id="endDate"
                  v-model="form.contract.endDate"
                  type="date"
                  required
                  :class="{ 'border-red-500': errors.endDate }"
                />
                <p v-if="errors.endDate" class="text-sm text-red-500">
                  {{ errors.endDate }}
                </p>
              </div>
              <div class="space-y-2">
                <Label for="paymentDay">Ödeme Günü</Label>
                <Select v-model="form.contract.paymentDay">
                  <SelectTrigger>
                    <SelectValue placeholder="Ayın kaçı" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="day in 31"
                      :key="day"
                      :value="day.toString()"
                    >
                      {{ day }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Checkbox
                id="createUserAccount"
                v-model:checked="form.createUserAccount"
              />
              <Label
                for="createUserAccount"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Kiracı için kullanıcı hesabı oluştur
              </Label>
            </div>
          </CardContent>
        </Card>

        <!-- Quick Actions -->
        <Card>
          <CardHeader>
            <CardTitle>Ek İşlemler</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Button variant="outline" class="w-full gap-2">
              <Upload class="h-4 w-4" />
              Belge Yükle
            </Button>
            <Button variant="outline" class="w-full gap-2">
              <Camera class="h-4 w-4" />
              Fotoğraf Ekle
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, UserPlus, Loader2, Upload, Camera } from "lucide-vue-next";

// Form state
const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  nationalId: "",
  birthDate: "",
  address: "",
  propertyId: "",
  emergencyContact: {
    name: "",
    phone: "",
    relation: "",
  },
  employment: {
    status: "",
    monthlyIncome: 0,
    employer: "",
    jobTitle: "",
  },
  contract: {
    startDate: "",
    endDate: "",
    paymentDay: "1",
  },
  createUserAccount: true,
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

// Mock available properties
const availableProperties = ref([
  {
    id: "1",
    name: "Merkez Plaza A1",
    address: "Kadıköy, İstanbul",
    rent: 5000,
    deposit: 10000,
    rooms: "2+1",
    area: 85,
  },
  {
    id: "2",
    name: "Güneş Residence B2",
    address: "Beşiktaş, İstanbul",
    rent: 7500,
    deposit: 15000,
    rooms: "3+1",
    area: 120,
  },
  {
    id: "3",
    name: "Yıldız Apartmanı C3",
    address: "Şişli, İstanbul",
    rent: 4500,
    deposit: 9000,
    rooms: "1+1",
    area: 65,
  },
]);

// Selected property
const selectedProperty = computed(() => {
  return availableProperties.value.find((p) => p.id === form.propertyId);
});

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

  if (!form.phone.trim()) {
    errors.value.phone = "Telefon gereklidir";
  }

  if (!form.nationalId.trim()) {
    errors.value.nationalId = "TC Kimlik No gereklidir";
  } else if (!/^\d{11}$/.test(form.nationalId)) {
    errors.value.nationalId = "TC Kimlik No 11 haneli olmalıdır";
  }

  if (!form.propertyId) {
    errors.value.propertyId = "Mülk seçimi gereklidir";
  }

  if (!form.contract.startDate) {
    errors.value.startDate = "Başlangıç tarihi gereklidir";
  }

  if (!form.contract.endDate) {
    errors.value.endDate = "Bitiş tarihi gereklidir";
  } else if (
    new Date(form.contract.endDate) <= new Date(form.contract.startDate)
  ) {
    errors.value.endDate = "Bitiş tarihi başlangıç tarihinden sonra olmalıdır";
  }

  return Object.keys(errors.value).length === 0;
};

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
};

// Submit handler
const createTenant = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // TODO: API call to create tenant
    // const response = await $fetch('/api/tenants', {
    //   method: 'POST',
    //   body: form
    // })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Success message
    console.log("Kiracı başarıyla oluşturuldu");

    // Redirect to tenants list
    await navigateTo("/tenants");
  } catch (error) {
    console.error("Kiracı oluşturulurken hata oluştu:", error);
    // TODO: Show error message to user
  } finally {
    isSubmitting.value = false;
  }
};

// Check permissions
const userStore = useUserStore();
if (userStore.user?.role !== "ADMIN") {
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
