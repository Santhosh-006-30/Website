import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@tiptap/')) {
            return 'vendor-tiptap';
          }
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-framer';
          }
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})

