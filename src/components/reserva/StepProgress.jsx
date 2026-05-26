// Indicador editorial de progreso: "01 / 05" en eyebrow + línea fina que
// crece de izq a der según el paso actual. Reemplaza los dots tradicionales.

export default function StepProgress({ paso, total = 5, colorAcento }) {
  const pct = Math.max(0, Math.min(100, (paso / total) * 100))
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2.5">
        <span className="eyebrow text-ink/45">
          Paso {String(paso).padStart(2, '0')} <span className="opacity-50 mx-1">/</span> {String(total).padStart(2, '0')}
        </span>
      </div>
      <div className="relative h-px bg-ink/10">
        <div
          className="absolute left-0 top-0 h-px transition-[width] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${pct}%`, backgroundColor: colorAcento }}
        />
      </div>
    </div>
  )
}
