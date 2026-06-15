// Construccion de la cuenta corriente (movimientos con saldo acumulado).
//
// Cliente: las facturas/ND aumentan la deuda (debe), las NC y los cobros
// la disminuyen (haber). Saldo > 0 = el cliente nos debe.
//
// Proveedor: las compras aumentan lo que debemos (haber del proveedor),
// los pagos lo disminuyen. Saldo > 0 = le debemos al proveedor.

import { signoCtaCte } from './afip'
import { formatearNumeroComprobante, redondear } from './formato'

function ordenarYAcumular(movs) {
  movs.sort((a, b) => {
    const f = (a.fecha || '').localeCompare(b.fecha || '')
    if (f !== 0) return f
    return (a._orden || 0) - (b._orden || 0)
  })
  let saldo = 0
  return movs.map((m) => {
    saldo = redondear(saldo + m.debe - m.haber)
    return { ...m, saldo }
  })
}

// comprobantes de venta + cobros -> movimientos del cliente.
export function ctaCteCliente(comprobantes, cobros) {
  const movs = []

  for (const c of comprobantes) {
    const signo = signoCtaCte(c.tipoId) // +1 factura/ND, -1 NC
    const importe = redondear(c.total)
    movs.push({
      tipo: 'comprobante',
      fecha: c.fecha,
      detalle: `${c.tipoLabel} ${formatearNumeroComprobante(c.puntoVenta, c.numero)}`,
      debe: signo > 0 ? importe : 0,
      haber: signo < 0 ? importe : 0,
      ref: c.id,
      _orden: 0,
    })
  }

  for (const p of cobros) {
    movs.push({
      tipo: 'cobro',
      fecha: p.fecha,
      detalle: `Cobro (${p.medio})`,
      debe: 0,
      haber: redondear(p.monto),
      ref: p.id,
      _orden: 1,
    })
  }

  return ordenarYAcumular(movs)
}

// compras + pagos -> movimientos del proveedor.
export function ctaCteProveedor(compras, pagos) {
  const movs = []

  for (const c of compras) {
    movs.push({
      tipo: 'compra',
      fecha: c.fecha,
      detalle: `${c.tipoLabel} ${c.numeroComprobante || ''}`.trim(),
      debe: redondear(c.total),
      haber: 0,
      ref: c.id,
      _orden: 0,
    })
  }

  for (const p of pagos) {
    movs.push({
      tipo: 'pago',
      fecha: p.fecha,
      detalle: `Pago (${p.medio})`,
      debe: 0,
      haber: redondear(p.monto),
      ref: p.id,
      _orden: 1,
    })
  }

  return ordenarYAcumular(movs)
}

export function saldoFinal(movimientos) {
  return movimientos.length ? movimientos[movimientos.length - 1].saldo : 0
}
