// Fondo atmosférico de la pantalla de reserva.
// Tres capas: grain (textura papel) + curvas decorativas del río + wash
// coloreado que se mueve lento. Todo pointer-events: none, decorativo.

export default function FondoAtmosfera({ colorAcento }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Capa 1: grain (textura granular) */}
      <div className="absolute inset-0 bg-grain" />

      {/* Capa 2: curvas SVG del río, arriba a la derecha — flow drift lento */}
      <svg
        className="absolute -top-32 -right-40 w-[40rem] h-[40rem] opacity-[0.05] flow-wash"
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 50,80 Q 150,40 200,120 T 350,180"
          stroke={colorAcento}
          strokeWidth="90"
          strokeLinecap="round"
        />
        <path
          d="M 30,200 Q 130,160 200,240 T 370,300"
          stroke={colorAcento}
          strokeWidth="70"
          strokeLinecap="round"
        />
      </svg>

      {/* Capa 3: wash difuso abajo izquierda, mismo drift desfasado */}
      <div
        className="absolute -bottom-48 -left-20 w-[28rem] h-[28rem] rounded-full opacity-[0.07] blur-3xl flow-wash"
        style={{
          backgroundColor: colorAcento,
          animationDelay: '-12s',
        }}
      />
    </div>
  )
}
