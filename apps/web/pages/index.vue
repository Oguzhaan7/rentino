<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">Rentino - Tenant Management</h1>

      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Current Tenant</CardTitle>
          <CardDescription>
            Information about the currently resolved tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="tenantStore.isLoading" class="text-center py-4">
            <p class="text-muted-foreground">Loading tenant information...</p>
          </div>

          <div v-else-if="tenantStore.error" class="text-center py-4">
            <p class="text-destructive">{{ tenantStore.error }}</p>
            <Button
              variant="outline"
              class="mt-2"
              @click="tenantStore.clearError"
            >
              Clear Error
            </Button>
          </div>

          <div v-else-if="tenantStore.currentTenant" class="space-y-4">
            <div><strong>ID:</strong> {{ tenantStore.currentTenant.id }}</div>
            <div>
              <strong>Name:</strong> {{ tenantStore.currentTenant.name }}
            </div>
            <div>
              <strong>Domain:</strong>
              {{ tenantStore.currentTenant.domain || "Not set" }}
            </div>
            <div>
              <strong>Status:</strong>
              <span
                :class="
                  tenantStore.currentTenant.isActive
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ tenantStore.currentTenant.isActive ? "Active" : "Inactive" }}
              </span>
            </div>
          </div>

          <div v-else class="text-center py-4">
            <p class="text-muted-foreground">
              No tenant resolved from current domain
            </p>
          </div>
        </CardContent>
      </Card>

      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Test Tenant Resolution</CardTitle>
          <CardDescription>
            Test the tenant middleware with different domains
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex gap-2">
            <Button
              variant="outline"
              @click="testResolveTenant('demo.rentino.com')"
            >
              Test Demo Tenant
            </Button>
            <Button
              variant="outline"
              @click="testResolveTenant('test.rentino.com')"
            >
              Test Company Tenant
            </Button>
            <Button
              variant="destructive"
              @click="testResolveTenant('nonexistent.com')"
            >
              Test Invalid Domain
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription> Current user and permissions </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="tenantStore.user" class="space-y-2">
            <div><strong>Email:</strong> {{ tenantStore.user.email }}</div>
            <div><strong>Role:</strong> {{ tenantStore.user.role }}</div>
            <div>
              <strong>Tenant Access:</strong>
              <span
                :class="
                  tenantStore.canAccessTenant
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ tenantStore.canAccessTenant ? "Allowed" : "Denied" }}
              </span>
            </div>
          </div>
          <div v-else class="text-muted-foreground">No user logged in</div>

          <div class="mt-4 flex gap-2">
            <Button variant="default" size="sm" @click="simulateLogin">
              Simulate Login
            </Button>
            <Button variant="outline" size="sm" @click="tenantStore.logout">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTenantStore } from "~/stores/tenant";

const tenantStore = useTenantStore();

const testResolveTenant = async (domain: string) => {
  try {
    await tenantStore.resolveTenant(domain);
  } catch (error) {
    console.error("Failed to resolve tenant:", error);
  }
};

const simulateLogin = () => {
  tenantStore.setUser({
    id: "1",
    email: "admin@demo.com",
    role: "ADMIN",
    tenantId: "1",
  });
};

onMounted(() => {
  if (import.meta.client) {
    const currentDomain = window.location.hostname;
    if (currentDomain !== "localhost" && currentDomain !== "127.0.0.1") {
      testResolveTenant(currentDomain);
    }
  }
});
</script>

<style scoped></style>
