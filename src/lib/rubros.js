// Diccionarios de rubro.
//
// Cada negocio en Firestore tiene un campo `rubro` que matchea una key de este
// objeto. Las etiquetas y los textos del flujo de reserva se leen desde acá,
// para que la app sea agnóstica del tipo de negocio y se adapte sola.
//
// COMO AGREGAR UN RUBRO NUEVO:
// 1. Sumá una entrada al objeto RUBROS con la misma forma que las existentes.
// 2. Listo. No hace falta tocar componentes — los pasos del flujo leen el
//    rubro del negocio y muestran los textos correspondientes. Los tres
//    dropdowns (panel del dueño, alta de admin, formulario de solicitud)
//    listan automáticamente todas las entradas vía Object.entries(RUBROS).
//
// REGLA DE IDS:
// - Los ids (keys del objeto) se persisten en Firestore. NUNCA cambiar el id
//   de un rubro existente: rompería los negocios ya creados con ese rubro.
// - Para rubros con más de una palabra usamos snake-case sin acentos
//   (ej: 'taller' en vez de 'taller-mecanico'; 'juridico' en vez de
//   'estudio-juridico'). Convención liviana porque cada negocio queda
//   atado al id, no al label.
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
  // ─── Belleza / estética ──────────────────────────────────────────────
  peluqueria: {
    nombre: 'Peluquería',
    profesionalSingular: 'profesional',
    profesionalPlural: 'profesionales',
    servicioSingular: 'servicio',
    servicioPlural: 'servicios',
    preguntaPaso1: '¿Qué te hacés hoy?',
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

  estetica: {
    nombre: 'Estética',
    profesionalSingular: 'profesional',
    profesionalPlural: 'profesionales',
    servicioSingular: 'tratamiento',
    servicioPlural: 'tratamientos',
    preguntaPaso1: '¿Qué tratamiento querés?',
    preguntaPaso2: '¿Con quién te atendés?',
  },

  maquillaje: {
    nombre: 'Maquillaje',
    profesionalSingular: 'profesional',
    profesionalPlural: 'profesionales',
    servicioSingular: 'servicio',
    servicioPlural: 'servicios',
    preguntaPaso1: '¿Qué servicio querés?',
    preguntaPaso2: '¿Con quién te atendés?',
  },

  manicura: {
    nombre: 'Manicura / Uñas',
    profesionalSingular: 'manicurista',
    profesionalPlural: 'manicuristas',
    servicioSingular: 'servicio',
    servicioPlural: 'servicios',
    preguntaPaso1: '¿Qué servicio querés?',
    preguntaPaso2: '¿Con quién te atendés?',
  },

  depilacion: {
    nombre: 'Depilación',
    profesionalSingular: 'profesional',
    profesionalPlural: 'profesionales',
    servicioSingular: 'servicio',
    servicioPlural: 'servicios',
    preguntaPaso1: '¿Qué servicio querés?',
    preguntaPaso2: '¿Con quién te atendés?',
  },

  spa: {
    nombre: 'Spa',
    profesionalSingular: 'profesional',
    profesionalPlural: 'profesionales',
    servicioSingular: 'servicio',
    servicioPlural: 'servicios',
    preguntaPaso1: '¿Qué servicio querés?',
    preguntaPaso2: '¿Con quién te atendés?',
  },

  masajes: {
    nombre: 'Masajes',
    profesionalSingular: 'masajista',
    profesionalPlural: 'masajistas',
    servicioSingular: 'sesión',
    servicioPlural: 'sesiones',
    preguntaPaso1: '¿Qué sesión querés?',
    preguntaPaso2: '¿Con qué masajista?',
  },

  // ─── Body art ────────────────────────────────────────────────────────
  tattoo: {
    nombre: 'Tattoo',
    profesionalSingular: 'artista',
    profesionalPlural: 'artistas',
    servicioSingular: 'trabajo',
    servicioPlural: 'trabajos',
    preguntaPaso1: '¿Qué trabajo querés hacerte?',
    preguntaPaso2: '¿Con qué artista?',
  },

  // ─── Salud ───────────────────────────────────────────────────────────
  consultorio: {
    nombre: 'Consultorio',
    profesionalSingular: 'profesional',
    profesionalPlural: 'profesionales',
    servicioSingular: 'consulta',
    servicioPlural: 'consultas',
    preguntaPaso1: '¿Qué consulta necesitás?',
    preguntaPaso2: '¿Con qué profesional?',
  },

  odontologia: {
    nombre: 'Odontología',
    profesionalSingular: 'odontólogo',
    profesionalPlural: 'odontólogos',
    servicioSingular: 'consulta',
    servicioPlural: 'consultas',
    preguntaPaso1: '¿Qué consulta necesitás?',
    preguntaPaso2: '¿Con qué odontólogo?',
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

  nutricion: {
    nombre: 'Nutrición',
    profesionalSingular: 'nutricionista',
    profesionalPlural: 'nutricionistas',
    servicioSingular: 'consulta',
    servicioPlural: 'consultas',
    preguntaPaso1: '¿Qué consulta necesitás?',
    preguntaPaso2: '¿Con qué nutricionista?',
  },

  psicologia: {
    nombre: 'Psicología',
    profesionalSingular: 'psicólogo',
    profesionalPlural: 'psicólogos',
    servicioSingular: 'sesión',
    servicioPlural: 'sesiones',
    preguntaPaso1: '¿Qué sesión querés?',
    preguntaPaso2: '¿Con qué psicólogo?',
  },

  veterinaria: {
    nombre: 'Veterinaria',
    profesionalSingular: 'veterinario',
    profesionalPlural: 'veterinarios',
    servicioSingular: 'consulta',
    servicioPlural: 'consultas',
    preguntaPaso1: '¿Qué consulta necesitás?',
    preguntaPaso2: '¿Con qué veterinario?',
  },

  // ─── Profesionales ───────────────────────────────────────────────────
  juridico: {
    nombre: 'Estudio jurídico',
    profesionalSingular: 'abogado',
    profesionalPlural: 'abogados',
    servicioSingular: 'consulta',
    servicioPlural: 'consultas',
    preguntaPaso1: '¿Qué consulta necesitás?',
    preguntaPaso2: '¿Con qué abogado?',
  },

  // ─── Otros ───────────────────────────────────────────────────────────
  taller: {
    nombre: 'Taller mecánico',
    profesionalSingular: 'mecánico',
    profesionalPlural: 'mecánicos',
    servicioSingular: 'servicio',
    servicioPlural: 'servicios',
    preguntaPaso1: '¿Qué servicio necesitás?',
    preguntaPaso2: '¿Con qué mecánico?',
  },

  fotografia: {
    nombre: 'Fotografía',
    profesionalSingular: 'fotógrafo',
    profesionalPlural: 'fotógrafos',
    servicioSingular: 'sesión',
    servicioPlural: 'sesiones',
    preguntaPaso1: '¿Qué sesión querés?',
    preguntaPaso2: '¿Con qué fotógrafo?',
  },

  gimnasio: {
    nombre: 'Gimnasio / Entrenamiento',
    profesionalSingular: 'entrenador',
    profesionalPlural: 'entrenadores',
    servicioSingular: 'clase',
    servicioPlural: 'clases',
    preguntaPaso1: '¿Qué clase querés?',
    preguntaPaso2: '¿Con qué entrenador?',
  },

  clases: {
    nombre: 'Clases particulares',
    profesionalSingular: 'profesor',
    profesionalPlural: 'profesores',
    servicioSingular: 'clase',
    servicioPlural: 'clases',
    preguntaPaso1: '¿Qué clase querés?',
    preguntaPaso2: '¿Con qué profesor?',
  },
}

// Fallback genérico para rubros no registrados.
// Antes este fallback reusaba RUBROS.peluqueria, lo que arrastraba copy
// específica de peluquería ("¿Qué te hacés hoy?") a negocios cuyo rubro
// había sido removido del catálogo. Ahora es un objeto neutro: la app no se
// rompe nunca y la copy queda en términos genéricos hasta que el dueño
// elija un rubro válido desde el panel.
const FALLBACK_GENERICO = {
  nombre: 'Servicio',
  profesionalSingular: 'profesional',
  profesionalPlural: 'profesionales',
  servicioSingular: 'servicio',
  servicioPlural: 'servicios',
  preguntaPaso1: '¿Qué servicio querés?',
  preguntaPaso2: '¿Con quién te atendés?',
}

// Devuelve el diccionario del rubro indicado, o el FALLBACK_GENERICO si el
// rubro no está registrado (negocios legacy, rubros removidos, valores
// corruptos). Nunca lanza error.
export function getRubro(rubroKey) {
  return RUBROS[rubroKey] || FALLBACK_GENERICO
}
