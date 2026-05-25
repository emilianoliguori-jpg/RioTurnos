// Mini card de métrica. Usada en MetricasDia (panel), MetricasNegocios
// (admin) y SeccionResumen (panel) — extraída acá para una sola fuente de
// estilo.

export default function Metrica({ label, valor, colorValor }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
      <p
        className="font-serif text-2xl font-light leading-none"
        style={{ color: colorValor }}
      >
        {valor}
      </p>
      <p className="font-sans text-ink/50 text-[11px] uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  )
}
