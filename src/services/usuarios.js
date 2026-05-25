// Servicio: vínculo usuario ↔ negocios.
//
// Colección "usuarios": un documento por usuario logueado.
//   id  = uid de Firebase Auth (el de Google)
//   email      : string  — para identificarlo visualmente en el admin
//   negociosIds: string[] — slugs de los negocios que administra
//
// Diseño multi-tenant: un usuario puede administrar N negocios (caso
// franquicias o cadenas).

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

const COL = 'usuarios'

// Devuelve { id, email, negociosIds } o null si no existe el doc.
export async function getUsuario(uid) {
  const snap = await getDoc(doc(db, COL, uid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

// Devuelve el array de slugs de negocios que administra este usuario.
// Si el usuario no existe en la colección o no tiene negocios, devuelve [].
export async function getNegociosDelUsuario(uid) {
  const u = await getUsuario(uid)
  return u?.negociosIds || []
}

// Crea o sobreescribe el doc de un usuario con id = uid.
// Idempotente: llamarlo varias veces deja el mismo estado final.
export async function upsertUsuario(uid, datos) {
  await setDoc(doc(db, COL, uid), datos)
}

// Vincula automáticamente al usuario con cualquier negocio que tenga
// `emailDuenoAutorizado === email`. Se llama en cada login.
//
// Idempotente: usa setDoc con arrayUnion, así si ya estaba vinculado no
// genera duplicados ni escrituras innecesarias.
//
// Devuelve { vinculados: number, slugs: string[] }.
export async function vincularPorEmail(uid, email) {
  if (!email) return { vinculados: 0, slugs: [] }

  const q = query(
    collection(db, 'negocios'),
    where('emailDuenoAutorizado', '==', email)
  )
  const snap = await getDocs(q)
  if (snap.empty) return { vinculados: 0, slugs: [] }

  // Por convención, id del doc del negocio = slug.
  const slugs = snap.docs.map((d) => d.id)

  await setDoc(
    doc(db, COL, uid),
    {
      email,
      negociosIds: arrayUnion(...slugs),
    },
    { merge: true }
  )

  return { vinculados: slugs.length, slugs }
}
