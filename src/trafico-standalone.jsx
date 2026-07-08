// Punto de entrada STANDALONE del Medidor de Circulación.
// Renderiza SOLO la pantalla del medidor, sin el AuthProvider ni Firebase,
// para poder publicarlo como sitio estático independiente (GitHub Pages)
// sin necesidad de credenciales de Firebase.
//
// Usa HashRouter porque GitHub Pages sirve el sitio bajo un subpath
// (/RioTurnos/) y no reescribe rutas del lado del servidor.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import MedidorTrafico from './pages/MedidorTrafico'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <MedidorTrafico />
    </HashRouter>
  </StrictMode>,
)
