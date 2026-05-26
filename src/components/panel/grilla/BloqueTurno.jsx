// Bloque visual de un turno dentro de una columna de profesional.
// Posicionado absolutamente por (hora, duración). Tamaño = duración * pxPorMin.
//
// Adapta la info mostrada al alto:
//   - <18px: solo la hora
//   - <32px: hora + cliente
//   - normal: hora + cliente + servicio

import { horaAMinutos } from '../../../lib/fechas'

const ESTADO_STYLES = {
  confirmado:     { bg: '#0F1419', borde: 'rgba(15,20,25,0.3)'   },
  pendiente_pago: { bg: '#C2410C', borde: 'rgba(194,65,12,0.4)'  },
  atendido:       { bg: '#0B6E6E', borde: 'rgba(11,110,110,0.4)' },
}

export default function BloqueTurno({ turno, minVisible, pxPorMin, onClick }) {
  if (!turno.hora || !turno.duracionMinutos) return null

  const inicio = horaAMinutos(turno.hora)
  const top = (inicio - minVisible) * pxPorMin
  const height = Math.max(turno.duracionMinutos * pxPorMin - 2, 12)
  const styles = ESTADO_STYLES[turno.estado] || ESTADO_STYLES.confirmado

  const compactoXs = height < 18
  const compactoSm = height < 32
  const nombre = turno.datosCliente?.nombre || 'Sin nombre'

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${turno.hora} · ${nombre} · ${turno.servicioNombre || ''}`}
      className="absolute left-1 right-1 rounded-lg text-left px-1.5 py-1 overflow-hidden border transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: styles.bg,
        borderColor: styles.borde,
      }}
    >
      <p className="font-sans text-[10px] text-white/80 leading-none">
        {turno.hora}
      </p>
      {!compactoSm && (
        <p className="font-sans text-xs text-white font-medium truncate leading-tight mt-0.5">
          {nombre}
        </p>
      )}
      {!compactoSm && turno.servicioNombre && (
        <p className="font-sans text-[10px] text-white/80 truncate leading-tight">
          {turno.servicioNombre}
        </p>
      )}
      {compactoSm && !compactoXs && (
        <p className="font-sans text-[10px] text-white truncate leading-tight">
          {nombre}
        </p>
      )}
    </button>
  )
}
