// @ts-nocheck
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  output: "static", // SSG（静的サイト生成）に変更
  site: "https://dddynamis.com",
  integrations: [react(), sitemap()],
  compressHTML: false,
  vite: {
    build: {
      minify: false,
    }
  }
});
