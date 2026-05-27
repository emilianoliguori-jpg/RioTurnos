// Bloque "Tu link de reservas" — primera info que ve el dueño al entrar al panel.
//
// Muestra el link público del negocio (rio-turnos.web.app/<slug>), permite
// copiarlo al portapapeles y ofrece un atajo a WhatsApp con un mensaje
// pre-armado. El link es <a target="_blank"> así el dueño puede previsualizar
// cómo lo ve su cliente sin salir del panel.
//
// IMPORTANTE: la URL base está duplicada acá y en functions/email/config.js
// (URL_APP). Si algún día cambia el dominio, actualizar AMBOS lugares.

import { useState } from 'react'
import { Copy, Check, MessageCircle, ExternalLink } from 'lucide-react'

const URL_BASE = 'https://rio-turnos.web.app'

export default function BloqueLinkReservas({ negocio }) {
  const slug = negocio.id // por convención del proyecto, id de doc = slug
  const nombre = negocio.nombre || 'mi negocio'
  const link = `${URL_BASE}/${slug}`

  // Estado del feedback "¡Copiado!" — vuelve a 'idle' después de 2s.
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      // navigator.clipboard puede fallar en contextos no seguros (HTTP) o
      // si el usuario denegó el permiso. Caso muy raro en producción
      // (siempre HTTPS), pero loggeamos por si pasa en dev.
      // eslint-disable-next-line no-console
      console.error('No se pudo copiar el link:', err)
    }
  }

  const mensajeWa = `¡Hola! Ahora podés reservar tu turno en ${nombre} de forma online. Entrá acá: ${link}`
  const urlWa = `https://wa.me/?text=${encodeURIComponent(mensajeWa)}`

  // Mostramos el link sin el "https://" para que entre mejor en mobile y
  // se lea como una URL natural; copiamos/compartimos el link completo.
  const linkVisible = link.replace(/^https:\/\//, '')

  return (
    <section className="rounded-2xl border border-teal/25 bg-teal/5 p-5 sm:p-6">
      <p className="font-sans text-xs uppercase tracking-wider text-teal font-semibold">
        Tu link de reservas
      </p>
      <p className="font-sans text-ink/65 text-sm mt-1">
        Compartilo con tus clientes para que reserven online desde su celular.
      </p>

      {/* Link clickeable — previsualiza cómo lo ve el cliente. */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-2 rounded-xl bg-white border border-ink/10 px-4 py-3 hover:border-teal/40 hover:bg-paper transition-colors group"
      >
        <span className="font-mono text-sm text-ink truncate flex-1">
          {linkVisible}
        </span>
        <ExternalLink
          size={16}
          className="text-ink/40 group-hover:text-teal transition-colors shrink-0"
          aria-hidden="true"
        />
      </a>

      {/* Acciones — apiladas en mobile, lado a lado en desktop. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={copiar}
          aria-live="polite"
          className={[
            'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5',
            'font-sans text-sm font-medium transition-colors',
            copiado
              ? 'bg-teal text-paper border border-teal'
              : 'bg-white text-ink border border-ink/15 hover:bg-ink/5 hover:border-ink/25',
          ].join(' ')}
        >
          {copiado ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Copy size={16} aria-hidden="true" />
          )}
          {copiado ? '¡Copiado!' : 'Copiar link'}
        </button>

        <a
          href={urlWa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-teal text-paper px-4 py-2.5 font-sans text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Compartir por WhatsApp
        </a>
      </div>
    </section>
  )
}
