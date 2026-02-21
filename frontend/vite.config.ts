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
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('wouter')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('twikoo')) {
              return 'comment-vendor';
            }
            if (id.includes('@iconify') || id.includes('lucide-react')) {
              return 'icon-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            if (id.includes('framer-motion') || id.includes('date-fns') || 
                id.includes('class-variance-authority') || id.includes('clsx') || 
                id.includes('tailwind-merge') || id.includes('minisearch')) {
              return 'utility-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
})