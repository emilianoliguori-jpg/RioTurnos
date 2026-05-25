// Subcolección "slots" — espejo PÚBLICO de los turnos.
//
// Para qué existe: el flujo público de reserva necesita saber qué horarios
// están ocupados para calcular disponibilidad. Pero los turnos completos
// contienen datos personales del cliente (nombre, whatsapp, email) y datos
// financieros (monto cobrado, comprobante). Si dejáramos turnos público,
// cualquiera podría leer toda esa información.
//
// Solución: una subcolección paralela `slots` que SOLO tiene los campos
// estrictamente necesarios para el cálculo de disponibilidad. Es de lectura
// pública. Los turnos completos siguen privados (sólo dueño/admin).
//
// REGLA DE ORO: la fuente de verdad de qué va al slot es `turnoASlot()`.
// Si agregás un campo nuevo al turno que afecta disponibilidad
// (duración, profesional, fecha/hora, estado), agregalo a CAMPOS_SLOT.
// Si no afecta disponibilidad, NUNCA lo agregues acá (queda en turnos).

import {
  collection,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

// Único lugar donde se declara qué campos viven en el slot.
// `turnoASlot` y `extraerCamposSlot` se derivan de esta lista.
const CAMPOS_SLOT = [
  'fecha',
  'hora',
  'duracionMinutos',
  'profesionalId',
  'servicioId',
  'estado',
]

export function colRefSlots(negocioId) {
  return collection(db, 'negocios', negocioId, 'slots')
}

export function docRefSlot(negocioId, slotId) {
  return doc(db, 'negocios', negocioId, 'slots', slotId)
}

// Función pura. Toma un turno (parcial o completo) y devuelve sólo los
// campos del slot. profesionalId default null para que la query funcione.
export function turnoASlot(turno) {
  const slot = extraerCamposSlot(turno)
  if (slot.profesionalId === undefined) slot.profesionalId = null
  return slot
}

// Versión pensada para "parciales" en updates: devuelve un objeto con sólo
// las keys que afectan al slot, omitiendo las que no estaban en `obj`.
// Útil para batch.update donde no queremos pisar campos no especificados.
export function extraerCamposSlot(obj) {
  const out = {}
  for (const k of CAMPOS_SLOT) {
    if (k in obj) out[k] = obj[k]
  }
  return out
}

// Devuelve los slots NO CANCELADOS de una fecha. Sirve para el cálculo de
// disponibilidad del flujo público y del panel.
// Lectura pública según las reglas de Firestore.
export async function getSlotsOcupadosDelDia(
  negocioId,
  fecha,
  { profesionalId = null } = {}
) {
  const filtros = [where('fecha', '==', fecha)]
  if (profesionalId) filtros.push(where('profesionalId', '==', profesionalId))
  const q = query(colRefSlots(negocioId), ...filtros)
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((s) => s.estado !== 'cancelado')
}
