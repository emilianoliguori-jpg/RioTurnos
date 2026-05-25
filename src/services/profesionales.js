// Servicio: lectura/escritura de la subcolección "profesionales" de un negocio.
// "Profesional" es el recurso que presta el servicio (persona, en la mayoría
// de los rubros). El nombre que se le muestra al cliente sale del rubro.

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

function colRef(negocioId) {
  return collection(db, 'negocios', negocioId, 'profesionales')
}

export async function getProfesionales(negocioId) {
  const q = query(colRef(negocioId), where('activo', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function upsertProfesional(negocioId, profesionalId, datos) {
  await setDoc(doc(colRef(negocioId), profesionalId), datos)
}
