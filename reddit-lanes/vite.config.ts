import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/reddit": {
        target: "https://www.reddit.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reddit/, ""),
        headers: {
          "User-Agent": "reddit-lanes/1.0 (local development)",
        },
      },
    },
  },
});
