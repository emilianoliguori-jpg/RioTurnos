// Servicio: lectura/escritura de negocios.
// Un negocio es un tenant. Lo identificamos por slug (URL-friendly) al cliente,
// y por id de documento internamente.

import {
  collection,
  query,
  where,
  getDocs,
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

// Crea o sobreescribe un negocio con id explícito.
// Usado por el seed; el panel del dueño usará otra función con merge parcial.
export async function upsertNegocio(id, datos) {
  await setDoc(doc(db, COL, id), {
    ...datos,
    creadoEn: serverTimestamp(),
  })
}

// Actualización parcial. Sólo toca los campos pasados, deja el resto intacto.
// Usado por el panel del dueño para no pisar horariosAtencion u otros campos
// que no edita la sección actual.
export async function actualizarNegocio(id, datosParciales) {
  await updateDoc(doc(db, COL, id), datosParciales)
}
