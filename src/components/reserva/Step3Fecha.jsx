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
        <p className="eyebrow t-soft">{nombreDiaLargo}</p>
        <p className="display-mono t-strong text-[3.5rem] sm:text-[4.5rem] mt-1 flex items-baseline gap-3">
          <span>{diaElegido.getDate()}</span>
          <span
            className="font-serif italic text-2xl sm:text-3xl font-light"
            style={{ color: colorAcento }}
          >
            ·
          </span>
          <span className="font-serif text-2xl sm:text-3xl t-soft font-light">
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
                  className="rounded-2xl border t-border t-surface-2 px-3.5 py-3 text-center cursor-not-allowed"
                  title="Cerrado"
                >
                  <p className="eyebrow t-faded">
                    {NOMBRES_DIAS_CORTOS[d.getDay()]}
                  </p>
                  <p className="font-serif text-xl t-faded font-light mt-1">
                    {d.getDate()}
                  </p>
                  <p className="font-sans text-[10px] t-faded mt-0.5 tracking-widest uppercase">
                    Cerrado
                  </p>
                </button>
              )
            }

            if (seleccionado) {
              return (
                <button
                  key={formatearFecha(d)}
                  type="button"
                  onClick={() => setDiaElegido(d)}
                  className="card-editorial rounded-2xl border px-3.5 py-3 text-center transition"
                  style={{
                    backgroundColor: colorAcento,
                    color: '#F5F1EA',
                    borderColor: colorAcento,
                  }}
                >
                  <p className="eyebrow" style={{ color: 'rgba(245,241,234,0.75)' }}>
                    {NOMBRES_DIAS_CORTOS[d.getDay()]}
                  </p>
                  <p className="font-serif text-xl font-light mt-1">
                    {d.getDate()}
                  </p>
                </button>
              )
            }

            return (
              <button
                key={formatearFecha(d)}
                type="button"
                onClick={() => setDiaElegido(d)}
                className="card-editorial rounded-2xl border t-border t-surface px-3.5 py-3 text-center transition"
              >
                <p className="eyebrow t-soft">
                  {NOMBRES_DIAS_CORTOS[d.getDay()]}
                </p>
                <p className="font-serif text-xl t-strong font-light mt-1">
                  {d.getDate()}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Slots */}
      <div className="reveal-up delay-3">
        <p className="eyebrow t-soft mb-4">Horarios disponibles</p>
        {cargando ? (
          <p className="font-sans t-soft text-sm">Buscando…</p>
        ) : horariosLibres.length === 0 ? (
          <p className="font-sans t-soft text-sm">
            No hay horarios para este día. Probá otro.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {horariosLibres.map((h, i) => (
              <button
                key={h}
                type="button"
                onClick={() => onElegir({ fecha: formatearFecha(diaElegido), hora: h })}
                className="card-editorial rounded-2xl border t-border t-surface py-3.5 font-serif t-strong text-lg font-light transition hover:border-[var(--accent)] reveal-up"
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
