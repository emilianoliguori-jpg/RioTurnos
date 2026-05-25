// Utilidades de fecha/hora para el motor de reservas.
// Trabajamos siempre con strings "YYYY-MM-DD" y "HH:MM" para evitar enredos
// de zona horaria del navegador del cliente vs del negocio (ver modelo-datos.md).

const DIAS_SEMANA = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
]

// Devuelve el nombre del día (key de horariosAtencion) para un Date.
export function diaSemana(date) {
  return DIAS_SEMANA[date.getDay()]
}

// "YYYY-MM-DD" en la zona horaria local.
export function formatearFecha(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Inversa de formatearFecha: parsea "YYYY-MM-DD" como fecha LOCAL (no UTC).
// new Date("2026-05-26") interpreta UTC y puede tirar un día menos en
// zonas con offset negativo — esto lo evita.
export function parsearFecha(yyyyMmDd) {
  const [y, m, d] = yyyyMmDd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Devuelve un array de Date con los próximos N días a partir de hoy (incluido hoy).
export function proximosDias(cantidad = 14) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() + i)
    return d
  })
}

// Convierte "HH:MM" a minutos desde medianoche.
export function horaAMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Convierte minutos desde medianoche a "HH:MM".
export function minutosAHora(min) {
  const h = String(Math.floor(min / 60)).padStart(2, '0')
  const m = String(min % 60).padStart(2, '0')
  return `${h}:${m}`
}

// Etiqueta corta: "Mar 26 May" (para listados densos).
export function etiquetaFechaCorta(date) {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${dias[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]}`
}

// "Mar 26 May · 14:33" — fecha corta + hora local.
export function etiquetaFechaHora(date) {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${etiquetaFechaCorta(date)} · ${h}:${m}`
}

// "YYYY-MM" del momento actual (sirve para tracking de pagos mensuales).
export function mesActualKey() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${d.getFullYear()}-${m}`
}

// Etiqueta larga para títulos del panel: "Martes 26 de mayo".
export function etiquetaFechaLarga(date) {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  return `${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`
}

// Etiqueta amigable para mostrar al cliente en el selector de día.
// Ej: "Lun 26 May", "Hoy", "Mañana".
export function etiquetaDia(date) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const cero = new Date(date)
  cero.setHours(0, 0, 0, 0)
  const diff = Math.round((cero - hoy) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${nombresDias[date.getDay()]} ${date.getDate()} ${nombresMeses[date.getMonth()]}`
}
