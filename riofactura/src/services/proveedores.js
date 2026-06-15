// Servicio: proveedores (empresas/{uid}/proveedores).

import {
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { colProveedores } from './paths'

export async function listarProveedores(uid) {
  const q = query(colProveedores(uid), orderBy('razonSocial'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getProveedor(uid, id) {
  const snap = await getDoc(doc(colProveedores(uid), id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function crearProveedor(uid, datos) {
  const ref = await addDoc(colProveedores(uid), {
    ...datos,
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function actualizarProveedor(uid, id, datos) {
  await updateDoc(doc(colProveedores(uid), id), datos)
}

export async function eliminarProveedor(uid, id) {
  await deleteDoc(doc(colProveedores(uid), id))
}
