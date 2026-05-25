// Panel del dueño — /panel
// Esqueleto: header + pestañas + área de contenido (placeholders).
// Las secciones reales se construyen en la etapa 3b.

import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getNegociosDelUsuario } from '../services/usuarios'
import { getNegocioPorSlug } from '../services/negocios'

import HeaderPanel from '../components/panel/HeaderPanel'
import TabsPanel from '../components/panel/TabsPanel'
import SeccionPlaceholder from '../components/panel/SeccionPlaceholder'
import SinNegocio from '../components/panel/SinNegocio'

const LABELS_SECCION = {
  configuracion: 'Configuración',
  servicios:     'Servicios',
  profesionales: 'Profesionales',
  horarios:      'Horarios',
  agenda:        'Agenda',
}

export default function PanelPage() {
  const { usuario } = useAuth()

  const [estado, setEstado] = useState({
    cargando: true,
    negocio: null,
    sinNegocio: false,
    error: null,
  })
  const [seccionActiva, setSeccionActiva] = useState('configuracion')

  useEffect(() => {
    if (!usuario) return
    let cancelado = false

    async function cargar() {
      try {
        const slugs = await getNegociosDelUsuario(usuario.uid)
        if (slugs.length === 0) {
          if (!cancelado) {
            setEstado({ cargando: false, negocio: null, sinNegocio: true, error: null })
          }
          return
        }
        // Por ahora trabajamos con el primer negocio del usuario.
        // En el futuro, si tiene varios, agregamos un selector.
        const negocio = await getNegocioPorSlug(slugs[0])
        if (!cancelado) {
          setEstado({ cargando: false, negocio, sinNegocio: false, error: null })
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        if (!cancelado) {
          setEstado({ cargando: false, negocio: null, sinNegocio: false, error: 'firestore' })
        }
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [usuario])

  if (estado.cargando) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-sans text-ink/50 text-sm">Cargando panel…</p>
      </div>
    )
  }

  if (estado.sinNegocio) {
    return <SinNegocio usuario={usuario} />
  }

  if (estado.error || !estado.negocio) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="font-serif text-2xl text-ink">Algo salió mal.</p>
          <p className="font-sans text-ink/60 text-sm mt-2">
            No pudimos cargar tu negocio. Probá refrescar la página.
          </p>
        </div>
      </div>
    )
  }

  const { negocio } = estado
  const colorAcento = negocio.colorAcento || '#0B6E6E'

  return (
    <div className="min-h-screen bg-paper">
      <HeaderPanel nombreNegocio={negocio.nombre} />
      <TabsPanel
        activa={seccionActiva}
        onCambiar={setSeccionActiva}
        colorAcento={colorAcento}
      />

      <div className="max-w-5xl mx-auto px-5 py-8">
        <SeccionPlaceholder titulo={LABELS_SECCION[seccionActiva]} />
      </div>
    </div>
  )
}
