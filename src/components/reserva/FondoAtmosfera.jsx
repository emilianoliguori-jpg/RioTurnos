// Fondo atmosférico de la pantalla de reserva — variante oscura final.
//
// Composición:
//   - Glow central pulsante teal-light (pulse-glow 7s)
//   - Glow secundario abajo-derecha en copper-light (pulse-glow desfasado)
//   - Tres ríos fluyendo horizontal con los TRES COLORES DEL LOGO de Río Tech:
//       1. teal-light  #5EEAD4
//       2. paper       #F5F1EA
//       3. copper-light #FB923C
//     Cada uno con riverFlow (translateX) + dash-flow (stroke-dashoffset).
//     Distintas velocidades y direcciones para sensación de capas.
//
// Todo pointer-events: none — decorativo, no interactivo.

const C_TEAL  = '#5EEAD4'
const C_PAPER = '#F5F1EA'
const C_COBRE = '#FB923C'

export default function FondoAtmosfera() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Glow central pulsante (teal del logo) */}
      <div
        className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] rounded-full pulse-glow"
        style={{ backgroundColor: C_TEAL, filter: 'blur(140px)' }}
      />

      {/* Glow secundario (cobre del logo), desfasado en el ciclo */}
      <div
        className="absolute -bottom-32 -right-24 w-[24rem] h-[24rem] rounded-full pulse-glow"
        style={{
          backgroundColor: C_COBRE,
          filter: 'blur(120px)',
          opacity: 0.35,
          animationDelay: '-3.5s',
        }}
      />

      {/* Glow terciario sutil (paper warm), arriba izquierda */}
      <div
        className="absolute -top-20 -left-24 w-[20rem] h-[20rem] rounded-full pulse-glow"
        style={{
          backgroundColor: C_PAPER,
          filter: 'blur(140px)',
          opacity: 0.18,
          animationDelay: '-5s',
        }}
      />

      {/* Río 1 — teal-light, arriba. Más rápido. */}
      <Rio
        topClass="top-[14%]"
        color={C_TEAL}
        strokeWidth={2.2}
        opacity={0.45}
        delayDash="-0s"
        delayFlow="-1s"
        durationFlow="11s"
      />

      {/* Río 2 — paper, medio. Más grueso, ritmo intermedio, dirección opuesta. */}
      <Rio
        topClass="top-[45%]"
        color={C_PAPER}
        strokeWidth={3.5}
        opacity={0.32}
        delayDash="-4s"
        delayFlow="-6s"
        durationFlow="16s"
        flowDirection="alternate-reverse"
      />

      {/* Río 3 — copper-light, abajo. Más lento y grueso, cierra la composición. */}
      <Rio
        topClass="bottom-[14%]"
        color={C_COBRE}
        strokeWidth={5}
        opacity={0.28}
        delayDash="-7s"
        delayFlow="-3s"
        durationFlow="20s"
      />
    </div>
  )
}

// Una "línea de río" — SVG horizontal a un alto fijo, con translateX
// continuo (riverFlow) y stroke-dashoffset también animado (dash-flow).
// Stretching: preserveAspectRatio="none" deja el path estirarse al ancho.
// vector-effect="non-scaling-stroke" mantiene el grosor constante en pixels
// independientemente del stretch (importante mobile/desktop).
function Rio({
  topClass,
  color,
  strokeWidth,
  opacity,
  delayDash,
  delayFlow,
  durationFlow,
  flowDirection = 'alternate',
}) {
  return (
    <svg
      className={`absolute left-0 w-full h-32 river-flow ${topClass}`}
      style={{
        animationDelay: delayFlow,
        animationDuration: durationFlow,
        animationDirection: flowDirection,
      }}
      viewBox="0 0 800 100"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M -100 50 Q 200 -10 400 50 T 900 50"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        fill="none"
        opacity={opacity}
        className="dash-flow"
        style={{ animationDelay: delayDash }}
      />
    </svg>
  )
}
