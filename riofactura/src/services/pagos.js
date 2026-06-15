// Servicio: cobros (de clientes) y pagos (a proveedores).
// Son los movimientos de dinero que cancelan saldos de cuenta corriente.
//   - cobros/{id}: entra plata por un cliente.
//   - pagos/{id} : sale plata hacia un proveedor.

import {
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { colCobros, colPagos } from './paths'
import { redondear } from '../lib/formato'

export const MEDIOS_PAGO = [
  'Efectivo',
  'Transferencia',
  'Cheque',
  'Tarjeta',
  'Mercado Pago',
  'Otro',
]

// ── COBROS (clientes) ───────────────────────────────────────────────
export async function registrarCobro(uid, { clienteId, cliente, fecha, monto, medio, observaciones }) {
  const ref = await addDoc(colCobros(uid), {
    clienteId: clienteId || null,
    cliente: cliente || null,
    fecha,
    monto: redondear(monto),
    medio: medio || 'Efectivo',
    observaciones: observaciones || '',
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function listarCobros(uid) {
  const q = query(colCobros(uid), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function cobrosDeCliente(uid, clienteId) {
  const q = query(colCobros(uid), where('clienteId', '==', clienteId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function eliminarCobro(uid, id) {
  await deleteDoc(doc(colCobros(uid), id))
}

// ── PAGOS (proveedores) ─────────────────────────────────────────────
export async function registrarPago(uid, { proveedorId, proveedor, fecha, monto, medio, observaciones }) {
  const ref = await addDoc(colPagos(uid), {
    proveedorId: proveedorId || null,
    proveedor: proveedor || null,
    fecha,
    monto: redondear(monto),
    medio: medio || 'Efectivo',
    observaciones: observaciones || '',
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function listarPagos(uid) {
  const q = query(colPagos(uid), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function pagosDeProveedor(uid, proveedorId) {
  const q = query(colPagos(uid), where('proveedorId', '==', proveedorId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function eliminarPago(uid, id) {
  await deleteDoc(doc(colPagos(uid), id))
}
