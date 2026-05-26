// Pestaña Ayuda del panel del dueño.
// Estática (no toca Firestore). Dos bloques:
//   1. Contacto directo (WhatsApp + mail), con datos prearmados.
//   2. FAQ en acordeón nativo (<details>/<summary>), accesible y mobile-first.
//
// Las preguntas/respuestas viven en src/lib/ayudaFAQ.js — único lugar a editar.

import { WHATSAPP_RIOTECH, EMAIL_RIOTECH } from '../../lib/admins'
import { FAQ } from '../../lib/ayudaFAQ'

export default function SeccionAyuda({ negocio }) {
  const nombre = negocio?.nombre || 'mi negocio'

  // Mensaje prearmado. Termina en " con " sin cerrar para que el dueño
  // complete con su pregunta puntual.
  const mensajeWA = `Hola Río Tech, soy ${nombre} y necesito una mano con `
  const urlWhatsapp = `https://wa.me/${WHATSAPP_RIOTECH}?text=${encodeURIComponent(mensajeWA)}`

  const asuntoMail = `Soporte Río Turnos · ${nombre}`
  const urlMail = `mailto:${EMAIL_RIOTECH}?subject=${encodeURIComponent(asuntoMail)}`

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-serif text-2xl text-ink font-light">Ayuda</h2>
        <p className="font-sans text-ink/50 text-sm mt-1">
          Si algo no te queda claro, escribinos directo. Te respondemos rápido.
        </p>
      </header>

      {/* Contacto directo */}
      <section className="rounded-2xl border border-teal/30 bg-teal/5 p-6 sm:p-8">
        <h3 className="font-serif text-xl text-ink font-light">
          ¿Necesitás una mano?
        </h3>
        <p className="font-sans text-ink/70 text-sm mt-2 max-w-md">
          Estamos del otro lado. El soporte directo de Río Tech es parte de lo
          que ofrecemos — no es un formulario, te respondemos nosotros.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={urlWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-teal text-paper px-5 py-3 font-sans text-sm font-medium hover:opacity-90 transition"
          >
            <IconoWhatsapp />
            Escribinos por WhatsApp
          </a>
          <a
            href={urlMail}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-3 font-sans text-sm text-ink hover:bg-ink/5 transition"
          >
            <IconoMail />
            Escribir un mail
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h3 className="font-serif text-xl text-ink font-light mb-4">
          Preguntas frecuentes
        </h3>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <Acordeon key={i} pregunta={item.pregunta} respuesta={item.respuesta} />
          ))}
        </div>
      </section>
    </div>
  )
}

// Acordeón con <details>/<summary> nativos. Sin JS de estado:
// el navegador maneja open/closed, accesibilidad y teclado.
function Acordeon({ pregunta, respuesta }) {
  return (
    <details className="group rounded-2xl border border-ink/10 bg-white open:bg-white">
      <summary
        className="cursor-pointer select-none p-5 flex items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden"
      >
        <span className="font-sans text-ink font-medium">{pregunta}</span>
        <svg
          className="w-5 h-5 flex-shrink-0 text-ink/40 transition-transform duration-200 group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="px-5 pb-5 pt-0 border-t border-ink/5 space-y-3 mt-1">
        {respuesta.split('\n\n').map((parrafo, i) => (
          <p
            key={i}
            className="font-sans text-ink/70 text-sm leading-relaxed first:mt-3"
          >
            {parrafo.trim()}
          </p>
        ))}
      </div>
    </details>
  )
}

// ─── Iconos inline ───────────────────────────────────────────────────

function IconoWhatsapp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  )
}

function IconoMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
