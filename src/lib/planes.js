// Planes de suscripción mensual de Río Turnos.
//
// FUENTE ÚNICA DE VERDAD para precios, límites y features. Si cambiás algo
// acá, los helpers de limitesPlan.js + la página /planes + las gates del
// panel se adaptan solos. NO duplicar valores en otros archivos.
//
// Convención:
//   maxProfesionales:  number | Infinity   (límite duro de la cantidad)
//   dashboardCompleto: boolean             (acceso a métricas avanzadas)
//
// El plan "Fundador" es interno: solo el admin lo asigna a los pilotos
// gratuitos. NO aparece en la página pública /planes.

export const PLANES = {
  fundador: {
    key: 'fundador',
    nombre: 'Fundador',
    precio: 0,
    publico: false,
    bajada: 'Plan interno para los pilotos. Gratis.',
    maxProfesionales:  Infinity,
    dashboardCompleto: true,
    features: [
      'Acceso completo, sin límites',
      'Soporte directo',
      'Sin costo durante el piloto',
    ],
  },

  inicial: {
    key: 'inicial',
    nombre: 'Inicial',
    precio: 18000,
    publico: true,
    bajada: 'Profesional individual o equipo chico.',
    maxProfesionales:  2,
    dashboardCompleto: false,
    features: [
      'Hasta 2 profesionales',
      'Servicios ilimitados',
      'Reservas online ilimitadas',
      'Cobro con seña por transferencia',
      'Dashboard básico (turnos del día + actividad)',
    ],
  },

  profesional: {
    key: 'profesional',
    nombre: 'Profesional',
    precio: 28000,
    publico: true,
    destacado: true,
    bajada: 'Para equipos de hasta 5 profesionales.',
    maxProfesionales:  5,
    dashboardCompleto: true,
    features: [
      'Hasta 5 profesionales',
      'Todo lo del plan Inicial',
      'Dashboard completo (ingresos + top servicios)',
      'Soporte prioritario',
    ],
  },

  negocio: {
    key: 'negocio',
    nombre: 'Negocio',
    precio: 45000,
    publico: true,
    bajada: 'Peluquería, clínica o estudio con equipo grande.',
    maxProfesionales:  Infinity,
    dashboardCompleto: true,
    features: [
      'Profesionales ilimitados',
      'Todo lo del plan Profesional',
      'Reportes y métricas avanzadas',
      'Soporte prioritario',
    ],
  },
}

export function getPlan(key) {
  return PLANES[key] || null
}

// Planes que se muestran en la página pública /planes (excluye fundador).
export function planesPublicos() {
  return Object.values(PLANES).filter((p) => p.publico)
}
