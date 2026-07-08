// Mapa interactivo con Leaflet (OpenStreetMap, sin API key).
// Vanilla Leaflet vía ref — más robusto con React 19 que react-leaflet.

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Pin propio (divIcon) con la identidad teal, evita depender de los assets
// de marcador de Leaflet que suelen romperse con bundlers.
const pinTeal = L.divIcon({
  className: '',
  html: `
    <div style="
      width:30px;height:42px;transform:translate(-50%,-100%);
      position:relative;filter:drop-shadow(0 4px 6px rgba(0,0,0,.4));">
      <svg viewBox="0 0 30 42" width="30" height="42" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z" fill="#0B6E6E"/>
        <circle cx="15" cy="15" r="6" fill="#5EEAD4"/>
      </svg>
    </div>`,
  iconSize: [30, 42],
  iconAnchor: [0, 0],
})

export default function MapaTrafico({ centro, punto, calles = [], onElegir }) {
  const contenedorRef = useRef(null)
  const mapaRef = useRef(null)
  const marcadorRef = useRef(null)
  const capaCallesRef = useRef(null)
  const onElegirRef = useRef(onElegir)

  // Mantener la callback más reciente sin recrear el mapa.
  useEffect(() => {
    onElegirRef.current = onElegir
  }, [onElegir])

  // Init una sola vez.
  useEffect(() => {
    if (mapaRef.current || !contenedorRef.current) return

    const mapa = L.map(contenedorRef.current, {
      center: centro,
      zoom: 16,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(mapa)

    capaCallesRef.current = L.layerGroup().addTo(mapa)

    mapa.on('click', (e) => {
      onElegirRef.current?.(e.latlng.lat, e.latlng.lng)
    })

    mapaRef.current = mapa
    // Leaflet a veces calcula mal el tamaño si el contenedor se montó recién.
    setTimeout(() => mapa.invalidateSize(), 100)

    return () => {
      mapa.remove()
      mapaRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mover marcador + recentrar cuando cambia el punto elegido.
  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa || !punto) return

    if (marcadorRef.current) {
      marcadorRef.current.setLatLng([punto.lat, punto.lon])
    } else {
      marcadorRef.current = L.marker([punto.lat, punto.lon], {
        icon: pinTeal,
      }).addTo(mapa)
    }
    mapa.setView([punto.lat, punto.lon], Math.max(mapa.getZoom(), 16), {
      animate: true,
    })
  }, [punto])

  // Resaltar las calles detectadas: la principal en cobre, el resto tenue.
  useEffect(() => {
    const capa = capaCallesRef.current
    if (!capa) return
    capa.clearLayers()

    calles.slice(0, 6).forEach((c, i) => {
      if (!c.geometria?.length) return
      const latlngs = c.geometria.map((p) => [p.lat, p.lon])
      L.polyline(latlngs, {
        color: i === 0 ? '#C2410C' : '#0B6E6E',
        weight: i === 0 ? 6 : 3,
        opacity: i === 0 ? 0.9 : 0.4,
        lineCap: 'round',
      }).addTo(capa)
    })
  }, [calles])

  return (
    <div
      ref={contenedorRef}
      className="w-full h-full min-h-[320px] rounded-2xl overflow-hidden z-0"
      style={{ background: '#0F1F1E' }}
    />
  )
}
