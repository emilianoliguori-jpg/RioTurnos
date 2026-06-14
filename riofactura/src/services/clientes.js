// Servicio: clientes (empresas/{uid}/clientes).

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
import { colClientes } from './paths'

export async function listarClientes(uid) {
  const q = query(colClientes(uid), orderBy('razonSocial'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getCliente(uid, id) {
  const snap = await getDoc(doc(colClientes(uid), id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function crearCliente(uid, datos) {
  const ref = await addDoc(colClientes(uid), {
    ...datos,
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function actualizarCliente(uid, id, datos) {
  await updateDoc(doc(colClientes(uid), id), datos)
}

export async function eliminarCliente(uid, id) {
  await deleteDoc(doc(colClientes(uid), id))
}
