// Estadísticas del dashboard del dueño. Lógica PURA — no toca Firestore.
// Recibe el array de turnos del mes (de getTurnosDelMes) y devuelve todo lo
// que la pantalla SeccionResumen necesita.
//
// Definiciones:
//   - Próximos hoy: turnos con fecha === hoy, hora >= ahora, estado 'confirmado'.
//   - Ingresos cobrados:    suma de montoCobrado en estado 'confirmado' | 'atendido'.
//   - Ingresos por confirmar: suma de montoCobrado en estado 'pendiente_pago'.
//   - Top servicios: cantidad de turnos por servicioId, EXCLUYENDO cancelados.

import { formatearFecha } from '../lib/fechas'

export function calcularEstadisticasMes(turnos) {
  const hoyStr = formatearFecha(new Date())
  const ahoraMin = (() => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  })()

  let total = 0
  let atendidos = 0
  let confirmados = 0
  let cancelados = 0
  let pendientesPago = 0

  let ingresoCobrado = 0
  let ingresoPorConfirmar = 0

  const conteoServicios = {} // { [servicioId]: { id, nombre, cantidad } }
  const proximosHoy = []

  for (const t of turnos) {
    total++
    if (t.estado === 'atendido') atendidos++
    else if (t.estado === 'confirmado') confirmados++
    else if (t.estado === 'cancelado') cancelados++
    else if (t.estado === 'pendiente_pago') pendientesPago++

    // Ingresos — sólo si hay monto cobrado (el campo se congela al crear).
    if (typeof t.montoCobrado === 'number') {
      if (t.estado === 'confirmado' || t.estado === 'atendido') {
        ingresoCobrado += t.montoCobrado
      } else if (t.estado === 'pendiente_pago') {
        ingresoPorConfirmar += t.montoCobrado
      }
      // Cancelados no suman (la plata no entró o se devolvió).
    }

    // Top servicios — excluye cancelados (no fue una reserva efectiva).
    if (t.estado !== 'cancelado' && t.servicioId) {
      const id = t.servicioId
      if (!conteoServicios[id]) {
        conteoServicios[id] = { id, nombre: t.servicioNombre || '—', cantidad: 0 }
      }
      conteoServicios[id].cantidad++
      // Si vienen varios turnos del mismo servicio con nombre actualizado,
      // nos quedamos con el último — robusto a renombres a mitad de mes.
      if (t.servicioNombre) conteoServicios[id].nombre = t.servicioNombre
    }

    // Próximos turnos de hoy — sólo confirmados, hora >= ahora.
    if (t.fecha === hoyStr && t.estado === 'confirmado' && t.hora) {
      const [h, m] = t.hora.split(':').map(Number)
      if (h * 60 + m >= ahoraMin) {
        proximosHoy.push(t)
      }
    }
  }

  proximosHoy.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))

  const topServicios = Object.values(conteoServicios)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  return {
    total,
    atendidos,
    confirmados,
    cancelados,
    pendientesPago,
    ingresoCobrado,
    ingresoPorConfirmar,
    topServicios,
    proximosHoy,
  }
}
