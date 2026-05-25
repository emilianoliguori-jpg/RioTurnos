// Selector compacto de fecha + hora para los forms del panel
// (alta manual y reagendado). Reutiliza el motor de disponibilidad para que
// solo se ofrezcan slots realmente libres.
//
// Props:
//   negocio          → para horariosAtencion
//   duracionMin      → duración del servicio (ya elegido)
//   profesionalId    → string | null (null = "cualquiera": evaluamos todos)
//   excluirTurnoId   → null | turnoId — útil al REAGENDAR para que el slot
//                       del propio turno no se cuente como ocupado
//   fechaInicial     → "YYYY-MM-DD" — default hoy
//   onElegir         → ({ fecha, hora }) => void
//   elegido          → { fecha, hora } | null — para resaltar el slot elegido

import { useEffect, useState } from 'react'
import {
  formatearFecha,
  parsearFecha,
  diaSemana,
} from '../../lib/fechas'
import { normalizarDia } from '../../lib/horarios'
import { getSlotsOcupadosDelDia } from '../../services/slots'
import { getProfesionales } from '../../services/profesionales'
import { getHorariosDisponibles } from '../../services/disponibilidad'

export default function SelectorFechaHora({
  negocio,
  duracionMin,
  profesionalId = null,
  excluirTurnoId = null,
  fechaInicial,
  onElegir,
  elegido = null,
  colorAcento = '#0B6E6E',
}) {
  const [fechaStr, setFechaStr] = useState(
    fechaInicial || formatearFecha(new Date())
  )
  const [slots, setSlots] = useState([])
  const [cargando, setCargando] = useState(false)
  const [diaCerrado, setDiaCerrado] = useState(false)

  useEffect(() => {
    if (!duracionMin) return
    let cancelado = false
    async function calcular() {
      setCargando(true)
      const fechaDate = parsearFecha(fechaStr)
      const horarioDia = negocio.horariosAtencion?.[diaSemana(fechaDate)]
      const dia = normalizarDia(horarioDia)
      if (!dia.abierto) {
        if (!cancelado) {
          setSlots([])
          setDiaCerrado(true)
          setCargando(false)
        }
        return
      }

      // Profesionales a evaluar
      let profsAEvaluar = []
      if (profesionalId) {
        profsAEvaluar = [{ id: profesionalId }]
      } else {
        profsAEvaluar = await getProfesionales(negocio.id)
      }

      const setLibres = new Set()
      for (const p of profsAEvaluar) {
        // Lee de slots (público). El id del slot = id del turno, así el
        // filtro de excluirTurnoId al reagendar sigue funcionando igual.
        let ocupados = await getSlotsOcupadosDelDia(negocio.id, fechaStr, {
          profesionalId: p.id,
        })
        if (excluirTurnoId) {
          ocupados = ocupados.filter((s) => s.id !== excluirTurnoId)
        }
        const libres = getHorariosDisponibles({
          horarioDia,
          turnos: ocupados,
          duracionMin,
          esHoy: fechaStr === formatearFecha(new Date()),
        })
        libres.forEach((h) => setLibres.add(h))
      }

      if (cancelado) return
      setSlots([...setLibres].sort())
      setDiaCerrado(false)
      setCargando(false)
    }
    calcular()
    return () => {
      cancelado = true
    }
  }, [negocio, duracionMin, profesionalId, excluirTurnoId, fechaStr])

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-1.5">
          Fecha
        </span>
        <input
          type="date"
          value={fechaStr}
          onChange={(e) => e.target.value && setFechaStr(e.target.value)}
          className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-ink focus:outline-none focus:border-ink/40"
        />
      </label>

      <div>
        <span className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-1.5">
          Horarios libres
        </span>
        {!duracionMin ? (
          <p className="font-sans text-ink/50 text-sm">
            Elegí primero un servicio.
          </p>
        ) : cargando ? (
          <p className="font-sans text-ink/50 text-sm">Buscando…</p>
        ) : diaCerrado ? (
          <p className="font-sans text-ink/60 text-sm">El local está cerrado ese día.</p>
        ) : slots.length === 0 ? (
          <p className="font-sans text-ink/60 text-sm">
            No hay horarios disponibles para esta fecha.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((h) => {
              const seleccionado =
                elegido && elegido.fecha === fechaStr && elegido.hora === h
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => onElegir({ fecha: fechaStr, hora: h })}
                  className="rounded-xl border py-2.5 font-sans text-sm transition"
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
                  {h}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
