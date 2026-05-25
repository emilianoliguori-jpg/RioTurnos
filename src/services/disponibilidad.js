// Servicio: cálculo de horarios disponibles.
//
// Esto es lógica PURA (no toca Firestore). Recibe:
//   - el horario de atención del día,
//   - los turnos ya tomados ese día por ese profesional,
//   - la duración del servicio elegido,
// y devuelve la lista de slots libres como array de "HH:MM".
//
// Granularidad: 15 minutos (los slots arrancan en :00, :15, :30, :45). Es el
// estándar de la industria de turnos y deja flexibilidad sin saturar la UI.
//
// Reglas:
//   - El slot tiene que arrancar dentro del horario de atención.
//   - El slot tiene que TERMINAR antes (o exactamente cuando) cierra el local.
//   - El slot no se puede solapar con ningún turno existente del profesional.
//   - Si el día es hoy, los slots que ya pasaron quedan afuera.

import { horaAMinutos, minutosAHora } from '../lib/fechas'

const GRANULARIDAD_MIN = 15

// horarioDia: { abre: "09:00", cierra: "19:00", cerrado: false } o { cerrado: true }
// turnos: array de { hora: "HH:MM", duracionMinutos: number }
// duracionMin: duración del servicio que se quiere reservar
// esHoy: bool — si es true, descarta horarios anteriores a "ahora"
export function getHorariosDisponibles({
  horarioDia,
  turnos,
  duracionMin,
  esHoy = false,
}) {
  if (!horarioDia || horarioDia.cerrado) return []

  const abre = horaAMinutos(horarioDia.abre)
  const cierra = horaAMinutos(horarioDia.cierra)

  // Convierto turnos a rangos [inicio, fin) en minutos.
  const ocupados = turnos.map((t) => {
    const inicio = horaAMinutos(t.hora)
    return [inicio, inicio + (t.duracionMinutos || 0)]
  })

  // Piso "ahora" si es hoy.
  let pisoAhora = -Infinity
  if (esHoy) {
    const ahora = new Date()
    pisoAhora = ahora.getHours() * 60 + ahora.getMinutes()
  }

  const slots = []
  for (let t = abre; t + duracionMin <= cierra; t += GRANULARIDAD_MIN) {
    if (t < pisoAhora) continue
    const seSolapa = ocupados.some(([ini, fin]) => t < fin && t + duracionMin > ini)
    if (!seSolapa) slots.push(minutosAHora(t))
  }
  return slots
}
