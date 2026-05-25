// Servicio: lectura/escritura de negocios.
// Un negocio es un tenant. Lo identificamos por slug (URL-friendly) al cliente,
// y por id de documento internamente. Por convención, id = slug.

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

const COL = 'negocios'

// Devuelve { id, ...datos } del negocio con ese slug, o null si no existe.
export async function getNegocioPorSlug(slug) {
  const q = query(collection(db, COL), where('slug', '==', slug))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const docSnap = snap.docs[0]
  return { id: docSnap.id, ...docSnap.data() }
}

// Lista todos los negocios. Solo usado por el admin.
// Ordena por creadoEn descendente (más recientes primero).
export async function getTodosLosNegocios() {
  const snap = await getDocs(collection(db, COL))
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  items.sort((a, b) => {
    const ka = a.creadoEn?.toMillis?.() || 0
    const kb = b.creadoEn?.toMillis?.() || 0
    return kb - ka
  })
  return items
}

// True si ya existe un doc con ese slug (= id).
export async function slugExiste(slug) {
  const snap = await getDoc(doc(db, COL, slug))
  return snap.exists()
}

// Crea o sobreescribe un negocio con id explícito.
// Usado por el seed; el panel del dueño usa actualizarNegocio (merge parcial).
export async function upsertNegocio(id, datos) {
  await setDoc(doc(db, COL, id), {
    ...datos,
    creadoEn: serverTimestamp(),
  })
}

// Crea un negocio NUEVO. Tira error si el slug ya está ocupado.
// Lo usa el admin (alta manual) y el flujo de aprobación de solicitudes.
export async function crearNegocio(slug, datos) {
  const ref = doc(db, COL, slug)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    throw new Error(`El slug "${slug}" ya existe.`)
  }
  await setDoc(ref, {
    ...datos,
    slug,
    creadoEn: serverTimestamp(),
  })
  return slug
}

// Actualización parcial. Sólo toca los campos pasados, deja el resto intacto.
// Usado por el panel del dueño para no pisar horariosAtencion u otros campos
// que no edita la sección actual.
export async function actualizarNegocio(id, datosParciales) {
  await updateDoc(doc(db, COL, id), datosParciales)
}

// Marca que el negocio pagó la mensualidad del mes actual.
// Idempotente: si lo llamás dos veces el mismo mes, no cambia nada.
export async function marcarPagoMesActual(id) {
  const d = new Date()
  const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  await updateDoc(doc(db, COL, id), { ultimoPagoMes: mes })
}

// Quita la marca de pago (por si el admin se equivocó).
export async function desmarcarPagoMes(id) {
  await updateDoc(doc(db, COL, id), { ultimoPagoMes: '' })
}
