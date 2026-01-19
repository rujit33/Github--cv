import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    // Make env variables available
    "process.env": {},
  },
  build: {
    rollupOptions: {
      // Exclude latex.js from bundle since we use HTML fallback
      external: ["latex.js"],
    },
  },
});
