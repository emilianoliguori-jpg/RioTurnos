// Planes de suscripción mensual de Río Turnos.
// Si tocás precios o agregás planes, hacelo acá; la página /planes y el
// admin se adaptan solos.
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
    features: [
      'Acceso completo',
      'Soporte directo',
      'Sin costo durante el piloto',
    ],
  },
  inicial: {
    key: 'inicial',
    nombre: 'Inicial',
    precio: 18000,
    publico: true,
    bajada: 'Profesional individual, 1 calendario.',
    features: [
      '1 profesional / calendario',
      'Reservas online ilimitadas',
      'Cobro por transferencia',
      'Panel del dueño',
    ],
  },
  profesional: {
    key: 'profesional',
    nombre: 'Profesional',
    precio: 28000,
    publico: true,
    destacado: true,
    bajada: 'Para equipos de 2 a 3 profesionales.',
    features: [
      'Hasta 3 profesionales',
      'Agenda compartida',
      'Reservas online ilimitadas',
      'Cobro por transferencia',
      'Soporte prioritario',
    ],
  },
  negocio: {
    key: 'negocio',
    nombre: 'Negocio',
    precio: 45000,
    publico: true,
    bajada: 'Peluquería, clínica o estudio con 4+ profesionales.',
    features: [
      'Profesionales ilimitados',
      'Múltiples agendas',
      'Reportes',
      'Cobro por transferencia',
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
