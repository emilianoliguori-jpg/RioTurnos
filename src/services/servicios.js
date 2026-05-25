// Servicio: lectura/escritura de la subcolección "servicios" de un negocio.

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
  return collection(db, 'negocios', negocioId, 'servicios')
}

// Lista los servicios activos de un negocio.
export async function getServicios(negocioId) {
  const q = query(colRef(negocioId), where('activo', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function upsertServicio(negocioId, servicioId, datos) {
  await setDoc(doc(colRef(negocioId), servicioId), datos)
}
