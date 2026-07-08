// Config de build STANDALONE del Medidor de Circulación para GitHub Pages.
//   · base './'  → rutas de assets relativas, funcionan bajo el subpath /RioTurnos/
//   · input trafico.html → punto de entrada independiente (sin Firebase)
//   · outDir dist-trafico → carpeta separada del build principal

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist-trafico',
    emptyOutDir: true,
    rollupOptions: {
      input: 'trafico.html',
    },
  },
})
