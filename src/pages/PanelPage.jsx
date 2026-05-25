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
import SeccionConfiguracion from '../components/panel/SeccionConfiguracion'
import SeccionServicios from '../components/panel/SeccionServicios'
import SeccionProfesionales from '../components/panel/SeccionProfesionales'
import SeccionHorarios from '../components/panel/SeccionHorarios'
import SeccionAgenda from '../components/panel/SeccionAgenda'

export default function PanelPage() {
  const { usuario, cargandoVinculacion } = useAuth()

  const [estado, setEstado] = useState({
    cargando: true,
    negocio: null,
    sinNegocio: false,
    error: null,
  })
  const [seccionActiva, setSeccionActiva] = useState('configuracion')

  useEffect(() => {
    if (!usuario) return
    // Esperar a que termine la vinculación automática email→uid antes de
    // consultar usuarios/{uid}. Si no, podemos leer un doc vacío justo antes
    // de que se cree y mostrar "sin negocio" cuando en realidad sí lo tiene.
    if (cargandoVinculacion) return
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
  }, [usuario, cargandoVinculacion])

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

  // Callback que las secciones invocan al actualizar el negocio en Firestore.
  // Hace merge local así el header y el color de la barra de tabs se refrescan
  // sin recargar la página.
  function aplicarCambiosNegocio(parciales) {
    setEstado((e) => ({
      ...e,
      negocio: { ...e.negocio, ...parciales },
    }))
  }

  return (
    <div className="min-h-screen bg-paper">
      <HeaderPanel nombreNegocio={negocio.nombre} />
      <TabsPanel
        activa={seccionActiva}
        onCambiar={setSeccionActiva}
        colorAcento={colorAcento}
      />

      <div className="max-w-3xl mx-auto px-5 py-8">
        {seccionActiva === 'configuracion' && (
          <SeccionConfiguracion
            negocio={negocio}
            onNegocioActualizado={aplicarCambiosNegocio}
          />
        )}
        {seccionActiva === 'servicios' && (
          <SeccionServicios negocio={negocio} />
        )}
        {seccionActiva === 'profesionales' && (
          <SeccionProfesionales negocio={negocio} />
        )}
        {seccionActiva === 'horarios' && (
          <SeccionHorarios
            negocio={negocio}
            onNegocioActualizado={aplicarCambiosNegocio}
          />
        )}
        {seccionActiva === 'agenda' && (
          <SeccionAgenda negocio={negocio} />
        )}
      </div>
    </div>
  )
}
