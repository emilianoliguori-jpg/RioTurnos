// Formateadores compartidos (es-AR).

const fmtMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatearMoneda(n) {
  return fmtMoneda.format(Number(n) || 0)
}

// Redondeo a 2 decimales evitando errores de punto flotante.
export function redondear(n, dec = 2) {
  const f = 10 ** dec
  return Math.round((Number(n) || 0) * f) / f
}

// Fecha "YYYY-MM-DD" (local) -> "DD/MM/YYYY".
export function formatearFecha(iso) {
  if (!iso) return '—'
  const [y, m, d] = String(iso).slice(0, 10).split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

// Date -> "YYYY-MM-DD" (local, sin desfase de zona horaria).
export function aISO(fecha = new Date()) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function hoyISO() {
  return aISO(new Date())
}

// CUIT "20123456789" -> "20-12345678-9".
export function formatearCuit(cuit) {
  const s = String(cuit || '').replace(/\D/g, '')
  if (s.length !== 11) return cuit || '—'
  return `${s.slice(0, 2)}-${s.slice(2, 10)}-${s.slice(10)}`
}

// Numero de comprobante AFIP: pto venta 4 digitos + numero 8 digitos.
// "0001-00000123".
export function formatearNumeroComprobante(puntoVenta, numero) {
  const pv = String(puntoVenta || 0).padStart(4, '0')
  const nro = String(numero || 0).padStart(8, '0')
  return `${pv}-${nro}`
}

// Validacion de digito verificador de CUIT/CUIL.
export function cuitValido(cuit) {
  const s = String(cuit || '').replace(/\D/g, '')
  if (s.length !== 11) return false
  const mult = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const suma = mult.reduce((acc, m, i) => acc + m * Number(s[i]), 0)
  let dv = 11 - (suma % 11)
  if (dv === 11) dv = 0
  if (dv === 10) dv = 9
  return dv === Number(s[10])
}
