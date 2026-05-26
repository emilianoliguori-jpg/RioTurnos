// Servicio: lectura/escritura de la subcolección "profesionales" de un negocio.
// "Profesional" es el recurso que presta el servicio. El nombre con el que
// se muestra al cliente sale del rubro (artista, barbero, kinesiólogo, etc.).

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { alcanzoLimiteProfesionales, limitesDePlan } from '../lib/limitesPlan'

function colRef(negocioId) {
  return collection(db, 'negocios', negocioId, 'profesionales')
}

export async function getProfesionales(negocioId, { soloActivos = true } = {}) {
  const ref = colRef(negocioId)
  const q = soloActivos ? query(ref, where('activo', '==', true)) : ref
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Error tipado que tira `crearProfesional` cuando el plan no permite más.
// La UI puede destructurarlo y mostrar copy específico (no genérico).
export class LimitePlanError extends Error {
  constructor(message, { codigo, plan, cantidadActual, max } = {}) {
    super(message)
    this.name = 'LimitePlanError'
    this.codigo = codigo
    this.plan = plan
    this.cantidadActual = cantidadActual
    this.max = max
  }
}

// Crea un profesional. Si pasás `planKey`, valida el límite contra el TOTAL
// (activos + inactivos) antes de escribir Firestore.
//
// Cuenta total (no solo activos) para evitar el bypass por toggle: un dueño
// no debería poder "desactivar uno + crear nuevo + reactivar" para sumar más.
export async function crearProfesional(negocioId, datos, { planKey } = {}) {
  if (planKey) {
    const actuales = await getProfesionales(negocioId, { soloActivos: false })
    if (alcanzoLimiteProfesionales(planKey, actuales.length)) {
      const { maxProfesionales } = limitesDePlan(planKey)
      throw new LimitePlanError(
        `Tu plan permite hasta ${maxProfesionales} profesionales.`,
        {
          codigo: 'limite-profesionales',
          plan: planKey,
          cantidadActual: actuales.length,
          max: maxProfesionales,
        }
      )
    }
  }
  const docRef = await addDoc(colRef(negocioId), datos)
  return docRef.id
}

export async function upsertProfesional(negocioId, profesionalId, datos) {
  await setDoc(doc(colRef(negocioId), profesionalId), datos)
}

export async function eliminarProfesional(negocioId, profesionalId) {
  await deleteDoc(doc(colRef(negocioId), profesionalId))
}
