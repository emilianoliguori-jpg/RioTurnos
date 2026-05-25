// Panel de administración de Río Tech — /admin
// Dos secciones: Solicitudes (default — donde está el workflow activo) y
// Negocios (catálogo + métricas + tracking de pago).

import { useState } from 'react'
import HeaderAdmin from '../components/admin/HeaderAdmin'
import TabsAdmin from '../components/admin/TabsAdmin'
import SeccionSolicitudes from '../components/admin/SeccionSolicitudes'
import SeccionNegocios from '../components/admin/SeccionNegocios'

export default function AdminPage() {
  const [seccionActiva, setSeccionActiva] = useState('solicitudes')

  return (
    <div className="min-h-screen bg-paper">
      <HeaderAdmin />
      <TabsAdmin activa={seccionActiva} onCambiar={setSeccionActiva} />
      <div className="max-w-3xl mx-auto px-5 py-8">
        {seccionActiva === 'solicitudes' && <SeccionSolicitudes />}
        {seccionActiva === 'negocios' && <SeccionNegocios />}
      </div>
    </div>
  )
}
