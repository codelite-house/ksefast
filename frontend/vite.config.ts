import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@akmf/ksef-fe-invoice-converter": path.resolve(
        __dirname,
        "vendor/ksef-pdf-generator/src/index.ts",
      ),
    },
  },
  server: {
    port: 5173,
  },
});
