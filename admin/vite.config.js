import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  // Add this section below
  server: {
    host: true,
    port: 5173, // Optional, but good to be explicit
  }
})