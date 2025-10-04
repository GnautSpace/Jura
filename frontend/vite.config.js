import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses, including LAN and public addresses
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Enable polling for Docker environments
    },
  },
})
