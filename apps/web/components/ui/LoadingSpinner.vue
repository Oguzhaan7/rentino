<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div
      class="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
      :class="sizeClass"
    />
    <span v-if="text" class="ml-2 text-sm text-gray-600">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  text: undefined,
  fullScreen: false,
});

const sizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "h-4 w-4";
    case "lg":
      return "h-8 w-8";
    default:
      return "h-6 w-6";
  }
});

const containerClass = computed(() => {
  return props.fullScreen
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50"
    : "p-4";
});
</script>
