// Router de la app.
// IMPORTANTE: las rutas estáticas (/panel, /panel/login, /__seed) van ANTES
// que la ruta dinámica /:slug. React Router prioriza specificidad, pero las
// dejamos ordenadas para que sea obvio leyendo el archivo.

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './lib/AuthContext'
import RutaProtegida from './components/RutaProtegida'
import RutaAdmin from './components/RutaAdmin'

import HomePage from './pages/HomePage'
import SeedPage from './pages/SeedPage'
import MigracionSlots from './pages/MigracionSlots'
import LoginPage from './pages/LoginPage'
import PanelPage from './pages/PanelPage'
import AdminPage from './pages/AdminPage'
import PlanesPage from './pages/PlanesPage'
import ReservaPage from './pages/ReservaPage'
import MedidorTrafico from './pages/MedidorTrafico'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/planes" element={<PlanesPage />} />
          <Route path="/trafico" element={<MedidorTrafico />} />
          {/* Rutas DEV-only. Vite tree-shakea estas ramas en build de
              producción — las rutas ni siquiera aparecen en el bundle. */}
          {import.meta.env.DEV && (
            <>
              <Route
                path="/__seed"
                element={
                  <RutaProtegida>
                    <RutaAdmin>
                      <SeedPage />
                    </RutaAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/__migrar-slots"
                element={
                  <RutaProtegida>
                    <RutaAdmin>
                      <MigracionSlots />
                    </RutaAdmin>
                  </RutaProtegida>
                }
              />
            </>
          )}

          {/* Panel del dueño */}
          <Route path="/panel/login" element={<LoginPage />} />
          <Route
            path="/panel"
            element={
              <RutaProtegida>
                <PanelPage />
              </RutaProtegida>
            }
          />

          {/* Admin de Río Tech */}
          <Route
            path="/admin"
            element={
              <RutaProtegida>
                <RutaAdmin>
                  <AdminPage />
                </RutaAdmin>
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
