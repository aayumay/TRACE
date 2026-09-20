import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Using Vite 8 with rolldown bundler — manualChunks must be a function
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/three')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
            return 'ui';
          }
        },
      },
    },
  },
})
