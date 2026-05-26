// Pantalla final — momento editorial.
// Layout propio centrado: "¡Listo!" o "Reserva en revisión" monumental,
// datos como receipt con líneas finas. Todo theme-aware (.t-*).

import { formatearPrecio } from '../../lib/formato'

export default function Step5Confirmacion({ negocio, resumen, colorAcento }) {
  const pendiente = resumen.estado === 'pendiente_pago'

  return (
    <section className="text-center pt-4">
      {/* Línea decorativa arriba — usa currentColor → cambia con el tema */}
      <div className="editorial-divider mx-auto w-24 mb-10 t-strong reveal-up" />

      <p className="eyebrow t-soft reveal-up">
        {pendiente ? 'Reserva en revisión' : 'Confirmado'}
      </p>

      <h1 className="display-mono t-strong mt-5 text-[3.5rem] sm:text-[5rem] reveal-up delay-1">
        {pendiente ? (
          <>
            Tomada<br />
            <em
              className="italic font-light"
              style={{ color: colorAcento }}
            >
              esperando pago
            </em>
          </>
        ) : (
          <>¡Listo!</>
        )}
      </h1>

      <p className="font-sans t-body text-base sm:text-lg mt-7 max-w-sm mx-auto leading-relaxed reveal-up delay-2">
        {pendiente
          ? `Tu lugar quedó tomado. ${negocio.nombre} confirma tu pago en breve y te avisamos.`
          : `Te esperamos en ${negocio.nombre}.`}
      </p>

      {/* Receipt editorial */}
      <dl className="mt-12 max-w-sm mx-auto text-left space-y-5 reveal-up delay-3">
        <Fila etiqueta="Servicio" valor={resumen.servicioNombre} />
        <Fila etiqueta="Atiende" valor={resumen.profesionalNombre || 'Primero disponible'} />
        <Fila etiqueta="Día" valor={resumen.fecha} />
        <Fila
          etiqueta="Hora"
          valor={resumen.hora}
          monumental
          colorAcento={colorAcento}
        />
        {negocio.direccion && <Fila etiqueta="Dónde" valor={negocio.direccion} />}
        {resumen.montoCobrado != null && (
          <Fila
            etiqueta={resumen.tipoCobroAplicado === 'total' ? 'Pago (total)' : 'Seña'}
            valor={formatearPrecio(resumen.montoCobrado)}
          />
        )}
      </dl>

      <p className="font-sans t-soft text-sm mt-12 reveal-up delay-4">
        {pendiente
          ? 'Si todavía no enviaste el comprobante, hacelo por WhatsApp así verificamos rápido.'
          : 'Si necesitás cancelar o reprogramar, escribinos por WhatsApp.'}
      </p>
    </section>
  )
}

function Fila({ etiqueta, valor, monumental = false, colorAcento }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b t-border pb-4">
      <dt className="eyebrow t-soft flex-shrink-0">{etiqueta}</dt>
      <dd
        className={
          monumental
            ? 'display-mono text-3xl sm:text-4xl text-right'
            : 'font-sans t-body text-right'
        }
        style={monumental ? { color: colorAcento } : {}}
      >
        {valor}
      </dd>
    </div>
  )
}
