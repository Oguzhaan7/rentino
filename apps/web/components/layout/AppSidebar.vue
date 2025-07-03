<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import { GalleryVerticalEnd } from "lucide-vue-next";
import { Progress } from "@/components/ui/progress";
import NavMain from "~/components/layout/NavMain.vue";
import NavProjects from "~/components/layout/NavProjects.vue";
import NavUser from "~/components/layout/NavUser.vue";
import TeamSwitcher from "~/components/layout/TeamSwitcher.vue";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";

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
        <div class="flex flex-col items-center justify-center py-8 space-y-2">
          <Progress :model-value="60" class="w-32" />
          <span class="text-xs text-muted-foreground">Menü yükleniyor...</span>
        </div>
      </template>
    </SidebarContent>
    <SidebarFooter>
      <NavUser v-if="userStore.isInitialized" :user="navigationData.user" />
      <div v-else class="flex flex-col items-center justify-center py-4 space-y-2">
        <Progress :model-value="40" class="w-24" />
      </div>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
