// Encabezado de cada paso (título + subtítulo opcional).
// Usa clases t-* del sistema de tema → cambia color automáticamente entre
// tema claro y oscuro.

export default function StepHeader({ titulo, subtitulo }) {
  return (
    <header className="mb-10">
      <h2 className="display-mono t-strong text-[2.5rem] sm:text-[3.25rem]">
        {titulo}
      </h2>
      {subtitulo && (
        <p className="font-sans t-soft text-[15px] sm:text-base mt-3 max-w-sm leading-relaxed">
          {subtitulo}
        </p>
      )}
    </header>
  )
}
