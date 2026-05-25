// Form mínimo para reagendar un turno: solo cambia fecha y hora.
// Mantiene el servicio, profesional y cliente. Respeta la disponibilidad
// (excluye el propio turno para no autobloquearse).

import { useState } from 'react'
import SelectorFechaHora from './SelectorFechaHora'

export default function ReagendarForm({
  negocio,
  turno,
  onConfirmar,   // ({fecha, hora}) => Promise
  onCancelar,
  colorAcento,
}) {
  const [nuevo, setNuevo] = useState(null) // {fecha, hora} | null
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  async function confirmar() {
    if (!nuevo || guardando) return
    setGuardando(true)
    setError(null)
    try {
      await onConfirmar(nuevo)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError('No pudimos reagendar. Probá de nuevo.')
      setGuardando(false)
    }
  }

  return (
    <article className="rounded-2xl border border-teal/40 bg-white p-5 space-y-4">
      <div>
        <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
          Reagendando turno de
        </p>
        <p className="font-sans text-ink font-medium mt-0.5">
          {turno.datosCliente?.nombre || 'Sin nombre'}
        </p>
        <p className="font-sans text-ink/60 text-sm">
          {turno.servicioNombre} · {turno.duracionMinutos} min
          {turno.profesionalNombre && ` · ${turno.profesionalNombre}`}
        </p>
        <p className="font-sans text-ink/50 text-xs mt-1">
          Antes: {turno.fecha} {turno.hora}
        </p>
      </div>

      <SelectorFechaHora
        negocio={negocio}
        duracionMin={turno.duracionMinutos}
        profesionalId={turno.profesionalId}
        excluirTurnoId={turno.id}
        fechaInicial={turno.fecha}
        elegido={nuevo}
        onElegir={setNuevo}
        colorAcento={colorAcento}
      />

      {error && <p className="font-sans text-copper text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={confirmar}
          disabled={!nuevo || guardando}
          className="rounded-full bg-teal text-paper px-5 py-2.5 font-sans text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {guardando ? 'Guardando…' : 'Confirmar reagendado'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          className="rounded-full border border-ink/15 px-5 py-2.5 font-sans text-sm text-ink hover:bg-ink/5"
        >
          Cancelar
        </button>
      </div>
    </article>
  )
}
