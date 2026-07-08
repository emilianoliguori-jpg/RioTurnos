// ════════════════════════════════════════════════════════════════════════
// MEDIDOR DE CIRCULACIÓN
// Poné una coordenada / dirección y estimá cuántos autos pasan por ahí y qué
// impacto publicitario tendría un cartel fijo en esa ubicación.
//
// Datos: OpenStreetMap (Overpass + Nominatim). Tránsito estimado por
// clasificación vial (TMDA) — es una ESTIMACIÓN, no un aforo real.
// ════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Crosshair,
  LocateFixed,
  Loader2,
  AlertTriangle,
  Signpost,
} from 'lucide-react'

import MapaTrafico from '../components/trafico/MapaTrafico'
import PanelResultado from '../components/trafico/PanelResultado'
import LogoRiotech from '../components/comun/LogoRiotech'
import {
  callesCercanas,
  direccionDeCoordenada,
  buscarDireccion,
} from '../services/overpass'
import { TIPOS_CARTEL } from '../lib/trafico'

// Río Cuarto, Córdoba — centro por defecto.
const CENTRO_DEFECTO = [-33.1232, -64.3493]

export default function MedidorTrafico() {
  const [punto, setPunto] = useState(null)
  const [calles, setCalles] = useState([])
  const [direccion, setDireccion] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  // Búsqueda de dirección
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState([])
  const [buscando, setBuscando] = useState(false)

  // Entrada manual lat/lng
  const [latManual, setLatManual] = useState('')
  const [lonManual, setLonManual] = useState('')

  // Config del cartel / impacto
  const [tipoCartel, setTipoCartel] = useState('estandar')
  const [ocupacion, setOcupacion] = useState(1.4)
  const [precioMensual, setPrecioMensual] = useState('')
  const [peatonesDia, setPeatonesDia] = useState('')
  const [cruce, setCruce] = useState(false)

  const debounceRef = useRef(null)

  // ── Elegir un punto y disparar el análisis ──────────────────────────────
  const analizarPunto = useCallback(async (lat, lon) => {
    setPunto({ lat, lon })
    setLatManual(lat.toFixed(6))
    setLonManual(lon.toFixed(6))
    setCargando(true)
    setError(null)
    setDireccion(null)
    setCalles([])

    try {
      const [vias, dir] = await Promise.all([
        callesCercanas(lat, lon),
        direccionDeCoordenada(lat, lon),
      ])
      setCalles(vias)
      setDireccion(dir)
      if (vias.length === 0) {
        setError('No se encontraron calles cerca de este punto. Probá otra ubicación.')
      }
    } catch (err) {
      setError('No pudimos consultar el mapa. Reintentá en unos segundos.')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }, [])

  // ── Búsqueda de dirección (con debounce) ────────────────────────────────
  const onCambioBusqueda = (valor) => {
    setTextoBusqueda(valor)
    clearTimeout(debounceRef.current)
    if (valor.trim().length < 3) {
      setResultadosBusqueda([])
      return
    }
    setBuscando(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await buscarDireccion(valor)
        setResultadosBusqueda(res)
      } catch {
        setResultadosBusqueda([])
      } finally {
        setBuscando(false)
      }
    }, 550)
  }

  const elegirResultado = (r) => {
    setTextoBusqueda(r.nombre.split(',').slice(0, 2).join(', '))
    setResultadosBusqueda([])
    analizarPunto(r.lat, r.lon)
  }

  const medirManual = () => {
    const lat = parseFloat(latManual)
    const lon = parseFloat(lonManual)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setError('Coordenadas inválidas. Usá formato decimal, ej: -33.1232, -64.3493')
      return
    }
    analizarPunto(lat, lon)
  }

  const usarMiUbicacion = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no permite geolocalización.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => analizarPunto(pos.coords.latitude, pos.coords.longitude),
      () => setError('No pudimos obtener tu ubicación. Revisá los permisos.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── Cálculo de vehículos/día según config ───────────────────────────────
  const viaPrincipal = calles.find((c) => !c.esPeatonal) || calles[0] || null

  let vehiculosDia = viaPrincipal?.vehiculosDia || 0
  if (cruce) {
    // Sumar calles distintas dentro de 35 m (una esquina real).
    const vistas = new Set()
    vehiculosDia = calles
      .filter((c) => c.distancia <= 35 && c.vehiculosDia > 0)
      .filter((c) => {
        const clave = c.nombre || c.id
        if (vistas.has(clave)) return false
        vistas.add(clave)
        return true
      })
      .reduce((sum, c) => sum + c.vehiculosDia, 0)
  }

  const config = {
    tipoCartel,
    ocupacion: parseFloat(ocupacion) || 1.4,
    precioMensual: parseFloat(precioMensual) || 0,
    peatonesDia: parseFloat(peatonesDia) || 0,
  }

  const centro = punto ? [punto.lat, punto.lon] : CENTRO_DEFECTO

  return (
    <div className="tema-oscuro min-h-screen t-app-bg font-sans">
      {/* Header */}
      <header className="border-b t-border">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-teal/15 border t-border">
              <Signpost size={20} className="text-teal-light" />
            </div>
            <div>
              <h1 className="font-serif text-xl t-strong leading-tight">
                Medidor de Circulación
              </h1>
              <p className="text-[11px] t-faded">
                Impacto de vía pública · estimación por coordenada
              </p>
            </div>
          </div>
          <Link to="/" className="text-xs t-soft hover:t-strong transition underline">
            Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-6 grid lg:grid-cols-[1fr_400px] gap-6">
        {/* ── Columna izquierda: mapa + controles ── */}
        <section className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border t-border t-surface px-3 py-2.5">
              <Search size={18} className="t-faded shrink-0" />
              <input
                value={textoBusqueda}
                onChange={(e) => onCambioBusqueda(e.target.value)}
                placeholder="Buscá una dirección, esquina o lugar…"
                className="flex-1 bg-transparent outline-none t-strong placeholder:t-faded text-sm"
              />
              {buscando && <Loader2 size={16} className="animate-spin t-faded" />}
            </div>
            {resultadosBusqueda.length > 0 && (
              <ul className="absolute z-[500] mt-1 w-full rounded-xl border t-border t-surface shadow-xl overflow-hidden">
                {resultadosBusqueda.map((r, i) => (
                  <li key={i}>
                    <button
                      onClick={() => elegirResultado(r)}
                      className="w-full text-left px-3 py-2.5 text-sm t-body t-hover transition border-b t-border last:border-0"
                    >
                      {r.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mapa */}
          <div className="relative h-[420px] lg:h-[520px]">
            <MapaTrafico
              centro={centro}
              punto={punto}
              calles={calles}
              onElegir={analizarPunto}
            />
            {!punto && (
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="pointer-events-none rounded-full bg-ink/70 px-4 py-2 text-xs text-paper flex items-center gap-2 backdrop-blur">
                  <Crosshair size={14} /> Tocá el mapa para elegir un punto
                </div>
              </div>
            )}
            {cargando && (
              <div className="absolute top-3 right-3 rounded-full bg-ink/80 px-3 py-1.5 text-xs text-paper flex items-center gap-2 backdrop-blur z-[500]">
                <Loader2 size={14} className="animate-spin" /> Midiendo…
              </div>
            )}
          </div>

          {/* Entrada manual + acciones */}
          <div className="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2">
            <input
              value={latManual}
              onChange={(e) => setLatManual(e.target.value)}
              placeholder="Latitud"
              className="rounded-xl border t-border t-surface px-3 py-2.5 text-sm t-strong placeholder:t-faded outline-none focus:border-teal-light transition"
            />
            <input
              value={lonManual}
              onChange={(e) => setLonManual(e.target.value)}
              placeholder="Longitud"
              className="rounded-xl border t-border t-surface px-3 py-2.5 text-sm t-strong placeholder:t-faded outline-none focus:border-teal-light transition"
            />
            <button
              onClick={medirManual}
              className="rounded-xl bg-teal text-paper px-4 py-2.5 text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Crosshair size={16} /> Medir
            </button>
            <button
              onClick={usarMiUbicacion}
              title="Usar mi ubicación"
              className="rounded-xl border t-border t-surface px-4 py-2.5 text-sm t-body t-hover transition flex items-center justify-center gap-2"
            >
              <LocateFixed size={16} /> <span className="sm:hidden">Mi ubicación</span>
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-copper/40 bg-copper/10 px-3 py-2.5 text-sm text-copper-light">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Configuración del cartel */}
          <div className="rounded-2xl border t-border t-surface p-4 space-y-4">
            <h3 className="font-serif text-lg t-strong">Parámetros del cartel</h3>

            <div>
              <label className="text-xs t-soft block mb-1.5">Tipo de exposición</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TIPOS_CARTEL).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setTipoCartel(key)}
                    className={`rounded-lg border px-2 py-2 text-xs transition ${
                      tipoCartel === key
                        ? 'border-teal-light bg-teal/15 t-strong'
                        : 't-border t-body t-hover'
                    }`}
                  >
                    {t.etiqueta}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs t-soft block mb-1.5">Ocupación (pers/veh)</label>
                <input
                  type="number" step="0.1" min="1"
                  value={ocupacion}
                  onChange={(e) => setOcupacion(e.target.value)}
                  className="w-full rounded-lg border t-border t-surface-2 px-3 py-2 text-sm t-strong outline-none focus:border-teal-light"
                />
              </div>
              <div>
                <label className="text-xs t-soft block mb-1.5">Peatones/día (opcional)</label>
                <input
                  type="number" min="0"
                  value={peatonesDia}
                  onChange={(e) => setPeatonesDia(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border t-border t-surface-2 px-3 py-2 text-sm t-strong placeholder:t-faded outline-none focus:border-teal-light"
                />
              </div>
            </div>

            <div>
              <label className="text-xs t-soft block mb-1.5">
                Precio mensual del espacio (opcional → calcula CPM)
              </label>
              <input
                type="number" min="0"
                value={precioMensual}
                onChange={(e) => setPrecioMensual(e.target.value)}
                placeholder="Ej: 150000"
                className="w-full rounded-lg border t-border t-surface-2 px-3 py-2 text-sm t-strong placeholder:t-faded outline-none focus:border-teal-light"
              />
            </div>

            <label className="flex items-center gap-2 text-sm t-body cursor-pointer">
              <input
                type="checkbox"
                checked={cruce}
                onChange={(e) => setCruce(e.target.checked)}
                className="accent-teal-light w-4 h-4"
              />
              Contar cruce de calles (esquina) — suma el tránsito de las vías del punto
            </label>
          </div>
        </section>

        {/* ── Columna derecha: resultados ── */}
        <aside className="lg:sticky lg:top-6 self-start">
          {vehiculosDia > 0 || (punto && !cargando) ? (
            <PanelResultado
              vehiculosDia={vehiculosDia}
              config={config}
              viaPrincipal={viaPrincipal}
              direccion={direccion}
            />
          ) : (
            <div className="rounded-2xl border t-border t-surface p-8 text-center">
              <div className="grid place-items-center w-14 h-14 mx-auto rounded-2xl bg-teal/15 border t-border mb-4">
                <Signpost size={26} className="text-teal-light" />
              </div>
              <h2 className="font-serif text-xl t-strong">Elegí una ubicación</h2>
              <p className="mt-2 text-sm t-soft">
                Buscá una dirección, tocá el mapa o cargá una coordenada. Vas a ver
                cuántos vehículos pasan por día y el impacto estimado de un cartel
                fijo en ese punto.
              </p>
            </div>
          )}

          <p className="mt-4 text-[11px] t-faded leading-relaxed">
            Estimación basada en la clasificación vial de OpenStreetMap (TMDA).
            No reemplaza un aforo de tránsito real; sirve para comparar
            ubicaciones y dimensionar el impacto potencial.
          </p>

          <div className="mt-4 flex items-center gap-2 opacity-60">
            <span className="text-[10px] uppercase tracking-widest t-faded">Un producto de</span>
            <LogoRiotech alto={16} />
          </div>
        </aside>
      </main>
    </div>
  )
}
