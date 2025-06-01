<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"
      />
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center py-8">
      <div class="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
        {{ error }}
      </div>
    </div>

    <!-- Edit Form -->
    <div v-if="currentBuilding && !loading" class="space-y-6">
      <!-- Header -->
      <div>
        <Button variant="ghost" class="mb-4" @click="navigateTo('/buildings')">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Binalara Dön
        </Button>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ currentBuilding.name }} - Düzenle
        </h1>
        <p class="text-muted-foreground">Bina bilgilerini güncelleyin</p>
      </div>

      <!-- Edit Form -->
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Basic Information -->
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <Label for="name">Bina Adı *</Label>
                <Input
                  id="name"
                  v-model="form.name"
                  placeholder="Bina adını giriniz"
                  required
                />
              </div>
              <div>
                <Label for="address">Adres *</Label>
                <Textarea
                  id="address"
                  v-model="form.address"
                  placeholder="Binanın tam adresini giriniz"
                  rows="3"
                  required
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label for="city">Şehir *</Label>
                  <Input
                    id="city"
                    v-model="form.city"
                    placeholder="Şehir"
                    required
                  />
                </div>
                <div>
                  <Label for="district">İlçe *</Label>
                  <Input
                    id="district"
                    v-model="form.district"
                    placeholder="İlçe"
                    required
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label for="totalUnits">Toplam Daire Sayısı *</Label>
                  <Input
                    id="totalUnits"
                    v-model="form.totalUnits"
                    type="number"
                    min="1"
                    placeholder="Daire sayısı"
                    required
                  />
                </div>
                <div>
                  <Label for="constructionYear">Yapım Yılı</Label>
                  <Input
                    id="constructionYear"
                    v-model="form.constructionYear"
                    type="number"
                    min="1900"
                    :max="new Date().getFullYear()"
                    placeholder="Yapım yılı"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Manager & Status -->
          <Card>
            <CardHeader>
              <CardTitle>Yönetici ve Durum</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <Label for="managerId">Yönetici *</Label>
                <Select v-model="form.managerId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Yönetici seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="manager in managers"
                      :key="manager.id"
                      :value="manager.id"
                    >
                      {{ manager.firstName }} {{ manager.lastName }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="flex items-center space-x-2">
                <Checkbox id="isActive" v-model:checked="form.isActive" />
                <Label for="isActive">Aktif</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            @click="navigateTo('/buildings')"
          >
            İptal
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <div
              v-if="isSubmitting"
              class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Güncelle
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UpdateBuildingData } from "~/types/building";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const route = useRoute();

const { currentBuilding, loading, error, loadBuilding, updateBuilding } =
  useBuildings();

const { managers, loadManagers } = useUsers();

// Form state
const form = ref<UpdateBuildingData>({
  name: "",
  address: "",
  city: "",
  district: "",
  totalUnits: 0,
  constructionYear: undefined,
  isActive: true,
  managerId: "",
});

const isSubmitting = ref(false);

// Initialize form with building data
const initializeForm = () => {
  if (currentBuilding.value) {
    form.value = {
      name: currentBuilding.value.name,
      address: currentBuilding.value.address,
      city: currentBuilding.value.city,
      district: currentBuilding.value.district,
      totalUnits: currentBuilding.value.totalUnits,
      constructionYear: currentBuilding.value.constructionYear,
      isActive: currentBuilding.value.isActive,
      managerId: currentBuilding.value.managerId,
    };
  }
};

// Handle form submission
const handleSubmit = async () => {
  if (!currentBuilding.value) return;

  isSubmitting.value = true;
  try {
    await updateBuilding(currentBuilding.value.id, form.value);
    console.log("Building updated successfully");
    navigateTo(`/buildings/${currentBuilding.value.id}`);
  } catch (err) {
    console.error("Error updating building:", err);
  } finally {
    isSubmitting.value = false;
  }
};

// Load data on mount
onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    try {
      await Promise.all([loadBuilding(id), loadManagers()]);
      initializeForm();
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }
});

// Watch for building changes to reinitialize form
watch(currentBuilding, () => {
  if (currentBuilding.value) {
    initializeForm();
  }
});
</script>
