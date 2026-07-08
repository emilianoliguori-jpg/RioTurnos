// ════════════════════════════════════════════════════════════════════════
// MODELO DE ESTIMACIÓN DE TRÁFICO + IMPACTO PUBLICITARIO
//
// No existen sensores en cada esquina, así que estimamos el TMDA (Tránsito
// Medio Diario Anual) a partir de la clasificación vial de OpenStreetMap.
// Es el método estándar de la ingeniería de tránsito cuando no hay aforos
// reales: cada tipo de vía tiene un rango típico de vehículos/día.
//
// Todo este archivo es lógica pura (sin red, sin React) → fácil de testear
// y de ajustar los números en un solo lugar.
// ════════════════════════════════════════════════════════════════════════

// TMDA base por clase de vía `highway` de OSM (vehículos/día, contexto urbano
// argentino de ciudad media). Incluye la cantidad de carriles "típica" que
// asume ese número base, para poder corregir si la vía real tiene más/menos.
export const CLASES_VIA = {
  motorway:       { tmda: 60000, carrilesBase: 3, etiqueta: 'Autopista' },
  motorway_link:  { tmda: 18000, carrilesBase: 1, etiqueta: 'Acceso a autopista' },
  trunk:          { tmda: 35000, carrilesBase: 2, etiqueta: 'Ruta troncal' },
  trunk_link:     { tmda: 12000, carrilesBase: 1, etiqueta: 'Acceso a ruta' },
  primary:        { tmda: 20000, carrilesBase: 2, etiqueta: 'Avenida principal' },
  primary_link:   { tmda: 8000,  carrilesBase: 1, etiqueta: 'Conexión de avenida' },
  secondary:      { tmda: 11000, carrilesBase: 2, etiqueta: 'Avenida secundaria' },
  secondary_link: { tmda: 5000,  carrilesBase: 1, etiqueta: 'Conexión secundaria' },
  tertiary:       { tmda: 6000,  carrilesBase: 1, etiqueta: 'Calle colectora' },
  tertiary_link:  { tmda: 3000,  carrilesBase: 1, etiqueta: 'Conexión terciaria' },
  unclassified:   { tmda: 2500,  carrilesBase: 1, etiqueta: 'Calle sin clasificar' },
  residential:    { tmda: 1500,  carrilesBase: 1, etiqueta: 'Calle residencial' },
  living_street:  { tmda: 600,   carrilesBase: 1, etiqueta: 'Calle de convivencia' },
  service:        { tmda: 400,   carrilesBase: 1, etiqueta: 'Calle de servicio' },
  pedestrian:     { tmda: 0,     carrilesBase: 1, etiqueta: 'Peatonal', peatonal: true },
  footway:        { tmda: 0,     carrilesBase: 1, etiqueta: 'Vereda / senda', peatonal: true },
  path:           { tmda: 0,     carrilesBase: 1, etiqueta: 'Sendero', peatonal: true },
}

// Perfil horario de una vía urbana en día hábil: fracción del TMDA que circula
// en cada hora (0 a 23). Suma ≈ 1. Doble pico mañana/tarde clásico.
export const PERFIL_HORARIO = [
  0.006, 0.004, 0.003, 0.003, 0.005, 0.012, // 00–05
  0.032, 0.061, 0.078, 0.066, 0.052, 0.050, // 06–11
  0.055, 0.056, 0.050, 0.052, 0.060, 0.074, // 12–17
  0.079, 0.066, 0.044, 0.030, 0.020, 0.011, // 18–23
]

// Factor de visibilidad del cartel: qué porción de quienes pasan lo REGISTRAN.
// (VAC — "visibility adjusted contact" en la jerga de vía pública / OOH.)
export const TIPOS_CARTEL = {
  frontal:   { factor: 0.50, etiqueta: 'Frontal / iluminado' },
  estandar:  { factor: 0.38, etiqueta: 'Estándar' },
  lateral:   { factor: 0.28, etiqueta: 'Lateral / oblicuo' },
}

// Ocupación media de un vehículo (personas por auto). Fuente típica LatAm.
export const OCUPACION_MEDIA = 1.4

// ─────────────────────────────────────────────────────────────────────────

/**
 * Estima el TMDA (vehículos/día) de un tramo de calle según su clasificación.
 * @param {{highway:string, lanes?:string|number, maxspeed?:string|number}} via
 * @returns {{ vehiculosDia:number, clase:object, esPeatonal:boolean, claseKey:string }}
 */
export function estimarTmda(via) {
  const claseKey = via?.highway
  const clase = CLASES_VIA[claseKey] || CLASES_VIA.residential

  let vehiculosDia = clase.tmda

  // Corrección por carriles: si la vía tiene más carriles que la base de su
  // clase, sube el tráfico (con amortiguación, no es lineal 1:1).
  const carriles = parseFloat(via?.lanes)
  if (Number.isFinite(carriles) && carriles > 0 && clase.carrilesBase > 0) {
    const ratio = carriles / clase.carrilesBase
    const factor = 1 + 0.35 * (ratio - 1) // amortiguado
    vehiculosDia *= Math.max(0.6, Math.min(2.2, factor))
  }

  return {
    vehiculosDia: Math.round(vehiculosDia),
    clase,
    claseKey: CLASES_VIA[claseKey] ? claseKey : 'residential',
    esPeatonal: !!clase.peatonal,
  }
}

/**
 * Distribución horaria de vehículos a partir del TMDA.
 * @returns {{hora:number, vehiculos:number}[]}
 */
export function distribucionHoraria(vehiculosDia) {
  return PERFIL_HORARIO.map((frac, hora) => ({
    hora,
    vehiculos: Math.round(vehiculosDia * frac),
  }))
}

/** Hora pico y su volumen. */
export function horaPico(vehiculosDia) {
  let mejor = { hora: 8, vehiculos: 0 }
  distribucionHoraria(vehiculosDia).forEach((h) => {
    if (h.vehiculos > mejor.vehiculos) mejor = h
  })
  return mejor
}

/**
 * Convierte vehículos/día en impacto publicitario (contactos = impactos).
 * @param {number} vehiculosDia
 * @param {object} opts { tipoCartel:'frontal'|'estandar'|'lateral', ocupacion:number, peatonesDia:number }
 */
export function calcularImpacto(vehiculosDia, opts = {}) {
  const tipo = TIPOS_CARTEL[opts.tipoCartel] || TIPOS_CARTEL.estandar
  const ocupacion = opts.ocupacion ?? OCUPACION_MEDIA
  const peatonesDia = Math.max(0, opts.peatonesDia || 0)

  // Contactos por vehículos: personas que pasan × factor de visibilidad.
  const contactosVehiculos = vehiculosDia * ocupacion * tipo.factor
  // Peatones ven el cartel con mayor tasa de registro (van más lento).
  const contactosPeatones = peatonesDia * Math.min(0.85, tipo.factor + 0.35)

  const contactosDia = Math.round(contactosVehiculos + contactosPeatones)

  return {
    contactosDia,
    contactosSemana: contactosDia * 7,
    contactosMes: contactosDia * 30,
    personasDia: Math.round(vehiculosDia * ocupacion + peatonesDia),
    factorVisibilidad: tipo.factor,
  }
}

/**
 * Costo por mil impactos (CPM) dado un precio mensual del espacio.
 * @returns {number|null} pesos por cada 1000 contactos, o null si no hay datos.
 */
export function calcularCPM(precioMensual, contactosMes) {
  if (!precioMensual || !contactosMes) return null
  return (precioMensual / contactosMes) * 1000
}

/**
 * Puntaje de impacto 0–100 en escala logarítmica (500 → bajo, 150.000+ → tope).
 * Sirve para un "medidor" visual comparable entre ubicaciones.
 */
export function puntajeImpacto(contactosDia) {
  if (contactosDia <= 0) return 0
  const min = Math.log10(300)
  const max = Math.log10(200000)
  const v = (Math.log10(contactosDia) - min) / (max - min)
  return Math.max(0, Math.min(100, Math.round(v * 100)))
}

export function nivelImpacto(puntaje) {
  if (puntaje >= 78) return { texto: 'Impacto premium', tono: 'alto' }
  if (puntaje >= 55) return { texto: 'Alto tránsito', tono: 'alto' }
  if (puntaje >= 35) return { texto: 'Tránsito medio', tono: 'medio' }
  if (puntaje >= 15) return { texto: 'Tránsito bajo', tono: 'bajo' }
  return { texto: 'Muy bajo / peatonal', tono: 'bajo' }
}

// ── Geometría: distancia punto→polilínea (para elegir la calle más cercana) ──

const R_TIERRA = 6371000 // metros

export function distanciaMetros(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLon = (lon2 - lon1) * rad
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2
  return 2 * R_TIERRA * Math.asin(Math.sqrt(a))
}

/**
 * Distancia mínima (m) de un punto a una polilínea definida por [{lat,lon}...].
 * Proyecta el punto sobre cada segmento en un plano local (buena aprox. a
 * escala de cuadra) y toma el mínimo.
 */
export function distanciaAPolilinea(lat, lon, puntos) {
  if (!puntos || puntos.length === 0) return Infinity
  if (puntos.length === 1) {
    return distanciaMetros(lat, lon, puntos[0].lat, puntos[0].lon)
  }

  const rad = Math.PI / 180
  const cosLat = Math.cos(lat * rad)
  // Coordenadas locales en metros relativas al punto de consulta.
  const proj = (p) => ({
    x: (p.lon - lon) * rad * R_TIERRA * cosLat,
    y: (p.lat - lat) * rad * R_TIERRA,
  })

  let min = Infinity
  for (let i = 0; i < puntos.length - 1; i++) {
    const a = proj(puntos[i])
    const b = proj(puntos[i + 1])
    const dx = b.x - a.x
    const dy = b.y - a.y
    const largo2 = dx * dx + dy * dy
    let t = 0
    if (largo2 > 0) {
      t = -(a.x * dx + a.y * dy) / largo2
      t = Math.max(0, Math.min(1, t))
    }
    const cx = a.x + t * dx
    const cy = a.y + t * dy
    const d = Math.sqrt(cx * cx + cy * cy)
    if (d < min) min = d
  }
  return min
}
