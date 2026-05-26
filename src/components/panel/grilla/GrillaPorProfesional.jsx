// Vista grilla del día por profesional.
// Recibe los turnos y profesionales ya cargados desde SeccionAgenda — es
// presentacional.
//
// Mobile-first: contenedor con `overflow-x-auto` y la columna de horas
// `sticky left-0` para no perder referencia mientras scrolleás columnas.

import { calcularRangoVisible } from '../../../lib/horarios'
import EjeHoras from './EjeHoras'
import ColumnaProfesional from './ColumnaProfesional'

const PX_POR_MIN = 1.5 // 90 px por hora

export default function GrillaPorProfesional({
  negocio,
  fechaStr,
  turnos,            // turnos COMPLETOS del día (incluye cancelados — los filtramos acá)
  profesionales,     // sólo activos
  onClickTurno,      // (turno) => void
  onClickLibre,      // (profesionalId, horaStr) => void
}) {
  const horarioDia = obtenerHorarioDelDia(negocio, fechaStr)
  const rango = calcularRangoVisible(horarioDia)

  if (!rango) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center">
        <p className="font-serif text-xl text-ink font-light">El local está cerrado este día.</p>
        <p className="font-sans text-ink/50 text-sm mt-2">
          Configurá los horarios desde la pestaña Horarios.
        </p>
      </div>
    )
  }

  // Cancelados no aparecen en grilla — la lista sigue mostrándolos.
  const turnosVisibles = turnos.filter((t) => t.estado !== 'cancelado')

  // Agrupar turnos por profesionalId. Los que no matchean ningún profesional
  // activo (inactivos / borrados / null) van a "Sin asignar".
  const idsActivos = new Set(profesionales.map((p) => p.id))
  const porProf = new Map()
  for (const p of profesionales) porProf.set(p.id, [])
  const sinAsignar = []
  for (const t of turnosVisibles) {
    if (t.profesionalId && idsActivos.has(t.profesionalId)) {
      porProf.get(t.profesionalId).push(t)
    } else {
      sinAsignar.push(t)
    }
  }

  // Columnas en orden: profesionales activos primero, "Sin asignar" si hay.
  const columnas = profesionales.map((p) => ({ p, items: porProf.get(p.id) || [] }))
  if (sinAsignar.length > 0) {
    columnas.push({
      p: { id: null, nombre: 'Sin asignar' },
      items: sinAsignar,
    })
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-paper overflow-x-auto">
      <div className="flex min-w-max">
        <EjeHoras
          minVisible={rango.minVisible}
          maxVisible={rango.maxVisible}
          pxPorMin={PX_POR_MIN}
        />
        {columnas.map(({ p, items }) => (
          <ColumnaProfesional
            key={p.id || '__sin__'}
            profesional={p}
            turnos={items}
            rangoVisible={rango}
            pxPorMin={PX_POR_MIN}
            onClickTurno={onClickTurno}
            // No tiene sentido "agregar turno a Sin asignar" — desactivamos.
            onClickLibre={p.id ? onClickLibre : null}
          />
        ))}
      </div>
    </div>
  )
}

// Lee el horario configurado para el día de la fecha dada.
function obtenerHorarioDelDia(negocio, fechaStr) {
  // fechaStr es "YYYY-MM-DD". Para saber qué día de la semana es,
  // construimos un Date local y miramos getDay().
  const [y, m, d] = fechaStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  const key = dias[date.getDay()]
  return negocio.horariosAtencion?.[key]
}
