// ════════════════════════════════════════════════════════════════════════
// SERVICIOS DE MAPA — todos gratuitos y sin API key.
//   · Overpass API  → calles cercanas a una coordenada (datos OpenStreetMap)
//   · Nominatim     → buscar dirección ↔ coordenada (geocodificación)
//
// Nota: son servicios comunitarios con límites de uso. Para producción con
// mucho tráfico conviene un endpoint propio o un proveedor pago.
// ════════════════════════════════════════════════════════════════════════

import { distanciaAPolilinea, estimarTmda } from '../lib/trafico'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

/**
 * Busca las vías con tránsito vehicular/peatonal alrededor de una coordenada.
 * @param {number} lat
 * @param {number} lon
 * @param {number} radio metros (default 45)
 * @returns {Promise<Array>} calles ordenadas por cercanía, con TMDA estimado.
 */
export async function callesCercanas(lat, lon, radio = 45) {
  const query = `
    [out:json][timeout:25];
    way(around:${radio},${lat},${lon})
      [highway]
      [highway!~"^(steps|elevator|construction|proposed|corridor|platform|bus_stop)$"];
    out tags geom;
  `.trim()

  const data = await consultarOverpass(query)
  const vias = (data.elements || [])
    .filter((el) => el.type === 'way' && el.geometry?.length)
    .map((el) => {
      const puntos = el.geometry.map((g) => ({ lat: g.lat, lon: g.lon }))
      const distancia = distanciaAPolilinea(lat, lon, puntos)
      const est = estimarTmda(el.tags || {})
      return {
        id: el.id,
        nombre: el.tags?.name || el.tags?.ref || null,
        highway: el.tags?.highway,
        carriles: el.tags?.lanes ? parseFloat(el.tags.lanes) : null,
        velocidad: el.tags?.maxspeed || null,
        sentidoUnico: el.tags?.oneway === 'yes',
        distancia: Math.round(distancia),
        geometria: puntos,
        ...est,
      }
    })
    .sort((a, b) => a.distancia - b.distancia)

  return vias
}

async function consultarOverpass(query) {
  let ultimoError
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      })
      if (!res.ok) throw new Error('Overpass ' + res.status)
      return await res.json()
    } catch (err) {
      ultimoError = err
    }
  }
  throw ultimoError || new Error('No se pudo consultar Overpass')
}

/**
 * Geocodificación inversa: coordenada → dirección legible.
 */
export async function direccionDeCoordenada(lat, lon) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18` +
      `&lat=${lat}&lon=${lon}&accept-language=es`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    return data.display_name || null
  } catch {
    return null
  }
}

/**
 * Geocodificación directa: texto (dirección) → lista de coordenadas.
 * @returns {Promise<Array<{nombre:string, lat:number, lon:number}>>}
 */
export async function buscarDireccion(texto) {
  if (!texto?.trim()) return []
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5` +
    `&accept-language=es&q=${encodeURIComponent(texto)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return []
  const data = await res.json()
  return data.map((d) => ({
    nombre: d.display_name,
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
  }))
}
