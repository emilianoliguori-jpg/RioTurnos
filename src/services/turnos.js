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
import { formatearFecha } from '../lib/fechas'

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
// `estado` se puede sobreescribir desde `turno` (ej: "pendiente_pago" si el
// flujo público activó cobro por transferencia).
export async function crearTurno(negocioId, turno) {
  const docRef = await addDoc(colRef(negocioId), {
    estado: 'confirmado', // default
    ...turno,             // puede sobreescribir
    creadoEn: serverTimestamp(),
  })
  return docRef.id
}

// Confirma el pago de un turno pendiente desde el panel.
// Cambia estado a "confirmado" y guarda la marca temporal.
export async function confirmarPagoTurno(negocioId, turnoId) {
  await updateDoc(doc(colRef(negocioId), turnoId), {
    estado: 'confirmado',
    fechaConfirmacionPago: serverTimestamp(),
  })
}

// Devuelve TODOS los turnos del mes actual (día 1 → hoy inclusive).
// Sin filtrar por estado: el caller (estadisticas.js) los agrupa después.
// Una sola query para alimentar todo el dashboard del dueño.
export async function getTurnosDelMes(negocioId) {
  const hoy = new Date()
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia1 = `${y}-${m}-01`
  const hoyStr = formatearFecha(hoy)

  const q = query(
    colRef(negocioId),
    where('fecha', '>=', dia1),
    where('fecha', '<=', hoyStr)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Lista todos los turnos en estado pendiente_pago del negocio.
// Útil para la vista cross-day del cruce diario del dueño.
// Filtra a partir de la fecha de hoy (no muestra pendientes vencidos).
export async function getTurnosPendientesDePago(negocioId) {
  const q = query(
    colRef(negocioId),
    where('estado', '==', 'pendiente_pago')
  )
  const snap = await getDocs(q)
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  // Ordenamos cronológicamente.
  items.sort((a, b) => {
    const k = (a.fecha || '').localeCompare(b.fecha || '')
    if (k !== 0) return k
    return (a.hora || '').localeCompare(b.hora || '')
  })
  return items
}

// Cambia el estado de un turno: 'confirmado' | 'atendido' | 'cancelado'.
export async function actualizarEstadoTurno(negocioId, turnoId, estado) {
  await updateDoc(doc(colRef(negocioId), turnoId), { estado })
}

// Actualización parcial general (usada por reagendado: cambia fecha y hora).
export async function actualizarTurno(negocioId, turnoId, parciales) {
  await updateDoc(doc(colRef(negocioId), turnoId), parciales)
}
