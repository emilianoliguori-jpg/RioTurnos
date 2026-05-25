// Servicio: solicitudes de alta de negocios.
//
// Colección "solicitudes". Cada doc =
//   {
//     // Negocio pedido
//     nombreNegocio, slug, rubro,
//     // Dueño
//     nombreDueno, email, whatsapp,
//     // Plan + cobro
//     planKey, monto,
//     // Comprobante en Storage
//     urlComprobante, pathComprobante,
//     // Workflow
//     estado: 'pendiente' | 'aprobada' | 'rechazada',
//     fechaCreacion: timestamp,
//     fechaResolucion?: timestamp,
//     motivoRechazo?: string,
//     negocioCreadoId?: string, // slug del negocio creado al aprobar
//   }

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

const COL = 'solicitudes'

// Crea una solicitud en estado pendiente. Devuelve el id.
export async function crearSolicitud(datos) {
  const ref = await addDoc(collection(db, COL), {
    ...datos,
    estado: 'pendiente',
    fechaCreacion: serverTimestamp(),
  })
  return ref.id
}

// Lista solicitudes por estado, ordenadas por fechaCreacion desc.
// Si estado === null o undefined, devuelve TODAS.
export async function getSolicitudes(estado = null) {
  const ref = collection(db, COL)
  const q = estado ? query(ref, where('estado', '==', estado)) : ref
  const snap = await getDocs(q)
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  items.sort((a, b) => {
    const ka = a.fechaCreacion?.toMillis?.() || 0
    const kb = b.fechaCreacion?.toMillis?.() || 0
    return kb - ka
  })
  return items
}

// Atajo para la vista del admin.
export async function getSolicitudesPendientes() {
  return getSolicitudes('pendiente')
}

// Aplicado al aprobar/rechazar desde el admin (Bloque 3).
export async function actualizarSolicitud(id, parciales) {
  await updateDoc(doc(db, COL, id), {
    ...parciales,
    fechaResolucion: serverTimestamp(),
  })
}
