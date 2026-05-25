// Servicio: lectura/escritura de la subcolección "turnos" de un negocio.

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

function colRef(negocioId) {
  return collection(db, 'negocios', negocioId, 'turnos')
}

// Lista los turnos de una fecha (YYYY-MM-DD).
// Opciones:
//   profesionalId        — filtra por profesional (más eficiente).
//   incluirCancelados    — false por defecto (uso público: cancelados no ocupan
//                          slot); true para el panel (agenda muestra todo).
export async function getTurnosDelDia(
  negocioId,
  fecha,
  { profesionalId = null, incluirCancelados = false } = {}
) {
  const filtros = [where('fecha', '==', fecha)]
  if (profesionalId) filtros.push(where('profesionalId', '==', profesionalId))
  const q = query(colRef(negocioId), ...filtros)
  const snap = await getDocs(q)
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return incluirCancelados ? items : items.filter((t) => t.estado !== 'cancelado')
}

// Crea un turno y devuelve su id.
// Se usa tanto en el flujo público como en alta manual del panel.
export async function crearTurno(negocioId, turno) {
  const docRef = await addDoc(colRef(negocioId), {
    ...turno,
    estado: 'confirmado',
    creadoEn: serverTimestamp(),
  })
  return docRef.id
}

// Cambia el estado de un turno: 'confirmado' | 'atendido' | 'cancelado'.
export async function actualizarEstadoTurno(negocioId, turnoId, estado) {
  await updateDoc(doc(colRef(negocioId), turnoId), { estado })
}

// Actualización parcial general (usada por reagendado: cambia fecha y hora).
export async function actualizarTurno(negocioId, turnoId, parciales) {
  await updateDoc(doc(colRef(negocioId), turnoId), parciales)
}
