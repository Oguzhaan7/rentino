<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div
      v-if="loading && !property"
      class="flex items-center justify-center p-8"
    >
      <div
        class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"
      />
    </div>

    <!-- Error state -->
    <div
      v-else-if="loadError"
      class="bg-destructive/15 text-destructive px-4 py-2 rounded-md"
    >
      {{ loadError }}
    </div>

    <!-- Property not found -->
    <div v-else-if="!property" class="text-center p-8">
      <h2 class="text-2xl font-bold">Mülk bulunamadı</h2>
      <p class="text-muted-foreground mt-2">
        Bu mülk mevcut değil veya erişim yetkiniz bulunmamaktadır.
      </p>
      <Button class="mt-4" @click="navigateTo('/properties')">
        Mülk Listesine Dön
      </Button>
    </div>

    <!-- Edit form -->
    <div v-else class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            @click="navigateTo(`/properties/${property.id}`)"
          >
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <div>
            <h1 class="text-3xl font-bold tracking-tight">Mülk Düzenle</h1>
            <p class="text-muted-foreground">{{ property.title }}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mülk Bilgilerini Güncelle</CardTitle>
          <CardDescription> Mülkün bilgilerini güncelleyin </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-6" @submit.prevent="handleSubmit">
            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="title">Başlık *</Label>
                <Input
                  id="title"
                  v-model="form.title"
                  placeholder="Mülk başlığı"
                  :class="{ 'border-destructive': errors.title }"
                />
                <p v-if="errors.title" class="text-sm text-destructive">
                  {{ errors.title }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="type">Tür *</Label>
                <Select v-model="form.type">
                  <SelectTrigger :class="{ 'border-destructive': errors.type }">
                    <SelectValue placeholder="Mülk türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APARTMENT">Daire</SelectItem>
                    <SelectItem value="HOUSE">Ev</SelectItem>
                    <SelectItem value="OFFICE">Ofis</SelectItem>
                    <SelectItem value="SHOP">Dükkan</SelectItem>
                    <SelectItem value="LAND">Arsa</SelectItem>
                    <SelectItem value="WAREHOUSE">Depo</SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="errors.type" class="text-sm text-destructive">
                  {{ errors.type }}
                </p>
              </div>
            </div>

            <!-- Address Information -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="address">Adres *</Label>
                <Input
                  id="address"
                  v-model="form.address"
                  placeholder="Sokak, mahalle, no"
                  :class="{ 'border-destructive': errors.address }"
                />
                <p v-if="errors.address" class="text-sm text-destructive">
                  {{ errors.address }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="city">Şehir *</Label>
                <Input
                  id="city"
                  v-model="form.city"
                  placeholder="Şehir"
                  :class="{ 'border-destructive': errors.city }"
                />
                <p v-if="errors.city" class="text-sm text-destructive">
                  {{ errors.city }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="district">İlçe</Label>
                <Input
                  id="district"
                  v-model="form.district"
                  placeholder="İlçe"
                />
              </div>
            </div>

            <!-- Property Details -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="space-y-2">
                <Label for="totalArea">Toplam Alan (m²) *</Label>
                <Input
                  id="totalArea"
                  v-model.number="form.totalArea"
                  type="number"
                  placeholder="150"
                  :class="{ 'border-destructive': errors.totalArea }"
                />
                <p v-if="errors.totalArea" class="text-sm text-destructive">
                  {{ errors.totalArea }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="numberOfRooms">Oda Sayısı</Label>
                <Input
                  id="numberOfRooms"
                  v-model.number="form.numberOfRooms"
                  type="number"
                  placeholder="3"
                />
              </div>

              <div class="space-y-2">
                <Label for="floor">Kat</Label>
                <Input
                  id="floor"
                  v-model.number="form.floor"
                  type="number"
                  placeholder="2"
                />
              </div>

              <div class="space-y-2">
                <Label for="status">Durum *</Label>
                <Select v-model="form.status">
                  <SelectTrigger
                    :class="{ 'border-destructive': errors.status }"
                  >
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Müsait</SelectItem>
                    <SelectItem value="RENTED">Kiralanmış</SelectItem>
                    <SelectItem value="UNDER_MAINTENANCE">Bakımda</SelectItem>
                    <SelectItem value="ON_SALE">Satılık</SelectItem>
                    <SelectItem value="SOLD">Satıldı</SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="errors.status" class="text-sm text-destructive">
                  {{ errors.status }}
                </p>
              </div>
            </div>

            <!-- Building Selection -->
            <div class="space-y-2">
              <Label for="buildingId">Bina</Label>
              <Select v-model="form.buildingId">
                <SelectTrigger>
                  <SelectValue placeholder="Bina seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Bina seçilmedi</SelectItem>
                  <SelectItem
                    v-for="building in buildings"
                    :key="building.id"
                    :value="building.id"
                  >
                    {{ building.name }} - {{ building.address }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <Label for="description">Açıklama</Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="Mülk hakkında ek bilgiler..."
                rows="4"
              />
            </div>

            <!-- Active Status -->
            <div class="flex items-center space-x-2">
              <Checkbox id="isActive" v-model:checked="form.isActive" />
              <Label for="isActive">Bu mülk aktif</Label>
            </div>

            <!-- Error Display -->
            <div
              v-if="submitError"
              class="bg-destructive/15 text-destructive px-4 py-2 rounded-md"
            >
              {{ submitError }}
            </div>

            <!-- Form Actions -->
            <div class="flex gap-4 pt-4">
              <Button type="submit" :disabled="loading">
                <Save class="mr-2 h-4 w-4" />
                {{ loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet" }}
              </Button>
              <Button
                type="button"
                variant="outline"
                @click="navigateTo(`/properties/${property.id}`)"
              >
                İptal
              </Button>
              <Button
                v-if="userStore.canManageProperties"
                type="button"
                variant="destructive"
                :disabled="loading"
                @click="handleDelete"
              >
                <Trash2 class="mr-2 h-4 w-4" />
                Sil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "~/stores/user";
import { useProperties } from "~/composables/useProperties";
import { useBuildings } from "~/composables/useBuildings";
import type { Property, PropertyType, PropertyStatus } from "~/types/property";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Trash2 } from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const route = useRoute();
const userStore = useUserStore();
const {
  currentProperty,
  updateProperty,
  deleteProperty,
  loadProperty,
  loading,
  error,
} = useProperties();
const { buildings, loadBuildings } = useBuildings();

const property = computed(() => currentProperty.value);
const loadError = computed(() => error.value);
const submitError = ref<string>("");
const errors = reactive<Record<string, string>>({});

const form = reactive<{
  title: string;
  type: PropertyType | "";
  address: string;
  city: string;
  district: string;
  totalArea: number | "";
  numberOfRooms: number | "";
  floor: number | "";
  status: PropertyStatus;
  buildingId: string;
  description: string;
  isActive: boolean;
}>({
  title: "",
  type: "",
  address: "",
  city: "",
  district: "",
  totalArea: "",
  numberOfRooms: "",
  floor: "",
  status: "AVAILABLE",
  buildingId: "",
  description: "",
  isActive: true,
});

// Load property details
const loadPropertyData = async () => {
  try {
    const propertyId = route.params.id as string;
    await loadProperty(propertyId);

    if (currentProperty.value) {
      // Populate form with property data
      const data = currentProperty.value;
      form.title = data.title;
      form.type = data.type;
      form.address = data.address;
      form.city = data.city;
      form.district = data.district || "";
      form.totalArea = data.totalArea;
      form.numberOfRooms = data.numberOfRooms || "";
      form.floor = data.floor || "";
      form.status = data.status;
      form.buildingId = data.buildingId || "";
      form.description = data.description || "";
      form.isActive = data.isActive;
    }
  } catch (err: unknown) {
    console.error("Error loading property:", err);
  }
};

// Form validation
const validateForm = (): boolean => {
  // Clear previous errors
  Object.assign(errors, {});

  let isValid = true;

  if (!form.title.trim()) {
    errors.title = "Başlık gereklidir";
    isValid = false;
  }

  if (!form.type) {
    errors.type = "Mülk türü seçiniz";
    isValid = false;
  }

  if (!form.address.trim()) {
    errors.address = "Adres gereklidir";
    isValid = false;
  }

  if (!form.city.trim()) {
    errors.city = "Şehir gereklidir";
    isValid = false;
  }

  if (!form.totalArea || form.totalArea <= 0) {
    errors.totalArea = "Geçerli bir alan giriniz";
    isValid = false;
  }

  if (!form.status) {
    errors.status = "Durum seçiniz";
    isValid = false;
  }

  return isValid;
};

// Form submission handler
const handleSubmit = async () => {
  if (!userStore.canManageProperties) {
    submitError.value = "Bu işlem için yetkiniz bulunmamaktadır.";
    return;
  }

  if (!validateForm()) {
    return;
  }

  if (!property.value) {
    return;
  }

  submitError.value = "";

  try {
    const propertyData: Partial<Property> = {
      title: form.title,
      type: form.type as PropertyType,
      address: form.address,
      city: form.city,
      district: form.district || "",
      totalArea: Number(form.totalArea),
      numberOfRooms: form.numberOfRooms
        ? Number(form.numberOfRooms)
        : undefined,
      floor: form.floor ? Number(form.floor) : undefined,
      status: form.status,
      buildingId: form.buildingId || undefined,
      description: form.description || undefined,
      isActive: form.isActive,
    };

    await updateProperty(property.value.id, propertyData);

    // Redirect to property view on success
    navigateTo(`/properties/${property.value.id}`);
  } catch (error: unknown) {
    console.error("Error updating property:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Mülk güncellenirken bir hata oluştu.";
    submitError.value = errorMessage;
  }
};

// Delete handler
const handleDelete = async () => {
  if (!property.value || !userStore.canManageProperties) {
    return;
  }

  const confirmed = confirm(
    `"${property.value.title}" adlı mülkü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteProperty(property.value.id);

    // Redirect to properties list on success
    navigateTo("/properties");
  } catch (error: unknown) {
    console.error("Error deleting property:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Mülk silinirken bir hata oluştu.";
    submitError.value = errorMessage;
  }
};

// Load data on mount
onMounted(async () => {
  await Promise.all([loadPropertyData(), loadBuildings()]);
});
</script>
