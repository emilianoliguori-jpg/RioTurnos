// Servicio: lectura/escritura de la subcolección "servicios" de un negocio.

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

function colRef(negocioId) {
  return collection(db, 'negocios', negocioId, 'servicios')
}

// Lista los servicios de un negocio.
// Por defecto sólo devuelve los activos (uso público); el panel del dueño
// llama con { soloActivos: false } para ver y administrar todos.
export async function getServicios(negocioId, { soloActivos = true } = {}) {
  const ref = colRef(negocioId)
  const q = soloActivos ? query(ref, where('activo', '==', true)) : ref
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Crea uno nuevo con id auto-generado. Devuelve el id.
export async function crearServicio(negocioId, datos) {
  const docRef = await addDoc(colRef(negocioId), datos)
  return docRef.id
}

// Usado por el seed (id explícito) y como update completo desde el panel.
export async function upsertServicio(negocioId, servicioId, datos) {
  await setDoc(doc(colRef(negocioId), servicioId), datos)
}

export async function eliminarServicio(negocioId, servicioId) {
  await deleteDoc(doc(colRef(negocioId), servicioId))
}
