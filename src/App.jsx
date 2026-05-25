// Router de la app.
// IMPORTANTE: las rutas estáticas (/panel, /panel/login, /__seed) van ANTES
// que la ruta dinámica /:slug. React Router prioriza specificidad, pero las
// dejamos ordenadas para que sea obvio leyendo el archivo.

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './lib/AuthContext'
import RutaProtegida from './components/RutaProtegida'

import HomePage from './pages/HomePage'
import SeedPage from './pages/SeedPage'
import LoginPage from './pages/LoginPage'
import PanelPage from './pages/PanelPage'
import ReservaPage from './pages/ReservaPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/__seed" element={<SeedPage />} />

          {/* Panel admin */}
          <Route path="/panel/login" element={<LoginPage />} />
          <Route
            path="/panel"
            element={
              <RutaProtegida>
                <PanelPage />
              </RutaProtegida>
            }
          />

          {/* Flujo público del negocio */}
          <Route path="/:slug" element={<ReservaPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
