// Servicio: facturas de compra / gastos (empresas/{uid}/compras).
// Son comprobantes RECIBIDOS de proveedores. No se les pide CAE (los emite
// el proveedor): aca se registran para la cuenta corriente y el Libro IVA
// Compras. El usuario carga neto, IVA y total tal como figuran en la factura.

import {
  addDoc,
  getDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { colCompras } from './paths'
import { redondear } from '../lib/formato'

// borrador = {
//   fecha, tipoLabel ("Factura A"), letra, numeroComprobante ("0001-00000123"),
//   proveedor: { id, razonSocial, cuit },
//   neto, iva, otrosTributos, total, descripcion, condicionVenta
// }
export async function registrarCompra(uid, borrador) {
  const neto = redondear(borrador.neto)
  const iva = redondear(borrador.iva)
  const otros = redondear(borrador.otrosTributos || 0)
  const total = borrador.total != null ? redondear(borrador.total) : redondear(neto + iva + otros)

  const ref = await addDoc(colCompras(uid), {
    fecha: borrador.fecha,
    tipoLabel: borrador.tipoLabel || 'Factura',
    letra: borrador.letra || '',
    numeroComprobante: borrador.numeroComprobante || '',
    proveedor: borrador.proveedor || null,
    proveedorId: borrador.proveedor?.id || null,
    neto,
    iva,
    otrosTributos: otros,
    total,
    descripcion: borrador.descripcion || '',
    condicionVenta: borrador.condicionVenta || 'cuenta_corriente',
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function listarCompras(uid) {
  const q = query(colCompras(uid), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getCompra(uid, id) {
  const snap = await getDoc(doc(colCompras(uid), id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function comprasDeProveedor(uid, proveedorId) {
  const q = query(colCompras(uid), where('proveedorId', '==', proveedorId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function eliminarCompra(uid, id) {
  await deleteDoc(doc(colCompras(uid), id))
}
