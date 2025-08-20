import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_URL || 'https://lifebee-backend.onrender.com';
  const isHttps = target.startsWith('https');
  
  // Importar o plugin cartographer de forma assíncrona se necessário
  let cartographerPlugin = null;
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    try {
      const cartographerModule = await import("@replit/vite-plugin-cartographer");
      cartographerPlugin = cartographerModule.cartographer();
    } catch (error) {
      console.warn("Cartographer plugin não pôde ser carregado:", error);
    }
  }
  
  return {
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(cartographerPlugin ? [cartographerPlugin] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target,
        changeOrigin: true,
        secure: isHttps,
        ws: true,
      },
      '/uploads': {
        target,
        changeOrigin: true,
        secure: isHttps,
      }
    }
  },
};
});
