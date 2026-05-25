// Paso 5: confirmación. El turno ya fue creado en Firestore antes de llegar acá.

import StepHeader from './StepHeader'

export default function Step5Confirmacion({ negocio, resumen, colorAcento }) {
  return (
    <section>
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto"
        style={{ backgroundColor: colorAcento }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F5F1EA"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <StepHeader
        titulo="¡Turno confirmado!"
        subtitulo={`Te esperamos en ${negocio.nombre}.`}
      />

      <dl className="rounded-2xl border border-ink/10 bg-white divide-y divide-ink/10">
        <Fila etiqueta="Servicio" valor={resumen.servicioNombre} />
        <Fila
          etiqueta="Atiende"
          valor={resumen.profesionalNombre || 'Primero disponible'}
        />
        <Fila etiqueta="Día" valor={resumen.fecha} />
        <Fila etiqueta="Hora" valor={resumen.hora} />
        {negocio.direccion && (
          <Fila etiqueta="Dónde" valor={negocio.direccion} />
        )}
      </dl>

      <p className="font-sans text-ink/60 text-sm mt-6 text-center">
        Si necesitás cancelar o reprogramar, escribinos por WhatsApp.
      </p>
    </section>
  )
}

function Fila({ etiqueta, valor }) {
  return (
    <div className="flex items-baseline justify-between px-5 py-3 gap-4">
      <dt className="font-sans text-ink/50 text-sm">{etiqueta}</dt>
      <dd className="font-sans text-ink font-medium text-right">{valor}</dd>
    </div>
  )
}
