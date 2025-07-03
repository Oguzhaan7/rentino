<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Sözleşmeler</h1>
      <Button v-if="userStore.canManageContracts" @click="navigateTo('/contracts/create')">
        <Plus class="mr-2 h-4 w-4" />
        Yeni Sözleşme
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
            <Input v-model="searchQuery" placeholder="Sözleşme ara..." />
          </div>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="EXPIRED">Süresi Dolmuş</SelectItem>
              <SelectItem value="TERMINATED">Feshedilmiş</SelectItem>
              <SelectItem value="PENDING">Beklemede</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="typeFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Tip seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="LEASE">Kira</SelectItem>
              <SelectItem value="RENTAL">Kiralama</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Contracts List -->
    <div class="space-y-4">
      <Card
        v-for="contract in filteredContracts"
        :key="contract.id"
        class="cursor-pointer hover:shadow-lg transition-shadow"
      >
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="text-lg">{{ contract.tenantName }}</CardTitle>
              <p class="text-sm text-muted-foreground">
                {{ contract.propertyName }}
              </p>
            </div>
            <Badge :variant="getStatusVariant(contract.status)">
              {{ getStatusText(contract.status) }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 md:grid-cols-4">
            <div>
              <p class="text-sm font-medium">Başlangıç Tarihi</p>
              <p class="text-sm text-muted-foreground">
                {{ formatDate(contract.startDate) }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium">Bitiş Tarihi</p>
              <p class="text-sm text-muted-foreground">
                {{ formatDate(contract.endDate) }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium">Aylık Kira</p>
              <p class="text-sm font-medium text-green-600">₺{{ contract.monthlyRent.toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-sm font-medium">Depozito</p>
              <p class="text-sm text-muted-foreground">₺{{ contract.deposit.toLocaleString() }}</p>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <Button variant="outline" size="sm" @click="viewContract(contract.id)">
              <Eye class="mr-2 h-4 w-4" />
              Görüntüle
            </Button>
            <Button v-if="userStore.canManageContracts" variant="outline" size="sm" @click="editContract(contract.id)">
              <Edit class="mr-2 h-4 w-4" />
              Düzenle
            </Button>
            <Button variant="outline" size="sm" @click="viewPayments(contract.id)">
              <CreditCard class="mr-2 h-4 w-4" />
              Ödemeler
            </Button>
            <Button
              v-if="contract.status === 'ACTIVE' && userStore.canManageContracts"
              variant="destructive"
              size="sm"
              @click="terminateContract(contract.id)"
            >
              <X class="mr-2 h-4 w-4" />
              Feshet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredContracts.length === 0" class="text-center py-12">
      <Contract class="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 class="mt-2 text-sm font-semibold text-gray-900">Sözleşme bulunamadı</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ searchQuery ? "Arama kriterlerinize uygun sözleşme bulunamadı." : "Henüz hiç sözleşme eklenmemiş." }}
      </p>
      <div v-if="userStore.canManageContracts" class="mt-6">
        <Button @click="navigateTo('/contracts/create')">
          <Plus class="mr-2 h-4 w-4" />
          İlk Sözleşmeyi Ekle
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, Edit, CreditCard, X } from "lucide-vue-next";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const userStore = useUserStore();
const searchQuery = ref("");
const statusFilter = ref("all");
const typeFilter = ref("all");
const loading = ref(false);

// Mock data - replace with actual API calls
const contracts = ref([
  {
    id: 1,
    tenantName: "Ahmet Yılmaz",
    propertyName: "Bahçelievler Daire 1A",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    monthlyRent: 2500,
    deposit: 5000,
    status: "ACTIVE",
    type: "LEASE",
  },
  {
    id: 2,
    tenantName: "Fatma Demir",
    propertyName: "Kadıköy Daire 2B",
    startDate: "2024-03-15",
    endDate: "2025-03-15",
    monthlyRent: 3200,
    deposit: 6400,
    status: "ACTIVE",
    type: "LEASE",
  },
  {
    id: 3,
    tenantName: "Mehmet Kaya",
    propertyName: "Beşiktaş Ofis 3C",
    startDate: "2023-06-01",
    endDate: "2024-06-01",
    monthlyRent: 4100,
    deposit: 8200,
    status: "EXPIRED",
    type: "RENTAL",
  },
]);

const filteredContracts = computed(() => {
  let filtered = contracts.value;

  if (searchQuery.value) {
    filtered = filtered.filter(
      (contract) =>
        contract.tenantName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        contract.propertyName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (statusFilter.value !== "all") {
    filtered = filtered.filter((contract) => contract.status === statusFilter.value);
  }

  if (typeFilter.value !== "all") {
    filtered = filtered.filter((contract) => contract.type === typeFilter.value);
  }

  return filtered;
});

const getStatusVariant = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "EXPIRED":
      return "secondary";
    case "TERMINATED":
      return "destructive";
    case "PENDING":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "Aktif";
    case "EXPIRED":
      return "Süresi Dolmuş";
    case "TERMINATED":
      return "Feshedilmiş";
    case "PENDING":
      return "Beklemede";
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR");
};

const viewContract = (id: number) => {
  navigateTo(`/contracts/${id}`);
};

const editContract = (id: number) => {
  navigateTo(`/contracts/${id}/edit`);
};

const viewPayments = (id: number) => {
  navigateTo(`/contracts/${id}/payments`);
};

const terminateContract = async (id: number) => {
  if (!confirm("Bu sözleşmeyi feshetmek istediğinizden emin misiniz?")) {
    return;
  }

  try {
    // TODO: Implement API call to terminate contract
    // await $fetch(`/api/contracts/${id}/terminate`, { method: 'POST' })

    console.log("Terminating contract:", id);

    // Update contract status locally
    const contract = contracts.value.find((c) => c.id === id);
    if (contract) {
      contract.status = "TERMINATED";
    }
  } catch (error) {
    console.error("Error terminating contract:", error);
    alert("Sözleşme feshedilemedi.");
  }
};

// Load contracts on mount
onMounted(async () => {
  loading.value = true;
  try {
    // TODO: Implement API call to fetch contracts
    // const { data } = await $fetch('/api/contracts')
    // contracts.value = data
  } catch (error) {
    console.error("Error loading contracts:", error);
  } finally {
    loading.value = false;
  }
});
</script>
