// Servicio: lectura/escritura de la subcolección "turnos" de un negocio.

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

function colRef(negocioId) {
  return collection(db, 'negocios', negocioId, 'turnos')
}

// Devuelve los turnos no cancelados de una fecha (YYYY-MM-DD).
// Si profesionalId está, filtra por ese profesional (más eficiente).
export async function getTurnosDelDia(negocioId, fecha, profesionalId = null) {
  const filtros = [where('fecha', '==', fecha)]
  if (profesionalId) filtros.push(where('profesionalId', '==', profesionalId))
  const q = query(colRef(negocioId), ...filtros)
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((t) => t.estado !== 'cancelado')
}

// Crea un turno y devuelve su id.
export async function crearTurno(negocioId, turno) {
  const docRef = await addDoc(colRef(negocioId), {
    ...turno,
    estado: 'confirmado',
    creadoEn: serverTimestamp(),
  })
  return docRef.id
}
