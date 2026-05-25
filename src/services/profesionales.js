// Servicio: lectura/escritura de la subcolección "profesionales" de un negocio.
// "Profesional" es el recurso que presta el servicio. El nombre con el que
// se muestra al cliente sale del rubro (artista, barbero, kinesiólogo, etc.).

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
  return collection(db, 'negocios', negocioId, 'profesionales')
}

export async function getProfesionales(negocioId, { soloActivos = true } = {}) {
  const ref = colRef(negocioId)
  const q = soloActivos ? query(ref, where('activo', '==', true)) : ref
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function crearProfesional(negocioId, datos) {
  const docRef = await addDoc(colRef(negocioId), datos)
  return docRef.id
}

export async function upsertProfesional(negocioId, profesionalId, datos) {
  await setDoc(doc(colRef(negocioId), profesionalId), datos)
}

export async function eliminarProfesional(negocioId, profesionalId) {
  await deleteDoc(doc(colRef(negocioId), profesionalId))
}
