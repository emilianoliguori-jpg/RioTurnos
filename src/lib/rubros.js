// Diccionarios de rubro.
//
// Cada negocio en Firestore tiene un campo `rubro` que matchea una key de este
// objeto. Las etiquetas y los textos del flujo de reserva se leen desde acá,
// para que la app sea agnóstica del tipo de negocio y se adapte sola.
//
// COMO AGREGAR UN RUBRO NUEVO:
// 1. Sumá una entrada al objeto RUBROS con la misma forma que las existentes.
// 2. Listo. No hace falta tocar componentes — los pasos del flujo leen el
//    rubro del negocio y muestran los textos correspondientes.
//
// Campos de cada rubro:
//   nombre               -> nombre del rubro (para UI interna y panel)
//   profesionalSingular  -> "profesional", "artista", "doctor"...
//   profesionalPlural    -> "profesionales", "artistas", "doctores"...
//   servicioSingular     -> "servicio", "consulta", "sesión", "trabajo"
//   servicioPlural       -> "servicios", "consultas", "sesiones", "trabajos"
//   preguntaPaso1        -> pregunta del Paso 1 del flujo (elegir servicio)
//   preguntaPaso2        -> pregunta del Paso 2 del flujo (elegir profesional)

export const RUBROS = {
  peluqueria: {
    nombre: 'Peluquería',
    profesionalSingular: 'profesional',
    profesionalPlural: 'profesionales',
    servicioSingular: 'servicio',
    servicioPlural: 'servicios',
    preguntaPaso1: '¿Qué te hacés hoy?',
    preguntaPaso2: '¿Con quién te atendés?',
  },

  estetica: {
    nombre: 'Estética',
    profesionalSingular: 'profesional',
    profesionalPlural: 'profesionales',
    servicioSingular: 'tratamiento',
    servicioPlural: 'tratamientos',
    preguntaPaso1: '¿Qué tratamiento querés?',
    preguntaPaso2: '¿Con quién te atendés?',
  },

  barberia: {
    nombre: 'Barbería',
    profesionalSingular: 'barbero',
    profesionalPlural: 'barberos',
    servicioSingular: 'servicio',
    servicioPlural: 'servicios',
    preguntaPaso1: '¿Qué te hacés?',
    preguntaPaso2: '¿Con qué barbero?',
  },

  consultorio: {
    nombre: 'Consultorio',
    profesionalSingular: 'profesional',
    profesionalPlural: 'profesionales',
    servicioSingular: 'consulta',
    servicioPlural: 'consultas',
    preguntaPaso1: '¿Qué consulta necesitás?',
    preguntaPaso2: '¿Con qué profesional?',
  },

  kinesiologia: {
    nombre: 'Kinesiología',
    profesionalSingular: 'kinesiólogo',
    profesionalPlural: 'kinesiólogos',
    servicioSingular: 'sesión',
    servicioPlural: 'sesiones',
    preguntaPaso1: '¿Qué sesión necesitás?',
    preguntaPaso2: '¿Con qué kinesiólogo?',
  },

  tattoo: {
    nombre: 'Tattoo',
    profesionalSingular: 'artista',
    profesionalPlural: 'artistas',
    servicioSingular: 'trabajo',
    servicioPlural: 'trabajos',
    preguntaPaso1: '¿Qué trabajo querés hacerte?',
    preguntaPaso2: '¿Con qué artista?',
  },
}

// Devuelve el diccionario del rubro indicado, o un fallback genérico si el
// rubro no está registrado (para que la app no se rompa si llega un valor raro).
export function getRubro(rubroKey) {
  return RUBROS[rubroKey] || RUBROS.peluqueria
}
