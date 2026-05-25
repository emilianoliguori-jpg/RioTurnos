// Card de un turno en la agenda del dueño.
// Muestra info + acciones según el estado.
// La confirmación de cancelado y el form de reagendado los maneja el padre
// (SeccionAgenda) — esta card es presentacional salvo por las acciones.

import { formatearPrecio } from '../../lib/formato'

export default function TurnoCard({
  turno,
  mostrarFecha = false, // true en la vista cross-day de pendientes
  confirmandoNegativa,
  onPedirNegativa,
  onConfirmarNegativa,
  onAbortarNegativa,
  onMarcarAtendido,
  onPedirReagendar,
  onConfirmarPago,
}) {
  const cancelado = turno.estado === 'cancelado'
  const atendido  = turno.estado === 'atendido'
  const pendiente = turno.estado === 'pendiente_pago'

  // Texto del flujo de cancelación: "Cancelar" para confirmados, "Rechazar"
  // para pendientes_pago (no pagaron / no enviaron comprobante).
  const labelNegativa = pendiente ? 'Rechazar' : 'Cancelar'
  const preguntaNegativa = pendiente ? '¿Rechazar este turno?' : '¿Cancelar este turno?'
  const confirmarLabelNegativa = pendiente ? 'Sí, rechazar' : 'Sí, cancelar'

  return (
    <article
      className={`rounded-2xl border bg-white p-5 transition ${
        cancelado ? 'border-ink/10 opacity-60' : pendiente ? 'border-copper/40' : 'border-ink/10'
      }`}
    >
      {/* Hora (+ fecha si aplica) + estado */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {mostrarFecha && (
            <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
              {turno.fecha}
            </p>
          )}
          <p
            className={`font-serif text-2xl font-light leading-none ${
              cancelado ? 'line-through text-ink/50' : 'text-ink'
            }`}
          >
            {turno.hora}
          </p>
        </div>
        <BadgeEstado estado={turno.estado} />
      </div>

      {/* Cliente + servicio */}
      <div className="mt-3">
        <p
          className={`font-sans font-medium ${
            cancelado ? 'line-through text-ink/50' : 'text-ink'
          }`}
        >
          {turno.datosCliente?.nombre || 'Sin nombre'}
        </p>
        <p className="font-sans text-ink/60 text-sm mt-0.5">
          {turno.servicioNombre} · {turno.duracionMinutos} min
          {turno.profesionalNombre && ` · ${turno.profesionalNombre}`}
        </p>
      </div>

      {/* Monto a cobrar / cobrado */}
      {turno.montoCobrado != null && (
        <p className="font-sans text-ink/70 text-sm mt-2">
          <span className="text-ink/50">
            {turno.tipoCobroAplicado === 'total' ? 'Total' : 'Seña'}:
          </span>{' '}
          <span className="font-medium">{formatearPrecio(turno.montoCobrado)}</span>
        </p>
      )}

      {/* Contacto */}
      {(turno.datosCliente?.whatsapp || turno.datosCliente?.email) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-sans text-ink/60 text-xs">
          {turno.datosCliente?.whatsapp && (
            <span>📱 {turno.datosCliente.whatsapp}</span>
          )}
          {turno.datosCliente?.email && (
            <span className="break-all">✉ {turno.datosCliente.email}</span>
          )}
        </div>
      )}

      {/* Comprobante (si el cliente lo subió en la app — si no, vino por WhatsApp) */}
      {turno.urlComprobante && (
        <div className="mt-3">
          <a
            href={turno.urlComprobante}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 font-sans text-xs text-ink hover:bg-ink/5 transition"
          >
            <IconoArchivo />
            Ver comprobante
          </a>
        </div>
      )}

      {/* Acciones — escondidas para cancelados y atendidos */}
      {!cancelado && !atendido && (
        <div className="mt-4">
          {confirmandoNegativa ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-sans text-sm text-ink">{preguntaNegativa}</span>
              <button
                type="button"
                onClick={onConfirmarNegativa}
                className="rounded-full bg-copper text-paper px-4 py-1.5 font-sans text-sm hover:opacity-90"
              >
                {confirmarLabelNegativa}
              </button>
              <button
                type="button"
                onClick={onAbortarNegativa}
                className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5"
              >
                No
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pendiente ? (
                <button
                  type="button"
                  onClick={onConfirmarPago}
                  className="rounded-full bg-teal text-paper px-4 py-1.5 font-sans text-sm hover:opacity-90"
                >
                  Confirmar pago
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onMarcarAtendido}
                  className="rounded-full bg-teal text-paper px-4 py-1.5 font-sans text-sm hover:opacity-90"
                >
                  Marcar atendido
                </button>
              )}
              <button
                type="button"
                onClick={onPedirReagendar}
                className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5"
              >
                Reagendar
              </button>
              <button
                type="button"
                onClick={onPedirNegativa}
                className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink/70 hover:bg-ink/5"
              >
                {labelNegativa}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function IconoArchivo() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function BadgeEstado({ estado }) {
  const config = {
    confirmado:     { label: 'Confirmado',       bg: 'bg-ink/10',    fg: 'text-ink/70'  },
    pendiente_pago: { label: 'Pendiente de pago', bg: 'bg-copper/15', fg: 'text-copper'  },
    atendido:       { label: 'Atendido',         bg: 'bg-teal/15',   fg: 'text-teal'    },
    cancelado:      { label: 'Cancelado',        bg: 'bg-copper/15', fg: 'text-copper'  },
  }
  const c = config[estado] || config.confirmado
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-sans whitespace-nowrap ${c.bg} ${c.fg}`}>
      {c.label}
    </span>
  )
}
