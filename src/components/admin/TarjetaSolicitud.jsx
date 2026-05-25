// Card de una solicitud de alta.
// Modo display normal o modo confirmación inline (aprobar/rechazar).

import { useState } from 'react'
import { getRubro } from '../../lib/rubros'
import { getPlan } from '../../lib/planes'
import { formatearPrecio } from '../../lib/formato'
import { etiquetaFechaHora } from '../../lib/fechas'
import BotonVerComprobante from '../comun/BotonVerComprobante'

export default function TarjetaSolicitud({
  solicitud,
  modo, // 'idle' | 'confirmando-aprobar' | 'confirmando-rechazar'
  procesando,
  onPedirAprobar,
  onConfirmarAprobar,
  onPedirRechazar,
  onConfirmarRechazar,
  onAbortar,
}) {
  const rubro = getRubro(solicitud.rubro)
  const plan = getPlan(solicitud.planKey)
  const [motivo, setMotivo] = useState(solicitud.motivoRechazo || '')

  const pendiente = solicitud.estado === 'pendiente'
  const aprobada  = solicitud.estado === 'aprobada'
  const rechazada = solicitud.estado === 'rechazada'

  const fechaCreacion = solicitud.fechaCreacion?.toDate?.()
  const fechaResolucion = solicitud.fechaResolucion?.toDate?.()

  return (
    <article
      className={`rounded-2xl border bg-white p-5 ${
        pendiente
          ? 'border-copper/30'
          : aprobada
          ? 'border-teal/30'
          : 'border-ink/10 opacity-90'
      }`}
    >
      {/* Header: plan + monto + estado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
            Plan {plan?.nombre || solicitud.planKey} ·{' '}
            <span className="text-ink">{formatearPrecio(solicitud.monto)}</span>
          </p>
          <h3 className="font-serif text-xl text-ink font-light mt-1">
            {solicitud.nombreNegocio}
          </h3>
          <p className="font-sans text-ink/60 text-sm mt-0.5">
            /{solicitud.slug} · {rubro?.nombre || solicitud.rubro}
          </p>
        </div>
        <BadgeEstado estado={solicitud.estado} />
      </div>

      {/* Solicitante */}
      <div className="mt-4 pt-4 border-t border-ink/10">
        <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
          Solicitante
        </p>
        <p className="font-sans text-ink font-medium mt-1">{solicitud.nombreDueno}</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-sans text-ink/60 text-xs">
          {solicitud.whatsapp && <span>📱 {solicitud.whatsapp}</span>}
          {solicitud.email && <span className="break-all">✉ {solicitud.email}</span>}
        </div>
      </div>

      {/* Fechas */}
      <div className="mt-3 font-sans text-ink/50 text-xs">
        {fechaCreacion && <span>Solicitada: {etiquetaFechaHora(fechaCreacion)}</span>}
        {fechaResolucion && (
          <span className="ml-3">
            · {aprobada ? 'Aprobada' : 'Rechazada'}: {etiquetaFechaHora(fechaResolucion)}
          </span>
        )}
      </div>

      {/* Resultado (solo para aprobadas/rechazadas) */}
      {aprobada && solicitud.negocioCreadoId && (
        <p className="font-sans text-sm mt-3">
          <span className="text-ink/50">Negocio creado: </span>
          <a
            href={`/${solicitud.negocioCreadoId}`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-teal hover:underline"
          >
            /{solicitud.negocioCreadoId}
          </a>
        </p>
      )}
      {rechazada && solicitud.motivoRechazo && (
        <p className="font-sans text-sm mt-3 text-ink/70">
          <span className="text-ink/50">Motivo: </span>
          {solicitud.motivoRechazo}
        </p>
      )}

      {/* Comprobante (siempre disponible — path o URL viejo) */}
      {(solicitud.pathComprobante || solicitud.urlComprobante) && (
        <div className="mt-4">
          <BotonVerComprobante
            pathComprobante={solicitud.pathComprobante}
            urlComprobante={solicitud.urlComprobante}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:bg-ink/5 transition"
          />
        </div>
      )}

      {/* Acciones (solo en pendientes) */}
      {pendiente && (
        <div className="mt-5 pt-4 border-t border-ink/10">
          {modo === 'confirmando-aprobar' && (
            <div className="space-y-3">
              <p className="font-sans text-sm text-ink">
                ¿Aprobar y crear el negocio <code className="text-teal">/{solicitud.slug}</code>?
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={onConfirmarAprobar}
                  disabled={procesando}
                  className="rounded-full bg-teal text-paper px-4 py-1.5 font-sans text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {procesando ? 'Aprobando…' : 'Sí, crear y aprobar'}
                </button>
                <button
                  type="button"
                  onClick={onAbortar}
                  disabled={procesando}
                  className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {modo === 'confirmando-rechazar' && (
            <div className="space-y-3">
              <label className="block">
                <span className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-1.5">
                  Motivo (opcional)
                </span>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: no se ve el comprobante"
                  className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2 font-sans text-ink text-sm focus:outline-none focus:border-ink/40"
                />
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onConfirmarRechazar(motivo)}
                  disabled={procesando}
                  className="rounded-full bg-copper text-paper px-4 py-1.5 font-sans text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {procesando ? 'Rechazando…' : 'Rechazar'}
                </button>
                <button
                  type="button"
                  onClick={onAbortar}
                  disabled={procesando}
                  className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {modo === 'idle' && (
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={onPedirAprobar}
                className="rounded-full bg-teal text-paper px-4 py-1.5 font-sans text-sm hover:opacity-90"
              >
                Aprobar
              </button>
              <button
                type="button"
                onClick={onPedirRechazar}
                className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink/70 hover:bg-ink/5"
              >
                Rechazar
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function BadgeEstado({ estado }) {
  const config = {
    pendiente: { label: 'Pendiente', bg: 'bg-copper/15', fg: 'text-copper' },
    aprobada:  { label: 'Aprobada',  bg: 'bg-teal/15',   fg: 'text-teal'   },
    rechazada: { label: 'Rechazada', bg: 'bg-ink/10',    fg: 'text-ink/70' },
  }
  const c = config[estado] || config.pendiente
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-sans whitespace-nowrap ${c.bg} ${c.fg}`}>
      {c.label}
    </span>
  )
}

