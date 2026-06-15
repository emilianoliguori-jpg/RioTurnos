import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// App independiente "RioFactura". No comparte build con Rio Turnos.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
