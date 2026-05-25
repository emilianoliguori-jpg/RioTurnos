// Servicio: cálculo de horarios disponibles.
//
// Esto es lógica PURA (no toca Firestore). Recibe:
//   - el horario de atención del día (puede tener varias franjas),
//   - los turnos ya tomados ese día por ese profesional,
//   - la duración del servicio elegido,
// y devuelve la lista de slots libres como array de "HH:MM".
//
// Granularidad: 15 minutos (los slots arrancan en :00, :15, :30, :45).
//
// Reglas:
//   - El slot tiene que arrancar dentro de UNA franja de atención del día.
//   - El slot tiene que TERMINAR antes (o exactamente al final) de la franja.
//     No "salta" entre franjas — si el local cierra para descansar, ningún
//     servicio puede usar ese hueco aunque dure poco.
//   - No solaparse con ningún turno existente del profesional.
//   - Si el día es hoy, los slots que ya pasaron quedan afuera.
//   - Si el día está cerrado o no tiene franjas, devuelve [].

import { horaAMinutos, minutosAHora } from '../lib/fechas'
import { normalizarDia } from '../lib/horarios'

const GRANULARIDAD_MIN = 15

export function getHorariosDisponibles({
  horarioDia,
  turnos,
  duracionMin,
  esHoy = false,
}) {
  const dia = normalizarDia(horarioDia)
  if (!dia.abierto || dia.franjas.length === 0) return []

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
  for (const franja of dia.franjas) {
    if (!franja.horaInicio || !franja.horaFin) continue
    const inicio = horaAMinutos(franja.horaInicio)
    const fin = horaAMinutos(franja.horaFin)
    for (let t = inicio; t + duracionMin <= fin; t += GRANULARIDAD_MIN) {
      if (t < pisoAhora) continue
      const seSolapa = ocupados.some(([ini, finO]) => t < finO && t + duracionMin > ini)
      if (!seSolapa) slots.push(minutosAHora(t))
    }
  }

  // Si por solapamiento entre franjas (no debería pasar con buena validación
  // en el panel) hubiera duplicados, los quitamos y ordenamos.
  return [...new Set(slots)].sort()
}
