// Encabezado de cada paso: título grande en Fraunces.
// El subtítulo es opcional.

export default function StepHeader({ titulo, subtitulo }) {
  return (
    <header className="mb-8">
      <h2 className="font-serif text-3xl sm:text-4xl text-ink font-light tracking-tight">
        {titulo}
      </h2>
      {subtitulo && (
        <p className="font-sans text-ink/60 text-sm mt-2">{subtitulo}</p>
      )}
    </header>
  )
}
