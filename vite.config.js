import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react],

  server: {
    proxy: {
      "/api": {
        target: "http://13.159.7.199:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});