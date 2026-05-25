// Router de la app. Tres rutas en esta etapa:
//   /               -> HomePage (landing temporal)
//   /__seed         -> SeedPage (oculta, dev only)
//   /:slug          -> ReservaPage (flujo público del negocio)

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SeedPage from './pages/SeedPage'
import ReservaPage from './pages/ReservaPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/__seed" element={<SeedPage />} />
        <Route path="/:slug" element={<ReservaPage />} />
      </Routes>
    </BrowserRouter>
  )
}
