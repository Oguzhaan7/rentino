// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
  ],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_API_BASE_URL || "http://localhost:5000/api",
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  colorMode: {
    classSuffix: "",
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
});
