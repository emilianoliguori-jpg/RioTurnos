// Paso 1: elegir servicio.
// El título viene del diccionario de rubro del negocio.

import StepHeader from './StepHeader'

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precio)
}

export default function Step1Servicio({ pregunta, servicios, onElegir, colorAcento }) {
  return (
    <section>
      <StepHeader titulo={pregunta} />

      <ul className="space-y-3">
        {servicios.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onElegir(s)}
              className="w-full text-left rounded-2xl border border-ink/10 bg-white hover:border-ink/30 transition px-5 py-4"
              style={{ '--hover': colorAcento }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="font-sans text-ink font-medium">{s.nombre}</p>
                  <p className="font-sans text-ink/50 text-sm mt-0.5">
                    {s.duracionMinutos} min
                  </p>
                </div>
                <p
                  className="font-sans font-medium"
                  style={{ color: colorAcento }}
                >
                  {formatearPrecio(s.precio)}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
