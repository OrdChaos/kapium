import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from 'path';
import { defineConfig } from "vite";

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  envDir: '.',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../build/dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
})