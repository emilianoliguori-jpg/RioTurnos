// Helpers puros que derivan los límites de cada plan a partir de planes.js.
// NUNCA hardcodear números acá — sólo lectura.
//
// Convención de "cantidadActual" para profesionales: cuenta TOTAL del catálogo
// (activos + inactivos). Si contáramos solo activos, un dueño podría toggle
// inactivo → agregar → reactivar para saltearse el límite. Total es la regla
// más clara y menos exploitable.

import { PLANES, getPlan } from './planes'

// Devuelve los límites/features de un plan.
// Si el plan no existe, degrada al más restrictivo (todo bloqueado).
export function limitesDePlan(planKey) {
  const plan = getPlan(planKey)
  if (!plan) {
    return {
      maxProfesionales:  0,
      dashboardCompleto: false,
    }
  }
  return {
    maxProfesionales:  plan.maxProfesionales ?? Infinity,
    dashboardCompleto: !!plan.dashboardCompleto,
  }
}

// True si la cantidad actual ya está EN o POR ENCIMA del límite.
// Cubre tanto "alcanzado" (===) como "excedido" (>) — en ambos casos no se
// puede agregar más.
export function alcanzoLimiteProfesionales(planKey, cantidadActual) {
  const { maxProfesionales } = limitesDePlan(planKey)
  return cantidadActual >= maxProfesionales
}

// True sólo si la cantidad actual está POR ENCIMA del máximo (caso legacy:
// el negocio cargó N profesionales cuando estaba en otro plan y ahora bajó
// al actual). Se usa para mostrar copy distinto al límite normal.
export function excedeLimiteProfesionales(planKey, cantidadActual) {
  const { maxProfesionales } = limitesDePlan(planKey)
  return cantidadActual > maxProfesionales
}

// Devuelve el OBJETO del plan siguiente en el path de upgrade.
// inicial → profesional → negocio → (null)
// fundador → (null)  (es interno, no aplica)
// negocio  → (null)  (ya es el tope)
export function planSiguiente(planKey) {
  const PATH = ['inicial', 'profesional', 'negocio']
  const idx = PATH.indexOf(planKey)
  if (idx === -1 || idx === PATH.length - 1) return null
  return PLANES[PATH[idx + 1]]
}
