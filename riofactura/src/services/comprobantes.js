// Servicio: comprobantes de venta (empresas/{uid}/comprobantes).
//
// Emitir un comprobante hace, en orden:
//   1. Reserva un numero correlativo por (puntoVenta, tipoComprobante) de
//      forma atomica (transaccion sobre un doc contador). AFIP exige
//      numeracion sin huecos por punto de venta y tipo.
//   2. Solicita el CAE al adaptador (services/cae.js).
//   3. Guarda el comprobante completo (cabecera + items + totales + CAE).

import {
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { colComprobantes, colContadores } from './paths'
import { calcularComprobante } from '../lib/calculoIva'
import { tipoComprobante } from '../lib/afip'
import { solicitarCAE } from './cae'
import { hoyISO } from '../lib/formato'

// Reserva atomica del proximo numero para (pto venta, tipo).
async function proximoNumero(uid, puntoVenta, tipoId) {
  const ref = doc(colContadores(uid), `${puntoVenta}-${tipoId}`)
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const ultimo = snap.exists() ? snap.data().ultimo || 0 : 0
    const nuevo = ultimo + 1
    tx.set(ref, { puntoVenta, tipoId, ultimo: nuevo }, { merge: true })
    return nuevo
  })
}

// borrador = {
//   tipoId, puntoVenta, fecha,
//   cliente: { id, razonSocial, cuit, tipoDoc, nroDoc, condicionIva, domicilio },
//   items: [{ descripcion, cantidad, precioUnitario, alicuotaIva }],
//   condicionVenta, observaciones, comprobanteAsociado (para NC/ND)
// }
export async function emitirComprobante(uid, borrador) {
  const tipo = tipoComprobante(borrador.tipoId)
  if (!tipo) throw new Error('Tipo de comprobante invalido.')

  const calc = calcularComprobante(borrador.items, borrador.tipoId)
  if (calc.total <= 0) throw new Error('El total debe ser mayor a cero.')

  const numero = await proximoNumero(uid, borrador.puntoVenta, borrador.tipoId)

  const cabecera = {
    tipoId: borrador.tipoId,
    tipoLabel: tipo.label,
    letra: tipo.letra,
    clase: tipo.clase,
    puntoVenta: borrador.puntoVenta,
    numero,
    fecha: borrador.fecha || hoyISO(),
    cliente: borrador.cliente || null,
    clienteId: borrador.cliente?.id || null,
    items: calc.lineas,
    netoGravado: calc.netoGravado,
    totalIva: calc.totalIva,
    ivaPorAlicuota: calc.ivaPorAlicuota,
    total: calc.total,
    condicionVenta: borrador.condicionVenta || 'contado',
    observaciones: borrador.observaciones || '',
    comprobanteAsociado: borrador.comprobanteAsociado || null,
    estado: 'autorizado',
  }

  const cae = await solicitarCAE({ comprobante: cabecera })

  const ref = await addDoc(colComprobantes(uid), {
    ...cabecera,
    cae,
    creadoEn: serverTimestamp(),
  })
  return { id: ref.id, ...cabecera, cae }
}

export async function listarComprobantes(uid) {
  const q = query(colComprobantes(uid), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getComprobante(uid, id) {
  const snap = await getDoc(doc(colComprobantes(uid), id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function comprobantesDeCliente(uid, clienteId) {
  const q = query(colComprobantes(uid), where('clienteId', '==', clienteId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
