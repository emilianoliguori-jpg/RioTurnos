// Espejo MÍNIMO de src/lib/planes.js — sólo nombres legibles para emails.
//
// IMPORTANTE: si agregás un plan en src/lib/planes.js (lo necesita la página
// /planes), sumalo acá también para que los emails muestren el nombre
// correcto. Si no, el email muestra el `planKey` crudo (ej: "profesional").

const NOMBRES = {
  fundador:    'Fundador',
  inicial:     'Inicial',
  profesional: 'Profesional',
  negocio:     'Negocio',
}

export function nombrePlan(key) {
  return NOMBRES[key] || key
}
