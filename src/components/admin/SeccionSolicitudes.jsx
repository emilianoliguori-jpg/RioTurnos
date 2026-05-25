// Sección Solicitudes del admin.
// Filtro: Pendientes / Aprobadas / Rechazadas.
// Aprobar = crea el negocio (con defaults) + marca la solicitud como aprobada.
// Rechazar = solo marca, motivo opcional.

import { useEffect, useState } from 'react'
import { getSolicitudes, actualizarSolicitud } from '../../services/solicitudes'
import { crearNegocio, slugExiste } from '../../services/negocios'
import { NEGOCIO_DEFAULTS } from '../../lib/negocioDefaults'

import TarjetaSolicitud from './TarjetaSolicitud'

const FILTROS = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobada',  label: 'Aprobadas' },
  { key: 'rechazada', label: 'Rechazadas' },
]

export default function SeccionSolicitudes() {
  const [filtro, setFiltro] = useState('pendiente')
  const [items, setItems] = useState(null) // null = cargando
  const [modoIdPorSolicitud, setModoIdPorSolicitud] = useState({ id: null, modo: 'idle' })
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)
  const [mensajeOk, setMensajeOk] = useState(null)

  async function recargar() {
    setItems(null)
    const arr = await getSolicitudes(filtro)
    setItems(arr)
  }

  useEffect(() => {
    setError(null)
    setMensajeOk(null)
    setModoIdPorSolicitud({ id: null, modo: 'idle' })
    recargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro])

  function pedirAprobar(id) {
    setError(null)
    setModoIdPorSolicitud({ id, modo: 'confirmando-aprobar' })
  }
  function pedirRechazar(id) {
    setError(null)
    setModoIdPorSolicitud({ id, modo: 'confirmando-rechazar' })
  }
  function abortar() {
    setModoIdPorSolicitud({ id: null, modo: 'idle' })
  }

  async function aprobar(solicitud) {
    setProcesando(true)
    setError(null)
    setMensajeOk(null)
    try {
      // Race condition guard: alguien pudo haber tomado el slug entre la
      // solicitud y la aprobación. Verificamos antes de crear.
      if (await slugExiste(solicitud.slug)) {
        setError(
          `El slug "${solicitud.slug}" ya fue tomado. Coordiná con el dueño un slug nuevo antes de aprobar.`
        )
        setProcesando(false)
        return
      }

      // 1. Crear negocio con defaults + datos de la solicitud.
      await crearNegocio(solicitud.slug, {
        ...NEGOCIO_DEFAULTS,
        nombre: solicitud.nombreNegocio,
        rubro: solicitud.rubro,
        plan: solicitud.planKey,
        estado: 'activo',
        emailDuenoAutorizado: solicitud.email,
        telefono: solicitud.whatsapp || '',
      })

      // 2. Marcar solicitud como aprobada, con referencia al negocio creado.
      await actualizarSolicitud(solicitud.id, {
        estado: 'aprobada',
        negocioCreadoId: solicitud.slug,
      })

      setMensajeOk(
        `Negocio /${solicitud.slug} creado. Cuando ${solicitud.email} se loguee, queda vinculado automáticamente.`
      )
      setModoIdPorSolicitud({ id: null, modo: 'idle' })
      await recargar()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError(err.message || 'No pudimos aprobar la solicitud.')
    } finally {
      setProcesando(false)
    }
  }

  async function rechazar(solicitud, motivo) {
    setProcesando(true)
    setError(null)
    try {
      await actualizarSolicitud(solicitud.id, {
        estado: 'rechazada',
        motivoRechazo: (motivo || '').trim(),
      })
      setModoIdPorSolicitud({ id: null, modo: 'idle' })
      await recargar()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError(err.message || 'No pudimos rechazar la solicitud.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="font-serif text-2xl text-ink font-light">Solicitudes</h2>
      </div>

      {/* Filtro */}
      <div className="inline-flex rounded-full border border-ink/15 bg-white p-1">
        {FILTROS.map((f) => {
          const activo = f.key === filtro
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltro(f.key)}
              className="rounded-full px-4 py-1.5 font-sans text-sm transition"
              style={
                activo
                  ? { backgroundColor: '#0B6E6E', color: '#F5F1EA' }
                  : { backgroundColor: 'transparent', color: '#0F1419' }
              }
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Feedback global */}
      {error && (
        <div className="rounded-2xl border border-copper bg-copper/5 p-4">
          <p className="font-sans text-copper text-sm">{error}</p>
        </div>
      )}
      {mensajeOk && (
        <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4">
          <p className="font-sans text-teal text-sm">{mensajeOk}</p>
        </div>
      )}

      {/* Lista */}
      {items === null ? (
        <p className="font-sans text-ink/50 text-sm">Cargando…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center">
          <p className="font-serif text-xl text-ink font-light">
            {filtro === 'pendiente'
              ? 'No hay solicitudes pendientes.'
              : filtro === 'aprobada'
              ? 'Todavía no aprobaste ninguna solicitud.'
              : 'No hay solicitudes rechazadas.'}
          </p>
          {filtro === 'pendiente' && (
            <p className="font-sans text-ink/50 text-sm mt-2">
              Cuando alguien complete /planes y mande una solicitud, va a aparecer acá.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <TarjetaSolicitud
              key={s.id}
              solicitud={s}
              modo={
                modoIdPorSolicitud.id === s.id ? modoIdPorSolicitud.modo : 'idle'
              }
              procesando={procesando && modoIdPorSolicitud.id === s.id}
              onPedirAprobar={() => pedirAprobar(s.id)}
              onConfirmarAprobar={() => aprobar(s)}
              onPedirRechazar={() => pedirRechazar(s.id)}
              onConfirmarRechazar={(motivo) => rechazar(s, motivo)}
              onAbortar={abortar}
            />
          ))}
        </div>
      )}
    </div>
  )
}
