// Pantalla final del flujo público. Refleja el estado del turno:
// - 'confirmado': ¡todo listo!
// - 'pendiente_pago': reservado, esperando que el negocio confirme el pago.

import StepHeader from './StepHeader'
import { formatearPrecio } from '../../lib/formato'

export default function Step5Confirmacion({ negocio, resumen, colorAcento }) {
  const pendiente = resumen.estado === 'pendiente_pago'

  return (
    <section>
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto"
        style={{ backgroundColor: colorAcento }}
      >
        {pendiente ? <IconoReloj /> : <IconoTilde />}
      </div>

      <StepHeader
        titulo={pendiente ? 'Reserva tomada, esperando pago' : '¡Turno confirmado!'}
        subtitulo={
          pendiente
            ? `Tu lugar quedó reservado. En cuanto ${negocio.nombre} confirme el pago, te avisamos.`
            : `Te esperamos en ${negocio.nombre}.`
        }
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
        {resumen.montoCobrado != null && (
          <Fila
            etiqueta={resumen.tipoCobroAplicado === 'total' ? 'Pago (total)' : 'Pago (seña)'}
            valor={formatearPrecio(resumen.montoCobrado)}
          />
        )}
      </dl>

      <p className="font-sans text-ink/60 text-sm mt-6 text-center">
        {pendiente
          ? 'Si todavía no enviaste el comprobante, hacelo por WhatsApp así verificamos rápido.'
          : 'Si necesitás cancelar o reprogramar, escribinos por WhatsApp.'}
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

function IconoTilde() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5F1EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconoReloj() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5F1EA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  )
}
