// Pestaña "Mi suscripción" del panel del dueño.
// Muestra plan, estado de pago, próximo vencimiento, y cómo pagar.
// 100% read-only desde la UI. La regla de Firestore además bloquea que un
// dueño se auto-marque como pagado vía DevTools (ver firestore.rules).

import { useState } from 'react'
import { getPlan } from '../../lib/planes'
import { ALIAS_RIOTECH, WHATSAPP_RIOTECH } from '../../lib/admins'
import { formatearPrecio } from '../../lib/formato'
import {
  calcularEstadoSuscripcion,
  proximoVencimientoDate,
  etiquetaVencimiento,
} from '../../lib/suscripcion'

export default function SeccionSuscripcion({ negocio }) {
  const plan = getPlan(negocio.plan)
  const esFundador = plan?.key === 'fundador'

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-serif text-2xl text-ink font-light">Mi suscripción</h2>
        <p className="font-sans text-ink/50 text-sm mt-1">
          Tu plan con Río Tech y estado de pago.
        </p>
      </header>

      {!plan && <SinPlan />}
      {plan && esFundador && <CardFundador />}
      {plan && !esFundador && <PlanPago negocio={negocio} plan={plan} />}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Plan pago: card de plan + card de estado + (opcional) card de pago
// ──────────────────────────────────────────────────────────────────────

function PlanPago({ negocio, plan }) {
  const estado = calcularEstadoSuscripcion(negocio, plan)
  const venc = proximoVencimientoDate(negocio)
  const necesitaPagar = estado === 'pendiente' || estado === 'vencido'

  return (
    <>
      <CardPlan plan={plan} />
      <CardEstado estado={estado} vencimiento={venc} />
      {necesitaPagar && <CardComoPagar negocio={negocio} plan={plan} />}
    </>
  )
}

function CardPlan({ plan }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
      <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
        Plan actual
      </p>
      <h3 className="font-serif text-2xl text-ink font-light mt-1">
        {plan.nombre}
      </h3>
      <p className="font-sans text-ink text-lg mt-2">
        {formatearPrecio(plan.precio)}
        <span className="text-ink/50 text-sm"> / mes</span>
      </p>
      {plan.bajada && (
        <p className="font-sans text-ink/60 text-sm mt-2">{plan.bajada}</p>
      )}
    </section>
  )
}

function CardEstado({ estado, vencimiento }) {
  if (estado === 'al-dia') {
    return (
      <SeccionEstado
        variante="teal"
        icono={<IconoTilde />}
        etiqueta="Al día"
        titulo="Pagaste este mes"
      >
        <p>
          Próximo vencimiento:{' '}
          <strong className="text-ink">{etiquetaVencimiento(vencimiento)}</strong>.
        </p>
      </SeccionEstado>
    )
  }

  if (estado === 'vencido') {
    return (
      <SeccionEstado
        variante="copperFuerte"
        icono={<IconoAlerta />}
        etiqueta="Vencido"
        titulo="Tu pago está vencido"
      >
        <p>
          Venció el {etiquetaVencimiento(vencimiento)}. Si ya pagaste,
          avisame por WhatsApp para verificar.
        </p>
      </SeccionEstado>
    )
  }

  // pendiente
  return (
    <SeccionEstado
      variante="copper"
      icono={<IconoReloj />}
      etiqueta="Pendiente"
      titulo="Pago pendiente este mes"
    >
      <p>
        Tu próximo pago vence el{' '}
        <strong className="text-ink">{etiquetaVencimiento(vencimiento)}</strong>.
      </p>
    </SeccionEstado>
  )
}

function SeccionEstado({ variante, icono, etiqueta, titulo, children }) {
  const estilos = {
    teal:         { card: 'border-teal/30 bg-teal/5',        chip: 'text-teal'   },
    copper:       { card: 'border-copper/30 bg-copper/5',    chip: 'text-copper' },
    copperFuerte: { card: 'border-copper bg-copper/10',      chip: 'text-copper' },
  }[variante]

  return (
    <section className={`rounded-2xl border ${estilos.card} p-5 sm:p-6`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 ${estilos.chip}`}>{icono}</span>
        <div className="min-w-0">
          <p className={`font-sans text-xs uppercase tracking-wider ${estilos.chip}`}>
            {etiqueta}
          </p>
          <h3 className="font-serif text-xl text-ink font-light mt-1">{titulo}</h3>
          <div className="font-sans text-ink/70 text-sm mt-2 space-y-1">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Card cómo pagar
// ──────────────────────────────────────────────────────────────────────

function CardComoPagar({ negocio, plan }) {
  const [aliasCopiado, setAliasCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(ALIAS_RIOTECH)
      setAliasCopiado(true)
      setTimeout(() => setAliasCopiado(false), 1800)
    } catch {
      /* navegador sin clipboard API — el dueño lo copia a mano */
    }
  }

  const mensaje = `Hola, ya transferí mi mensualidad de Río Turnos, negocio ${negocio.nombre}.`
  const whatsappUrl = `https://wa.me/${WHATSAPP_RIOTECH}?text=${encodeURIComponent(mensaje)}`

  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 space-y-5">
      <h3 className="font-serif text-xl text-ink font-light">Cómo pagar</h3>

      {/* Monto a transferir */}
      <div className="rounded-2xl bg-teal text-paper p-5 text-center">
        <p className="font-sans text-paper/80 text-xs uppercase tracking-widest">
          A transferir
        </p>
        <p className="font-serif text-4xl sm:text-5xl font-light mt-1">
          {formatearPrecio(plan.precio)}
        </p>
      </div>

      {/* Alias */}
      <div className="rounded-2xl border border-ink/10 bg-paper p-4">
        <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
          Alias de Río Tech
        </p>
        <p className="font-serif text-xl text-ink font-light mt-1 break-all">
          {ALIAS_RIOTECH}
        </p>
        <button
          type="button"
          onClick={copiar}
          className="mt-3 rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5 transition"
        >
          {aliasCopiado ? '¡Copiado!' : 'Copiar alias'}
        </button>
      </div>

      {/* WhatsApp */}
      <div>
        <p className="font-sans text-ink/70 text-sm mb-3">
          Cuando termines de transferir, avisame por WhatsApp para activar tu pago:
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-teal text-paper px-5 py-3 font-sans text-sm font-medium hover:opacity-90 transition"
        >
          <IconoWhatsapp />
          Mandar WhatsApp
        </a>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Casos especiales
// ──────────────────────────────────────────────────────────────────────

function CardFundador() {
  return (
    <section className="rounded-2xl border border-teal/30 bg-teal/5 p-6 sm:p-8 text-center">
      <p className="font-sans text-teal text-xs uppercase tracking-widest">
        Plan Fundador
      </p>
      <h3 className="font-serif text-3xl text-ink font-light mt-3">
        Acceso gratuito
      </h3>
      <p className="font-sans text-ink/70 text-sm mt-4 max-w-md mx-auto">
        Sos parte del programa fundador de Río Tech. Tu acceso es completo
        y sin costo durante el piloto.
      </p>
      <p className="font-sans text-ink/50 text-xs mt-6">
        Gracias por confiar en nosotros.
      </p>
    </section>
  )
}

function SinPlan() {
  const mensaje = 'Hola, necesito que asignen un plan a mi cuenta de Río Turnos.'
  const whatsappUrl = `https://wa.me/${WHATSAPP_RIOTECH}?text=${encodeURIComponent(mensaje)}`
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
      <h3 className="font-serif text-xl text-ink font-light">Sin plan asignado</h3>
      <p className="font-sans text-ink/60 text-sm mt-2">
        Tu cuenta todavía no tiene un plan vinculado. Contactá a Río Tech para
        que te lo asignen.
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:bg-ink/5 transition"
      >
        <IconoWhatsapp />
        Contactar a Río Tech
      </a>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Iconos
// ──────────────────────────────────────────────────────────────────────

function IconoTilde() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconoReloj() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  )
}

function IconoAlerta() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconoWhatsapp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
    </svg>
  )
}
