// Utilidades para el horario de atención del negocio.
//
// Estructura canónica (en Firestore, dentro de `negocio.horariosAtencion`):
//   {
//     lunes:   { abierto: true,  franjas: [{ horaInicio: "09:00", horaFin: "13:00" }, ...] },
//     domingo: { abierto: false, franjas: [] },
//     ...
//   }
//
// Mantenemos compatibilidad con la estructura vieja del seed inicial
// ({ abre, cierra, cerrado }) — `normalizarDia` la convierte sola.

import { horaAMinutos } from './fechas'

export const DIAS_SEMANA = [
  { key: 'lunes',     label: 'Lunes' },
  { key: 'martes',    label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves' },
  { key: 'viernes',   label: 'Viernes' },
  { key: 'sabado',    label: 'Sábado' },
  { key: 'domingo',   label: 'Domingo' },
]

// Lleva cualquier forma soportada a `{ abierto, franjas }`.
// - Si el día no existe o está cerrado → { abierto: false, franjas: [] }.
// - Si vino en el formato nuevo, lo deja como está.
// - Si vino en el formato viejo (abre/cierra/cerrado), lo migra a una franja.
export function normalizarDia(horarioDia) {
  if (!horarioDia) return { abierto: false, franjas: [] }

  // Formato nuevo
  if (Array.isArray(horarioDia.franjas)) {
    return {
      abierto: !!horarioDia.abierto,
      franjas: horarioDia.franjas.map((f) => ({
        horaInicio: f.horaInicio,
        horaFin: f.horaFin,
      })),
    }
  }

  // Formato viejo
  if (horarioDia.cerrado) return { abierto: false, franjas: [] }
  if (horarioDia.abre && horarioDia.cierra) {
    return {
      abierto: true,
      franjas: [{ horaInicio: horarioDia.abre, horaFin: horarioDia.cierra }],
    }
  }
  return { abierto: false, franjas: [] }
}

// Normaliza el mapa completo de días, asegurando que todos los días estén
// presentes (los que no, vienen cerrados).
export function normalizarHorarios(horariosAtencion = {}) {
  const out = {}
  for (const { key } of DIAS_SEMANA) {
    out[key] = normalizarDia(horariosAtencion[key])
  }
  return out
}

// Devuelve un mensaje de error si la franja no es válida, o null si lo es.
// "HH:MM" se compara como string porque está zero-padded.
export function franjaInvalida({ horaInicio, horaFin }) {
  if (!horaInicio || !horaFin) return 'Completá ambas horas.'
  if (horaInicio >= horaFin) return 'La hora de fin debe ser posterior al inicio.'
  return null
}

// Para la vista grilla del día: calcula el rango visible (de la primera
// franja abierta a la última) y los huecos cerrados intermedios.
// Devuelve null si el día está cerrado o sin franjas.
//   minVisible, maxVisible: minutos desde medianoche.
//   franjasAbiertas: [{ inicio, fin }] en minutos.
//   franjasCerradas: huecos ENTRE franjas (ej: descanso del mediodía).
export function calcularRangoVisible(horarioDia) {
  const dia = normalizarDia(horarioDia)
  if (!dia.abierto || dia.franjas.length === 0) return null

  const franjas = dia.franjas
    .filter((f) => f.horaInicio && f.horaFin)
    .map((f) => ({
      inicio: horaAMinutos(f.horaInicio),
      fin: horaAMinutos(f.horaFin),
    }))
    .filter((f) => f.fin > f.inicio)
    .sort((a, b) => a.inicio - b.inicio)

  if (franjas.length === 0) return null

  const minVisible = franjas[0].inicio
  const maxVisible = franjas[franjas.length - 1].fin

  const franjasCerradas = []
  for (let i = 1; i < franjas.length; i++) {
    if (franjas[i].inicio > franjas[i - 1].fin) {
      franjasCerradas.push({
        inicio: franjas[i - 1].fin,
        fin: franjas[i].inicio,
      })
    }
  }

  return { minVisible, maxVisible, franjasAbiertas: franjas, franjasCerradas }
}

// True si dos o más franjas válidas del mismo día se solapan en el tiempo.
export function franjasSeSolapan(franjas) {
  const validas = franjas
    .filter((f) => f.horaInicio && f.horaFin && f.horaInicio < f.horaFin)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  for (let i = 1; i < validas.length; i++) {
    if (validas[i].horaInicio < validas[i - 1].horaFin) return true
  }
  return false
}
