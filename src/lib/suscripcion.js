// Lógica pura del estado de suscripción mensual de un negocio.
// Sin queries a Firestore — recibe el negocio + el plan y deriva todo.
//
// Modelo:
//   - La suscripción vence el día 10 de cada mes.
//   - `negocio.ultimoPagoMes` ("YYYY-MM") es el último mes pagado (lo setea
//     el admin tras verificar la transferencia).
//
// Estados posibles:
//   'al-dia'    → pagó este mes.
//   'pendiente' → no pagó este mes, pero todavía no llegó el día 10.
//   'vencido'   → no pagó este mes y ya pasó el día 10.
//   'sin-pago'  → no aplica (plan fundador o sin plan/precio 0).

export const DIA_VENCIMIENTO = 10

const NOMBRES_MES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function mesActualKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function calcularEstadoSuscripcion(negocio, plan) {
  if (!plan || plan.precio === 0) return 'sin-pago'

  const pagoEsteMes = negocio.ultimoPagoMes === mesActualKey()
  if (pagoEsteMes) return 'al-dia'

  const hoy = new Date()
  if (hoy.getDate() > DIA_VENCIMIENTO) return 'vencido'
  return 'pendiente'
}

// Próxima fecha de vencimiento como Date:
//   - Si ya pagó este mes → día 10 del mes siguiente.
//   - Si no pagó         → día 10 de este mes (puede estar pasado si vencido).
export function proximoVencimientoDate(negocio) {
  const hoy = new Date()
  const pagoEsteMes = negocio.ultimoPagoMes === mesActualKey()
  const offset = pagoEsteMes ? 1 : 0
  return new Date(hoy.getFullYear(), hoy.getMonth() + offset, DIA_VENCIMIENTO)
}

// Etiqueta corta para la UI: "10 de junio".
export function etiquetaVencimiento(date) {
  return `${date.getDate()} de ${NOMBRES_MES[date.getMonth()]}`
}
