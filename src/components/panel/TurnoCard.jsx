// Card de un turno en la agenda del dueño.
// Muestra info + acciones según el estado.
// La confirmación de cancelado y el form de reagendado los maneja el padre
// (SeccionAgenda) mediante flags + callbacks — esta card es presentacional
// salvo por el botón inicial de cada acción.

export default function TurnoCard({
  turno,
  confirmandoCancelar,
  onPedirCancelar,
  onConfirmarCancelar,
  onAbortarCancelar,
  onMarcarAtendido,
  onPedirReagendar,
}) {
  const cancelado = turno.estado === 'cancelado'
  const atendido  = turno.estado === 'atendido'

  return (
    <article
      className={`rounded-2xl border bg-white p-5 transition ${
        cancelado ? 'border-ink/10 opacity-60' : 'border-ink/10'
      }`}
    >
      {/* Hora + estado */}
      <div className="flex items-start justify-between gap-4">
        <p
          className={`font-serif text-2xl font-light leading-none ${
            cancelado ? 'line-through text-ink/50' : 'text-ink'
          }`}
        >
          {turno.hora}
        </p>
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

      {/* Acciones */}
      {!cancelado && !atendido && (
        <div className="mt-4">
          {confirmandoCancelar ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-sans text-sm text-ink">¿Cancelar este turno?</span>
              <button
                type="button"
                onClick={onConfirmarCancelar}
                className="rounded-full bg-copper text-paper px-4 py-1.5 font-sans text-sm hover:opacity-90"
              >
                Sí, cancelar
              </button>
              <button
                type="button"
                onClick={onAbortarCancelar}
                className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5"
              >
                No
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onMarcarAtendido}
                className="rounded-full bg-teal text-paper px-4 py-1.5 font-sans text-sm hover:opacity-90"
              >
                Marcar atendido
              </button>
              <button
                type="button"
                onClick={onPedirReagendar}
                className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5"
              >
                Reagendar
              </button>
              <button
                type="button"
                onClick={onPedirCancelar}
                className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink/70 hover:bg-ink/5"
              >
                Cancelar
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
    confirmado: { label: 'Confirmado', bg: 'bg-ink/10',    fg: 'text-ink/70'  },
    atendido:   { label: 'Atendido',   bg: 'bg-teal/15',   fg: 'text-teal'    },
    cancelado:  { label: 'Cancelado',  bg: 'bg-copper/15', fg: 'text-copper'  },
  }
  const c = config[estado] || config.confirmado
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-sans ${c.bg} ${c.fg}`}>
      {c.label}
    </span>
  )
}
