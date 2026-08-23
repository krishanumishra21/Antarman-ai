import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests to the Express backend during development
    proxy: {
      "/auth": {
        target: "http://localhost:5000",
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) {
            return "/index.html";
          }
        }
      },
      "/persona": {
        target: "http://localhost:5000",
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) {
            return "/index.html";
          }
        }
      },
      "/chat": {
        target: "http://localhost:5000",
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) {
            return "/index.html";
          }
        }
      },
      "/health": {
        target: "http://localhost:5000",
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) {
            return "/index.html";
          }
        }
      },
    },
  },
});
