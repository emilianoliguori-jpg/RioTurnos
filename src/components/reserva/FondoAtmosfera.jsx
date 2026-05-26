// Fondo atmosférico de la pantalla de reserva.
// 3 variantes para comparar — el selector vive en ReservaPage.
//
//   A: paper + más presencia del acento (washes teal + cobre en movimiento)
//   B: dark teal-deep + curvas luminosas teal-light + glow que respira
//   C: paper con gradiente sutil + tres capas de "ríos" fluyendo (mi propuesta)
//
// Todo pointer-events: none, no interfiere con la interacción.

export default function FondoAtmosfera({ variante = 'A', colorAcento }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {variante === 'A' && <VarianteA colorAcento={colorAcento} />}
      {variante === 'B' && <VarianteB colorAcento={colorAcento} />}
      {variante === 'C' && <VarianteC colorAcento={colorAcento} />}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// A — paper + acento PROTAGÓNICO (más vida, más color, sin abandonar paper)
// ────────────────────────────────────────────────────────────────────
function VarianteA({ colorAcento }) {
  return (
    <>
      {/* Wash del acento desde izquierda, recorre horizontal lento y visible */}
      <div
        className="absolute top-[15%] -left-32 w-[26rem] h-[26rem] rounded-full blur-3xl river-flow"
        style={{ backgroundColor: colorAcento, opacity: 0.22 }}
      />

      {/* Wash cobre desde derecha en dirección opuesta */}
      <div
        className="absolute bottom-[12%] -right-32 w-[24rem] h-[24rem] rounded-full blur-3xl river-flow"
        style={{
          backgroundColor: '#C2410C',
          opacity: 0.18,
          animationDelay: '-7s',
          animationDirection: 'alternate-reverse',
        }}
      />

      {/* Curva del acento en el centro, dasharray que corre como corriente */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-40"
        viewBox="0 0 800 100"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 0 60 Q 200 0 400 50 T 800 40"
          stroke={colorAcento}
          strokeWidth="2.5"
          fill="none"
          opacity="0.28"
          className="dash-flow"
        />
      </svg>

      {/* Grain suavísimo */}
      <div className="absolute inset-0 bg-grain" style={{ opacity: 0.7 }} />
    </>
  )
}

// ────────────────────────────────────────────────────────────────────
// B — DARK teal-deep + curvas luminosas teal-light
// ────────────────────────────────────────────────────────────────────
function VarianteB({ colorAcento }) {
  return (
    <>
      {/* Glow central pulsante luminoso */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full pulse-glow"
        style={{
          backgroundColor: '#5EEAD4',
          filter: 'blur(120px)',
        }}
      />

      {/* Glow secundario abajo, con acento del negocio */}
      <div
        className="absolute -bottom-32 -right-20 w-[22rem] h-[22rem] rounded-full pulse-glow"
        style={{
          backgroundColor: colorAcento,
          filter: 'blur(100px)',
          opacity: 0.4,
          animationDelay: '-3.5s',
        }}
      />

      {/* Tres curvas luminosas fluyendo horizontalmente con dasharray */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 1200"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M -50 250 Q 200 150 400 280 T 850 250"
          stroke="#5EEAD4"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
          className="dash-flow"
        />
        <path
          d="M -50 600 Q 200 500 400 630 T 850 600"
          stroke="#5EEAD4"
          strokeWidth="2"
          fill="none"
          opacity="0.32"
          className="dash-flow"
          style={{ animationDelay: '-4s', animationDuration: '13s' }}
        />
        <path
          d="M -50 950 Q 200 850 400 980 T 850 950"
          stroke="#5EEAD4"
          strokeWidth="2"
          fill="none"
          opacity="0.25"
          className="dash-flow"
          style={{ animationDelay: '-7s', animationDuration: '16s' }}
        />
      </svg>
      {/* B sin grain — sobre dark se ve como compresión */}
    </>
  )
}

// ────────────────────────────────────────────────────────────────────
// C — MI PROPUESTA: paper + gradiente sutil + tres capas de "ríos" fluyendo
// Editorial premium con la metáfora del nombre hecha visible.
// ────────────────────────────────────────────────────────────────────
function VarianteC({ colorAcento }) {
  return (
    <>
      {/* Gradiente sutil paper → paper-tinted (sky-to-water feeling) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #F5F1EA 0%, #F2EDE3 60%, #ECE5D7 100%)',
        }}
      />

      {/* Tres capas de ríos, fluyendo a distinta velocidad y dirección */}
      <svg
        className="absolute top-[8%] left-0 w-full h-32 river-flow"
        viewBox="0 0 800 100"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M -100 50 Q 200 -10 400 40 T 900 50"
          stroke={colorAcento}
          strokeWidth="2"
          fill="none"
          opacity="0.18"
        />
      </svg>

      <svg
        className="absolute top-[42%] left-0 w-full h-40 river-flow"
        viewBox="0 0 800 100"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ animationDelay: '-5s', animationDirection: 'alternate-reverse' }}
      >
        <path
          d="M -100 50 Q 250 10 500 60 T 900 50"
          stroke={colorAcento}
          strokeWidth="3.5"
          fill="none"
          opacity="0.13"
        />
      </svg>

      <svg
        className="absolute bottom-[12%] left-0 w-full h-32 river-flow"
        viewBox="0 0 800 100"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ animationDelay: '-9s', animationDuration: '18s' }}
      >
        <path
          d="M -100 50 Q 300 0 500 50 T 900 60"
          stroke="#C2410C"
          strokeWidth="5"
          fill="none"
          opacity="0.10"
        />
      </svg>

      {/* Wash de acento muy difuso, deriva lentamente */}
      <div
        className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full blur-3xl flow-wash"
        style={{ backgroundColor: colorAcento, opacity: 0.07 }}
      />

      {/* Grain casi imperceptible */}
      <div className="absolute inset-0 bg-grain" style={{ opacity: 0.5 }} />
    </>
  )
}
