import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        en: resolve(import.meta.dirname, "index.html"),
        ko: resolve(import.meta.dirname, "ko/index.html"),
      },
    },
  },
});
