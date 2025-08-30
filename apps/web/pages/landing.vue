<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col"
  >
    <!-- Hero Section -->
    <section
      class="relative w-full flex flex-col items-center justify-center py-24 px-4 bg-gradient-to-br from-blue-600 via-blue-400 to-blue-200 text-white"
    >
      <div class="absolute inset-0 pointer-events-none">
        <svg
          class="w-full h-full"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-opacity="0.2"
            d="M0,160L48,165.3C96,171,192,181,288,165.3C384,149,480,107,576,117.3C672,128,768,192,864,218.7C960,245,1056,235,1152,208C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="white"
          />
        </svg>
      </div>
      <div class="relative z-10 flex flex-col items-center">
        <div class="flex flex-col items-center gap-6 mb-8">
          <span class="text-5xl md:text-6xl font-extrabold tracking-tight mb-2"
            >Rentino</span
          >
          <h1
            class="text-2xl md:text-4xl font-bold mb-2 max-w-2xl text-center drop-shadow-lg"
          >
            Mülk ve Kiracı Yönetiminde Yeni Dönem
          </h1>
          <p class="max-w-xl text-lg md:text-xl text-white/80 mb-8 text-center">
            Tüm mülklerinizi, kiracıları ve finansal süreçleri tek bir
            platformda kolayca yönetin. Modern, güvenli ve hızlı arayüz ile
            işlerinizi kolaylaştırın.
          </p>
          <div class="flex gap-4 justify-center">
            <button class="btn-landing-primary" @click="navigateTo('/auth')">
              <svg
                class="h-5 w-5 mr-2 inline-block"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
              Hemen Başla
            </button>
            <button
              class="btn-landing-outline"
              @click="navigateTo('/dashboard')"
            >
              <svg
                class="h-5 w-5 mr-2 inline-block"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="6" />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 8v4l3 3"
                />
              </svg>
              Demo Görüntüle
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="container mx-auto px-4 py-16">
      <h2
        class="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-700"
      >
        Öne Çıkan Özellikler
      </h2>
      <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-[1.03] transition-transform"
        >
          <component :is="feature.icon" class="h-10 w-10 mb-4 text-blue-600" />
          <h4 class="font-semibold text-xl mb-2">{{ feature.title }}</h4>
          <p class="text-muted-foreground text-base">{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="container mx-auto px-4 py-20 text-center">
      <h3 class="text-2xl md:text-3xl font-semibold mb-6 text-blue-700">
        Rentino ile mülk yönetimini kolaylaştırın!
      </h3>
      <button class="btn-landing-primary" @click="navigateTo('/auth')">
        <svg
          class="h-5 w-5 mr-2 inline-block"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 12h14M12 5l7 7-7 7"
          />
        </svg>
        Ücretsiz Başla
      </button>
    </section>

    <!-- Footer -->
    <footer
      class="mt-auto py-8 text-center text-muted-foreground text-base bg-white/80 border-t"
    >
      &copy; 2025 Rentino. Tüm hakları saklıdır.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Building, Users, TrendingUp, ShieldCheck } from "lucide-vue-next";
import { useRouter } from "vue-router";

definePageMeta({
  layout: false,
});

const router = useRouter();
const navigateTo = (path: string) => router.push(path);

const features = [
  {
    icon: Building,
    title: "Mülk Yönetimi",
    desc: "Tüm mülklerinizi kolayca yönetin, ekleyin ve takip edin.",
  },
  {
    icon: Users,
    title: "Kiracı Takibi",
    desc: "Kiracı bilgileri, sözleşmeler ve ödeme durumları tek panelde.",
  },
  {
    icon: TrendingUp,
    title: "Finans & Raporlama",
    desc: "Gelir, gider ve ödeme takibini anlık raporlarla izleyin.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli & Yetkilendirme",
    desc: "Çoklu tenant, rol bazlı erişim ve güvenli oturum yönetimi.",
  },
];
</script>

<style scoped>
.btn-landing-primary {
  background: linear-gradient(90deg, #e0e7ff 0%, #bae6fd 100%);
  color: #2563eb;
  font-weight: 700;
  font-size: 1.125rem;
  border-radius: 9999px;
  padding: 0.75rem 2rem;
  box-shadow: 0 2px 12px 0 rgb(96 165 250 / 10%);
  border: none;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  letter-spacing: 0.01em;
  outline: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-landing-primary:hover,
.btn-landing-primary:focus {
  background: linear-gradient(90deg, #bae6fd 0%, #e0e7ff 100%);
  box-shadow: 0 4px 24px 0 rgb(96 165 250 / 20%);
  transform: translateY(-2px) scale(1.04);
}
.btn-landing-outline {
  background: transparent;
  color: #2563eb;
  font-weight: 700;
  font-size: 1.125rem;
  border-radius: 9999px;
  padding: 0.75rem 2rem;
  border: 2px solid #e0e7ff;
  box-shadow: 0 2px 12px 0 rgb(96 165 250 / 10%);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s;
  letter-spacing: 0.01em;
  outline: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-landing-outline:hover,
.btn-landing-outline:focus {
  background: #f3f4f6;
  color: #2563eb;
  box-shadow: 0 4px 24px 0 rgb(96 165 250 / 20%);
  transform: translateY(-2px) scale(1.04);
}
</style>
