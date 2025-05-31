<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import { GalleryVerticalEnd } from "lucide-vue-next";
import NavMain from "~/components/layout/NavMain.vue";
import NavProjects from "~/components/layout/NavProjects.vue";
import NavUser from "~/components/layout/NavUser.vue";
import TeamSwitcher from "~/components/layout/TeamSwitcher.vue";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

const userStore = useUserStore();
const { getNavigationData } = useNavigation();
const navigationData = computed(() => getNavigationData());

const teams = [
  {
    name: "Rentino",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
];
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="teams" />
    </SidebarHeader>
    <SidebarContent>
      <template v-if="userStore.isInitialized">
        <NavMain :items="navigationData.navMain" />
        <NavProjects :projects="navigationData.projects" />
      </template>
      <template v-else>
        <div class="flex items-center justify-center py-8">
          <LoadingSpinner size="sm" text="Menü yükleniyor..." />
        </div>
      </template>
    </SidebarContent>
    <SidebarFooter>
      <NavUser v-if="userStore.isInitialized" :user="navigationData.user" />
      <div v-else class="flex items-center justify-center py-4">
        <LoadingSpinner size="sm" />
      </div>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
