// Paso 2: elegir profesional, o "el primero disponible".

import StepHeader from './StepHeader'

export default function Step2Profesional({
  pregunta,
  profesionales,
  onElegir,
  colorAcento,
  etiquetaCualquiera,
}) {
  return (
    <section>
      <StepHeader titulo={pregunta} />

      <ul className="space-y-3">
        <li>
          <button
            type="button"
            onClick={() => onElegir({ id: null, nombre: etiquetaCualquiera })}
            className="w-full text-left rounded-2xl border-2 border-dashed border-ink/15 bg-white hover:border-ink/30 transition px-5 py-4"
          >
            <p className="font-sans text-ink font-medium">{etiquetaCualquiera}</p>
            <p className="font-sans text-ink/50 text-sm mt-0.5">
              Te asignamos al primero que tenga lugar
            </p>
          </button>
        </li>
        {profesionales.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onElegir(p)}
              className="w-full text-left rounded-2xl border border-ink/10 bg-white hover:border-ink/30 transition px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-paper font-sans font-medium"
                  style={{ backgroundColor: colorAcento }}
                >
                  {p.nombre.charAt(0)}
                </span>
                <p className="font-sans text-ink font-medium">{p.nombre}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
