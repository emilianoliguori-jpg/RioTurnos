// Paso 3: elegir día y hora.
// Calcula los horarios disponibles del día/profesional usando el servicio
// `disponibilidad` (lógica pura) y los turnos existentes (Firestore).

import { useEffect, useMemo, useState } from 'react'
import StepHeader from './StepHeader'
import {
  proximosDias,
  diaSemana,
  formatearFecha,
  etiquetaDia,
} from '../../lib/fechas'
import { normalizarDia } from '../../lib/horarios'
import { getTurnosDelDia } from '../../services/turnos'
import { getProfesionales } from '../../services/profesionales'
import { getHorariosDisponibles } from '../../services/disponibilidad'

export default function Step3Fecha({
  negocio,
  servicio,
  profesional, // puede ser { id: null } = "cualquiera"
  onElegir,
  colorAcento,
}) {
  const dias = useMemo(() => proximosDias(14), [])
  const [diaElegido, setDiaElegido] = useState(dias[0])
  const [horariosLibres, setHorariosLibres] = useState([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function calcular() {
      setCargando(true)
      const fechaStr = formatearFecha(diaElegido)
      const horarioDia = negocio.horariosAtencion?.[diaSemana(diaElegido)]

      // Si eligió un profesional concreto, sólo miramos sus turnos.
      // Si eligió "cualquiera", tomamos todos los profesionales activos: hay
      // disponibilidad si ALGUNO de ellos tiene el slot libre.
      let profesionalesAEvaluar = []
      if (profesional.id) {
        profesionalesAEvaluar = [{ id: profesional.id }]
      } else {
        profesionalesAEvaluar = await getProfesionales(negocio.id)
      }

      const setLibres = new Set()
      for (const p of profesionalesAEvaluar) {
        const turnos = await getTurnosDelDia(negocio.id, fechaStr, { profesionalId: p.id })
        const slots = getHorariosDisponibles({
          horarioDia,
          turnos,
          duracionMin: servicio.duracionMinutos,
          esHoy: fechaStr === formatearFecha(new Date()),
        })
        slots.forEach((s) => setLibres.add(s))
      }
      if (cancelado) return
      setHorariosLibres([...setLibres].sort())
      setCargando(false)
    }
    calcular()
    return () => {
      cancelado = true
    }
  }, [diaElegido, negocio, servicio, profesional])

  return (
    <section>
      <StepHeader titulo="¿Qué día y hora?" />

      {/* Selector de día — scroll horizontal mobile-first */}
      <div className="-mx-6 px-6 overflow-x-auto pb-2">
        <div className="flex gap-2 w-max">
          {dias.map((d) => {
            const seleccionado = formatearFecha(d) === formatearFecha(diaElegido)
            const cerrado = !normalizarDia(
              negocio.horariosAtencion?.[diaSemana(d)]
            ).abierto

            // Días cerrados quedan visualmente atenuados y no clickeables.
            if (cerrado) {
              return (
                <button
                  key={formatearFecha(d)}
                  type="button"
                  disabled
                  aria-disabled
                  className="rounded-2xl border border-ink/10 px-4 py-3 font-sans text-sm whitespace-nowrap text-ink/30 cursor-not-allowed bg-paper"
                  title="Cerrado"
                >
                  {etiquetaDia(d)}
                  <span className="block text-[10px] uppercase tracking-wider mt-0.5">
                    Cerrado
                  </span>
                </button>
              )
            }

            return (
              <button
                key={formatearFecha(d)}
                type="button"
                onClick={() => setDiaElegido(d)}
                className="rounded-2xl border px-4 py-3 font-sans text-sm whitespace-nowrap transition"
                style={
                  seleccionado
                    ? {
                        backgroundColor: colorAcento,
                        color: '#F5F1EA',
                        borderColor: colorAcento,
                      }
                    : { borderColor: 'rgba(15,20,25,0.15)', color: '#0F1419' }
                }
              >
                {etiquetaDia(d)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selector de hora */}
      <div className="mt-6">
        {cargando ? (
          <p className="font-sans text-ink/50 text-sm">Buscando horarios…</p>
        ) : horariosLibres.length === 0 ? (
          <p className="font-sans text-ink/60 text-sm">
            No hay horarios disponibles para este día. Probá otro.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {horariosLibres.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onElegir({ fecha: formatearFecha(diaElegido), hora: h })}
                className="rounded-xl border border-ink/15 py-3 font-sans text-sm text-ink hover:bg-ink/5 transition"
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
