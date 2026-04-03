import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests to the Express backend during development
    proxy: {
      "/auth":    "http://localhost:5000",
      "/persona": "http://localhost:5000",
      "/chat":    "http://localhost:5000",
      "/health":  "http://localhost:5000",
    },
  },
});
