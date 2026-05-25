// Servicio: lectura/escritura de la subcolección "turnos" de un negocio.
//
// ⚠️ IMPORTANTE: cada mutación (crear/actualizar/cancelar/atendido/etc.)
// también escribe en la subcolección espejo `slots` dentro de un writeBatch
// atómico. La razón está documentada en services/slots.js.
//
// Si agregás una nueva mutación, NO la hagas con updateDoc/addDoc directo.
// Usá writeBatch + replicá los campos relevantes al slot (vía
// `extraerCamposSlot` o `turnoASlot` de services/slots.js).

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { formatearFecha } from '../lib/fechas'
import {
  docRefSlot,
  turnoASlot,
  extraerCamposSlot,
} from './slots'

function colRef(negocioId) {
  return collection(db, 'negocios', negocioId, 'turnos')
}

// Lista los turnos de una fecha (YYYY-MM-DD). Lee de `turnos`, no de `slots`,
// porque devuelve campos privados (datosCliente, montoCobrado, etc.).
// Sólo el dueño/admin puede invocarla — para el flujo público usá
// `getSlotsOcupadosDelDia` de services/slots.js.
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
// Escribe ATÓMICAMENTE en turnos + slots.
export async function crearTurno(negocioId, turno) {
  // Pre-generamos el id sin escribir, para usar el MISMO id en ambos docs.
  const turnoRef = doc(colRef(negocioId))
  const slotRef = docRefSlot(negocioId, turnoRef.id)

  const dataTurno = {
    estado: 'confirmado', // default
    ...turno,             // puede sobreescribir (ej: "pendiente_pago")
    creadoEn: serverTimestamp(),
  }

  const batch = writeBatch(db)
  batch.set(turnoRef, dataTurno)
  batch.set(slotRef, turnoASlot(dataTurno))
  await batch.commit()

  return turnoRef.id
}

// Confirma el pago de un turno pendiente desde el panel.
// Cambia estado a "confirmado" en ambos lados.
export async function confirmarPagoTurno(negocioId, turnoId) {
  const batch = writeBatch(db)
  batch.update(doc(colRef(negocioId), turnoId), {
    estado: 'confirmado',
    fechaConfirmacionPago: serverTimestamp(),
  })
  batch.update(docRefSlot(negocioId, turnoId), { estado: 'confirmado' })
  await batch.commit()
}

// Devuelve TODOS los turnos del mes actual (día 1 → hoy inclusive).
// Uso interno del panel (Resumen). No es público.
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
export async function getTurnosPendientesDePago(negocioId) {
  const q = query(
    colRef(negocioId),
    where('estado', '==', 'pendiente_pago')
  )
  const snap = await getDocs(q)
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  items.sort((a, b) => {
    const k = (a.fecha || '').localeCompare(b.fecha || '')
    if (k !== 0) return k
    return (a.hora || '').localeCompare(b.hora || '')
  })
  return items
}

// Cambia el estado de un turno: 'confirmado' | 'atendido' | 'cancelado'.
// Replica al slot en el mismo batch.
export async function actualizarEstadoTurno(negocioId, turnoId, estado) {
  const batch = writeBatch(db)
  batch.update(doc(colRef(negocioId), turnoId), { estado })
  batch.update(docRefSlot(negocioId, turnoId), { estado })
  await batch.commit()
}

// Actualización parcial general (usada por reagendado: cambia fecha y hora).
// Replica al slot SÓLO los campos que afectan disponibilidad
// (usando `extraerCamposSlot` para evitar pisar campos del slot que no
// estaban en `parciales`).
export async function actualizarTurno(negocioId, turnoId, parciales) {
  const batch = writeBatch(db)
  batch.update(doc(colRef(negocioId), turnoId), parciales)
  const cambiosSlot = extraerCamposSlot(parciales)
  if (Object.keys(cambiosSlot).length > 0) {
    batch.update(docRefSlot(negocioId, turnoId), cambiosSlot)
  }
  await batch.commit()
}

