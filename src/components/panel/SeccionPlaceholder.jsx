// Placeholder de las secciones del panel mientras no están implementadas.
// La etapa 3b las reemplaza una por una con componentes reales.

export default function SeccionPlaceholder({ titulo }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center">
      <p className="font-serif text-2xl text-ink font-light">{titulo}</p>
      <p className="font-sans text-ink/50 text-sm mt-2">Próximamente.</p>
    </div>
  )
}
