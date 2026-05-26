// Indicador editorial de progreso: "Paso 01 / 06" en eyebrow + línea fina
// que crece según el paso. Reemplaza los dots tradicionales.
// Texto y barra adaptados al tema (claras sobre oscuro).

export default function StepProgress({ paso, total = 5, colorAcento }) {
  const pct = Math.max(0, Math.min(100, (paso / total) * 100))
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <span className="eyebrow t-soft">
          Paso {String(paso).padStart(2, '0')}{' '}
          <span className="opacity-50 mx-1">/</span>{' '}
          {String(total).padStart(2, '0')}
        </span>
      </div>
      <div className="relative h-px t-bg-border">
        <div
          className="absolute left-0 top-0 h-px transition-[width] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${pct}%`, backgroundColor: colorAcento }}
        />
      </div>
    </div>
  )
}
