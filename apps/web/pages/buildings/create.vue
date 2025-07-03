<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Yeni Bina Ekle</h1>
      <Button variant="outline" @click="navigateTo('/buildings')">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Geri Dön
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Bina Bilgileri</CardTitle>
        <CardDescription>
          Yeni bina için gerekli bilgileri girin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-6" @submit.prevent="createBuilding">
          <!-- Basic Information -->
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="name"
                >Bina Adı <span class="text-red-500">*</span></Label
              >
              <Input
                id="name"
                v-model="form.name"
                placeholder="Örn: Bahçelievler Sitesi A Blok"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="managerId"
                >Yönetici <span class="text-red-500">*</span></Label
              >
              <Select v-model="form.managerId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Yönetici seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="manager in managers"
                    :key="manager.id"
                    :value="manager.id"
                  >
                    {{ manager.firstName }} {{ manager.lastName }} ({{
                      manager.role
                    }})
                  </SelectItem>
                </SelectContent>
              </Select>
              <!-- Debug info -->
              <div class="text-xs text-gray-500">
                Yönetici sayısı: {{ managers.length }}
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="address"
                >Adres <span class="text-red-500">*</span></Label
              >
              <Textarea
                id="address"
                v-model="form.address"
                placeholder="Tam adres bilgisini girin"
                required
              />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="city"
                  >Şehir <span class="text-red-500">*</span></Label
                >
                <Input
                  id="city"
                  v-model="form.city"
                  placeholder="Örn: İstanbul"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="district"
                  >İlçe <span class="text-red-500">*</span></Label
                >
                <Input
                  id="district"
                  v-model="form.district"
                  placeholder="Örn: Bahçelievler"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Building Details -->
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="totalUnits"
                >Toplam Daire Sayısı <span class="text-red-500">*</span></Label
              >
              <Input
                id="totalUnits"
                v-model.number="form.totalUnits"
                type="number"
                min="1"
                max="500"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="constructionYear">Yapım Yılı</Label>
              <Input
                id="constructionYear"
                v-model.number="form.constructionYear"
                type="number"
                min="1900"
                :max="new Date().getFullYear()"
                placeholder="Örn: 2020"
              />
            </div>
          </div>
          <!-- Status -->
          <div class="space-y-2">
            <Label for="isActive">Durum</Label>
            <div class="flex items-center space-x-2">
              <Checkbox id="isActive" v-model:checked="form.isActive" />
              <Label for="isActive" class="text-sm font-normal">
                Bina aktif durumda
              </Label>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="text-red-500 text-sm">
            {{ error }}
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-4">
            <Button type="submit" :disabled="loading || !isFormValid">
              <Building2 class="mr-2 h-4 w-4" />
              {{ loading ? "Kaydediliyor..." : "Binayı Kaydet" }}
            </Button>
            <Button
              type="button"
              variant="outline"
              @click="navigateTo('/buildings')"
            >
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { CreateBuildingData } from "~/types/building";
import { useUsers } from "~/composables/useUsers";
import { useBuildings } from "~/composables/useBuildings";
import { ArrowLeft, Building2 } from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();

// Use buildings and users composables
const { createBuilding: createBuildingAPI, loading, error } = useBuildings();
const { managers, loadManagers } = useUsers();

const form = reactive<CreateBuildingData>({
  name: "",
  address: "",
  city: "",
  district: "",
  totalUnits: 1,
  managerId: "",
  constructionYear: undefined,
  isActive: true,
});

// Form validation
const isFormValid = computed(() => {
  return (
    form.name.trim() !== "" &&
    form.address.trim() !== "" &&
    form.city.trim() !== "" &&
    form.district.trim() !== "" &&
    form.totalUnits > 0 &&
    form.managerId !== ""
  );
});

// Load managers on component mount
onMounted(async () => {
  try {
    await loadManagers();
    console.log("Managers loaded:", unref(managers));
  } catch (error) {
    console.error("Error loading managers:", error);
  }
});

const createBuilding = async () => {
  if (
    !(userStore.user?.role === "ADMIN" || userStore.user?.role === "MANAGER")
  ) {
    alert("Bu işlem için yetkiniz bulunmamaktadır.");
    return;
  }

  if (!isFormValid.value) {
    alert("Lütfen tüm gerekli alanları doldurun.");
    return;
  }

  try {
    await createBuildingAPI(form);

    // Redirect to buildings list
    navigateTo("/buildings");
  } catch (error) {
    console.error("Error creating building:", error);
    alert("Bina oluşturulurken bir hata oluştu.");
  }
};
</script>
