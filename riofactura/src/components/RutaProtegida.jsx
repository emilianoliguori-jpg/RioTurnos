// Envuelve rutas que requieren login. Sin sesion -> /login.
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { Spinner } from './ui'

export default function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <Spinner texto="Verificando sesión…" />
  if (!usuario) return <Navigate to="/login" replace />
  return children
}
