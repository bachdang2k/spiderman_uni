import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/three/.test(id)) return 'three'
          if (/gsap|framer-motion|lenis/.test(id)) return 'motion'
          if (/react|scheduler/.test(id)) return 'react'
          if (/howler/.test(id)) return 'sound'
          if (/lucide/.test(id)) return 'icons'
          return 'vendor'
        },
      },
    },
  },
})
