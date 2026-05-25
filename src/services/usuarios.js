// Servicio: vínculo usuario ↔ negocios.
//
// Colección "usuarios": un documento por usuario logueado.
//   id  = uid de Firebase Auth (el de Google)
//   email      : string  — para identificarlo visualmente en el admin
//   negociosIds: string[] — slugs de los negocios que administra
//
// Diseño multi-tenant: un usuario puede administrar N negocios (caso
// franquicias o cadenas), y un negocio puede tener N usuarios admin (en una
// próxima etapa lo invertimos también: colección `admins` en cada negocio).
// Por ahora arrancamos con el camino simple usuario→negocios.

import { doc, getDoc } from 'firebase/firestore'
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
