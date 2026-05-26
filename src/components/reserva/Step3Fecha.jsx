// Paso 3: elegir día y hora.
// Día actual mostrado MONUMENTAL (número gigante + mes). Day picker scroll
// horizontal con chips compactos (día de semana + número). Slots como
// botones serif con borde fino.
//
// Lógica de disponibilidad: idéntica a la versión anterior — solo cambia
// el rendering visual.

import { useEffect, useMemo, useState } from 'react'
import StepHeader from './StepHeader'
import {
  proximosDias,
  diaSemana,
  formatearFecha,
} from '../../lib/fechas'
import { normalizarDia } from '../../lib/horarios'
import { getSlotsOcupadosDelDia } from '../../services/slots'
import { getProfesionales } from '../../services/profesionales'
import { getHorariosDisponibles } from '../../services/disponibilidad'

const NOMBRES_DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function Step3Fecha({
  negocio,
  servicio,
  profesional,
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

      let profesionalesAEvaluar = []
      if (profesional.id) {
        profesionalesAEvaluar = [{ id: profesional.id }]
      } else {
        profesionalesAEvaluar = await getProfesionales(negocio.id)
      }

      const setLibres = new Set()
      for (const p of profesionalesAEvaluar) {
        const ocupados = await getSlotsOcupadosDelDia(negocio.id, fechaStr, {
          profesionalId: p.id,
        })
        const libres = getHorariosDisponibles({
          horarioDia,
          turnos: ocupados,
          duracionMin: servicio.duracionMinutos,
          esHoy: fechaStr === formatearFecha(new Date()),
        })
        libres.forEach((s) => setLibres.add(s))
      }
      if (cancelado) return
      setHorariosLibres([...setLibres].sort())
      setCargando(false)
    }
    calcular()
    return () => { cancelado = true }
  }, [diaElegido, negocio, servicio, profesional])

  const nombreDiaLargo = NOMBRES_DIAS_CORTOS[diaElegido.getDay()]
  const nombreMes = NOMBRES_MESES[diaElegido.getMonth()]

  return (
    <section>
      <div className="reveal-up"><StepHeader titulo="¿Cuándo te conviene?" /></div>

      {/* Día seleccionado MONUMENTAL */}
      <div className="my-8 sm:my-10 reveal-up delay-1">
        <p className="eyebrow text-ink/45">{nombreDiaLargo}</p>
        <p className="display-mono text-ink text-[3.5rem] sm:text-[4.5rem] mt-1 flex items-baseline gap-3">
          <span>{diaElegido.getDate()}</span>
          <span
            className="font-serif italic text-2xl sm:text-3xl font-light"
            style={{ color: colorAcento }}
          >
            ·
          </span>
          <span className="font-serif text-2xl sm:text-3xl text-ink/60 font-light">
            {nombreMes}
          </span>
        </p>
      </div>

      {/* Day picker horizontal */}
      <div className="reveal-up delay-2 -mx-6 px-6 overflow-x-auto pb-2 mb-10">
        <div className="flex gap-2 w-max">
          {dias.map((d) => {
            const seleccionado = formatearFecha(d) === formatearFecha(diaElegido)
            const cerrado = !normalizarDia(
              negocio.horariosAtencion?.[diaSemana(d)]
            ).abierto

            if (cerrado) {
              return (
                <button
                  key={formatearFecha(d)}
                  type="button"
                  disabled
                  aria-disabled
                  className="rounded-2xl border border-ink/10 px-3.5 py-3 text-center cursor-not-allowed bg-paper"
                  title="Cerrado"
                >
                  <p className="eyebrow text-ink/25">
                    {NOMBRES_DIAS_CORTOS[d.getDay()]}
                  </p>
                  <p className="font-serif text-xl text-ink/25 font-light mt-1">
                    {d.getDate()}
                  </p>
                  <p className="font-sans text-[9px] text-ink/30 mt-0.5 tracking-widest uppercase">
                    Cerrado
                  </p>
                </button>
              )
            }

            return (
              <button
                key={formatearFecha(d)}
                type="button"
                onClick={() => setDiaElegido(d)}
                className="card-editorial rounded-2xl border px-3.5 py-3 text-center transition"
                style={
                  seleccionado
                    ? {
                        backgroundColor: colorAcento,
                        color: '#F5F1EA',
                        borderColor: colorAcento,
                      }
                    : { borderColor: 'rgba(15,20,25,0.12)', color: '#0F1419' }
                }
              >
                <p
                  className="eyebrow"
                  style={{ color: seleccionado ? 'rgba(245,241,234,0.7)' : 'rgba(15,20,25,0.45)' }}
                >
                  {NOMBRES_DIAS_CORTOS[d.getDay()]}
                </p>
                <p className="font-serif text-xl font-light mt-1">
                  {d.getDate()}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Slots */}
      <div className="reveal-up delay-3">
        <p className="eyebrow text-ink/45 mb-4">Horarios disponibles</p>
        {cargando ? (
          <p className="font-sans text-ink/50 text-sm">Buscando…</p>
        ) : horariosLibres.length === 0 ? (
          <p className="font-sans text-ink/60 text-sm">
            No hay horarios para este día. Probá otro.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {horariosLibres.map((h, i) => (
              <button
                key={h}
                type="button"
                onClick={() => onElegir({ fecha: formatearFecha(diaElegido), hora: h })}
                className="card-editorial rounded-2xl border border-ink/12 bg-white py-3.5 font-serif text-ink text-lg font-light transition hover:border-[var(--accent)] reveal-up"
                style={{ animationDelay: `${0.35 + Math.min(i, 11) * 0.025}s` }}
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
