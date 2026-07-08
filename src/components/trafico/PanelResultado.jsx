// Panel de resultados: medidor de impacto + métricas + gráfico + calles.

import {
  Car,
  Users,
  Eye,
  TrendingUp,
  MapPin,
  Gauge as GaugeIcon,
  Footprints,
} from 'lucide-react'
import {
  calcularImpacto,
  calcularCPM,
  puntajeImpacto,
  nivelImpacto,
  horaPico,
} from '../../lib/trafico'
import GraficoHoras from './GraficoHoras'

const fmt = (n) => Math.round(n).toLocaleString('es-AR')
const fmtPesos = (n) =>
  '$' + Math.round(n).toLocaleString('es-AR')

function Medidor({ puntaje, nivel }) {
  // Gauge semicircular. Ángulo de -90° (izq) a +90° (der).
  const angulo = -90 + (puntaje / 100) * 180
  const tono =
    nivel.tono === 'alto' ? '#5EEAD4' : nivel.tono === 'medio' ? '#FB923C' : '#94a3b8'

  // Arco de fondo y arco de valor.
  const r = 80
  const cx = 100
  const cy = 100
  const largoArco = Math.PI * r // semicírculo
  const dash = (puntaje / 100) * largoArco

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 200 116" className="w-full max-w-[260px]">
        {/* pista */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(245,241,234,0.12)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* valor */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={tono}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${largoArco}`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
        {/* aguja */}
        <g
          style={{
            transform: `rotate(${angulo}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + 6} stroke={tono} strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="6" fill={tono} />
        </g>
      </svg>
      <div className="-mt-6 text-center">
        <div className="display-mono text-5xl t-strong">{puntaje}</div>
        <div className="eyebrow mt-1" style={{ color: tono }}>
          {nivel.texto}
        </div>
      </div>
    </div>
  )
}

function Metrica({ icono: Icono, valor, etiqueta, acento }) {
  return (
    <div className="rounded-xl border t-border t-surface-2 p-3">
      <Icono size={16} className={acento ? 'text-copper-light' : 't-soft'} style={acento ? {} : { color: 'var(--text-soft)' }} />
      <div className="mt-2 display-mono text-2xl t-strong leading-none">{valor}</div>
      <div className="mt-1 text-[11px] t-faded font-sans">{etiqueta}</div>
    </div>
  )
}

export default function PanelResultado({ vehiculosDia, config, viaPrincipal, direccion }) {
  const impacto = calcularImpacto(vehiculosDia, {
    tipoCartel: config.tipoCartel,
    ocupacion: config.ocupacion,
    peatonesDia: config.peatonesDia,
  })
  const puntaje = puntajeImpacto(impacto.contactosDia)
  const nivel = nivelImpacto(puntaje)
  const pico = horaPico(vehiculosDia)
  const cpm = calcularCPM(config.precioMensual, impacto.contactosMes)

  return (
    <div className="space-y-5">
      {direccion && (
        <div className="flex items-start gap-2 text-sm t-soft font-sans">
          <MapPin size={15} className="mt-0.5 shrink-0 text-teal-light" />
          <span>{direccion}</span>
        </div>
      )}

      {/* Medidor */}
      <div className="rounded-2xl border t-border t-surface p-5">
        <Medidor puntaje={puntaje} nivel={nivel} />
        <p className="mt-3 text-center text-xs t-faded font-sans">
          Índice de circulación e impacto (0–100)
        </p>
      </div>

      {/* Contacto estrella */}
      <div className="rounded-2xl border border-copper/30 p-5 text-center"
           style={{ background: 'linear-gradient(135deg, rgba(194,65,12,0.14), rgba(251,146,60,0.05))' }}>
        <div className="eyebrow text-copper-light">Impactos por día</div>
        <div className="mt-2 display-mono text-5xl t-strong">{fmt(impacto.contactosDia)}</div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs t-soft font-sans">
          <span>{fmt(impacto.contactosSemana)} / semana</span>
          <span className="opacity-40">·</span>
          <span>{fmt(impacto.contactosMes)} / mes</span>
        </div>
      </div>

      {/* Grilla de métricas */}
      <div className="grid grid-cols-2 gap-3">
        <Metrica icono={Car} valor={fmt(vehiculosDia)} etiqueta="Vehículos / día (est.)" acento />
        <Metrica icono={Users} valor={fmt(impacto.personasDia)} etiqueta="Personas que pasan / día" />
        <Metrica icono={TrendingUp} valor={`${fmt(pico.vehiculos)}`} etiqueta={`Pico ${String(pico.hora).padStart(2, '0')}:00 h (veh/h)`} />
        <Metrica icono={Eye} valor={`${Math.round(impacto.factorVisibilidad * 100)}%`} etiqueta="Factor de visibilidad" />
        {config.peatonesDia > 0 && (
          <Metrica icono={Footprints} valor={fmt(config.peatonesDia)} etiqueta="Peatones / día (manual)" />
        )}
        {cpm != null && (
          <Metrica icono={GaugeIcon} valor={fmtPesos(cpm)} etiqueta="CPM (costo x mil impactos)" acento />
        )}
      </div>

      {/* Gráfico horario */}
      <div className="rounded-2xl border t-border t-surface p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg t-strong">Circulación por hora</h3>
          <span className="text-[11px] t-faded font-sans">día hábil típico</span>
        </div>
        <GraficoHoras vehiculosDia={vehiculosDia} />
      </div>

      {/* Vía principal */}
      {viaPrincipal && (
        <div className="rounded-2xl border t-border t-surface-2 p-4 text-sm font-sans">
          <div className="eyebrow t-soft mb-2">Vía medida</div>
          <div className="t-strong font-medium">
            {viaPrincipal.nombre || 'Calle sin nombre'}
          </div>
          <div className="mt-1 t-soft text-xs">
            {viaPrincipal.clase.etiqueta}
            {viaPrincipal.carriles ? ` · ${viaPrincipal.carriles} carriles` : ''}
            {viaPrincipal.velocidad ? ` · máx ${viaPrincipal.velocidad}` : ''}
            {viaPrincipal.sentidoUnico ? ' · sentido único' : ''}
            {` · a ${viaPrincipal.distancia} m del punto`}
          </div>
        </div>
      )}
    </div>
  )
}
