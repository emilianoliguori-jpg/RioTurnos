// Una columna de la grilla = un profesional (o "Sin asignar" para turnos
// huérfanos). Contiene:
//   - Header sticky con el nombre del profesional.
//   - Fondo gris en franjas cerradas (descansos / fuera de atención).
//   - Bloques de turnos posicionados absolutamente.
//   - Botones "libre" clickeables en los huecos de 30min disponibles.

import { horaAMinutos, minutosAHora } from '../../../lib/fechas'
import BloqueTurno from './BloqueTurno'

const STEP_LIBRE = 30 // granularidad de "hueco libre" clickeable

export default function ColumnaProfesional({
  profesional,             // { id, nombre } o { id: null, nombre: 'Sin asignar' }
  turnos,
  rangoVisible,            // { minVisible, maxVisible, franjasAbiertas, franjasCerradas }
  pxPorMin,
  onClickTurno,
  onClickLibre,            // (profesionalId, horaStr) => void | null para no permitirlo
}) {
  const { minVisible, maxVisible, franjasAbiertas, franjasCerradas } = rangoVisible
  const totalMin = maxVisible - minVisible

  // Calculo huecos libres (slots de 30min en franjas abiertas, sin solape con turnos).
  const huecos = onClickLibre
    ? calcularHuecos({ franjasAbiertas, turnos })
    : []

  return (
    <div className="w-40 sm:w-44 flex-shrink-0 border-r border-ink/10">
      {/* Header */}
      <div className="sticky top-0 bg-paper border-b border-ink/10 px-2 py-2 z-[1]">
        <p className="font-sans text-sm text-ink font-medium truncate text-center">
          {profesional.nombre || '—'}
        </p>
      </div>

      {/* Body */}
      <div
        className="relative bg-white"
        style={{ height: `${totalMin * pxPorMin}px` }}
      >
        {/* Franjas cerradas (fondo gris a rayas) */}
        {franjasCerradas.map((f, i) => (
          <div
            key={`cerrada-${i}`}
            className="absolute left-0 right-0 bg-ink/[0.06]"
            style={{
              top: `${(f.inicio - minVisible) * pxPorMin}px`,
              height: `${(f.fin - f.inicio) * pxPorMin}px`,
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent 0 6px, rgba(15,20,25,0.04) 6px 12px)',
            }}
            title="Cerrado"
          />
        ))}

        {/* Huecos libres clickeables */}
        {huecos.map((h, i) => (
          <button
            key={`libre-${i}`}
            type="button"
            onClick={() =>
              onClickLibre(profesional.id, minutosAHora(h.inicio))
            }
            className="absolute left-1 right-1 rounded-md text-[10px] font-sans text-ink/30 hover:text-teal hover:bg-teal/10 transition flex items-center justify-center"
            style={{
              top: `${(h.inicio - minVisible) * pxPorMin}px`,
              height: `${(h.fin - h.inicio) * pxPorMin}px`,
            }}
            title={`Libre — agregar turno a las ${minutosAHora(h.inicio)}`}
          >
            +
          </button>
        ))}

        {/* Turnos (encima de todo) */}
        {turnos.map((t) => (
          <BloqueTurno
            key={t.id}
            turno={t}
            minVisible={minVisible}
            pxPorMin={pxPorMin}
            onClick={() => onClickTurno(t)}
          />
        ))}
      </div>
    </div>
  )
}

// Genera slots de 30min libres dentro de las franjas abiertas, descartando
// los que se solapan (aunque sea parcial) con algún turno existente.
function calcularHuecos({ franjasAbiertas, turnos }) {
  // Marcamos cada minuto ocupado (granularidad 15min para detectar solapes).
  const ocupados = new Set()
  for (const t of turnos) {
    if (!t.hora || !t.duracionMinutos) continue
    const ini = horaAMinutos(t.hora)
    for (let m = ini; m < ini + t.duracionMinutos; m += 15) {
      ocupados.add(m)
    }
  }

  const libres = []
  for (const franja of franjasAbiertas) {
    for (let t = franja.inicio; t + STEP_LIBRE <= franja.fin; t += STEP_LIBRE) {
      let solapado = false
      for (let m = t; m < t + STEP_LIBRE; m += 15) {
        if (ocupados.has(m)) {
          solapado = true
          break
        }
      }
      if (!solapado) libres.push({ inicio: t, fin: t + STEP_LIBRE })
    }
  }
  return libres
}
