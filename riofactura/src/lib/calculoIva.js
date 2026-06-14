// Motor de calculo de totales e IVA de un comprobante.
//
// Convencion: el precio unitario que ingresa el usuario es NETO (sin IVA).
// El IVA se calcula por alicuota. Esto es correcto para el Libro IVA y
// para la liquidacion ante AFIP, sin importar si el comprobante es A, B o C.
//
//   - Factura A: el IVA se discrimina en el PDF (neto + IVA = total).
//   - Factura B: el IVA va "incluido" (no se discrimina), pero igual se
//     calcula y registra para el Libro IVA Ventas.
//   - Factura C (Monotributo/Exento): sin IVA. La alicuota se fuerza a 0.

import { tasaIva, tipoComprobante } from './afip'
import { redondear } from './formato'

// item = { descripcion, cantidad, precioUnitario, alicuotaIva (codigo AFIP) }
// Para comprobantes C el IVA siempre es 0 sin importar la alicuota cargada.
export function calcularComprobante(items, tipoId) {
  const esC = tipoComprobante(tipoId)?.letra === 'C'

  const lineas = (items || []).map((it) => {
    const cantidad = Number(it.cantidad) || 0
    const precio = Number(it.precioUnitario) || 0
    const neto = redondear(cantidad * precio)
    const tasa = esC ? 0 : tasaIva(it.alicuotaIva)
    const iva = redondear(neto * tasa)
    return {
      ...it,
      cantidad,
      precioUnitario: precio,
      alicuotaIva: esC ? 3 : it.alicuotaIva,
      neto,
      iva,
      subtotal: redondear(neto + iva),
    }
  })

  const netoGravado = redondear(
    lineas.reduce((acc, l) => acc + l.neto, 0)
  )
  const totalIva = redondear(lineas.reduce((acc, l) => acc + l.iva, 0))
  const total = redondear(netoGravado + totalIva)

  // Desglose de IVA por alicuota (lo exige el detalle de AFIP / Libro IVA).
  const porAlicuota = {}
  for (const l of lineas) {
    if (l.iva <= 0) continue
    const k = l.alicuotaIva
    if (!porAlicuota[k]) porAlicuota[k] = { alicuotaIva: k, baseImponible: 0, importe: 0 }
    porAlicuota[k].baseImponible = redondear(porAlicuota[k].baseImponible + l.neto)
    porAlicuota[k].importe = redondear(porAlicuota[k].importe + l.iva)
  }

  return {
    lineas,
    netoGravado,
    totalIva,
    total,
    ivaPorAlicuota: Object.values(porAlicuota),
  }
}
