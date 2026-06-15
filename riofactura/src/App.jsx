import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './lib/AuthContext'
import RutaProtegida from './components/RutaProtegida'
import Layout from './components/Layout'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import FacturarPage from './pages/FacturarPage'
import ComprobantesPage from './pages/ComprobantesPage'
import ComprobanteDetallePage from './pages/ComprobanteDetallePage'
import ClientesPage from './pages/ClientesPage'
import ClienteDetallePage from './pages/ClienteDetallePage'
import ProveedoresPage from './pages/ProveedoresPage'
import ProveedorDetallePage from './pages/ProveedorDetallePage'
import ComprasPage from './pages/ComprasPage'
import MovimientosPage from './pages/MovimientosPage'
import ReportesPage from './pages/ReportesPage'
import EmpresaPage from './pages/EmpresaPage'

// Envuelve una pagina con el layout protegido.
function Privada({ children }) {
  return (
    <RutaProtegida>
      <Layout>{children}</Layout>
    </RutaProtegida>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<Privada><DashboardPage /></Privada>} />
          <Route path="/facturar" element={<Privada><FacturarPage /></Privada>} />
          <Route path="/comprobantes" element={<Privada><ComprobantesPage /></Privada>} />
          <Route path="/comprobantes/:id" element={<Privada><ComprobanteDetallePage /></Privada>} />
          <Route path="/clientes" element={<Privada><ClientesPage /></Privada>} />
          <Route path="/clientes/:id" element={<Privada><ClienteDetallePage /></Privada>} />
          <Route path="/proveedores" element={<Privada><ProveedoresPage /></Privada>} />
          <Route path="/proveedores/:id" element={<Privada><ProveedorDetallePage /></Privada>} />
          <Route path="/compras" element={<Privada><ComprasPage /></Privada>} />
          <Route path="/movimientos" element={<Privada><MovimientosPage /></Privada>} />
          <Route path="/reportes" element={<Privada><ReportesPage /></Privada>} />
          <Route path="/empresa" element={<Privada><EmpresaPage /></Privada>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
