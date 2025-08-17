// @ts-nocheck
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  output: "static", // SSG（静的サイト生成）に変更
  site: "https://dddynamis.com",
  integrations: [
    react(), 
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  compressHTML: false,
  vite: {
    build: {
      minify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'swiper': ['swiper']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['swiper', 'swiper/modules']
    }
  }
});
