// Encabezado de cada paso (solo título grande + subtítulo opcional).
// El número del paso vive en StepProgress, no acá — para no duplicar.

export default function StepHeader({ titulo, subtitulo }) {
  return (
    <header className="mb-10">
      <h2 className="display-mono text-ink text-[2.5rem] sm:text-[3.25rem]">
        {titulo}
      </h2>
      {subtitulo && (
        <p className="font-sans text-ink/55 text-[15px] mt-3 max-w-sm leading-relaxed">
          {subtitulo}
        </p>
      )}
    </header>
  )
}
