import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Generator MF nie ma zbudowanej paczki w npm – używamy jego źródeł (src/) z node_modules.
      "@akmf/ksef-fe-invoice-converter": path.resolve(
        __dirname,
        "node_modules/@akmf/ksef-fe-invoice-converter/src/index.ts",
      ),
      // Generator importuje własne moduły przez ten alias (jak w jego vite.config.ts).
      "@shared": path.resolve(
        __dirname,
        "node_modules/@akmf/ksef-fe-invoice-converter/src/shared",
      ),
    },
  },
  server: {
    port: 5173,
  },
});
