// Formulario de solicitud de alta. Lo muestra PlanesPage después de elegir un plan.
// Recolecta datos del negocio + dueño, exige subir un comprobante de la
// transferencia, y crea el documento en `solicitudes` al enviar.

import { useState } from 'react'
import { RUBROS } from '../../lib/rubros'
import { ALIAS_RIOTECH } from '../../lib/admins'
import { limpiarSlug, slugFormatoValido, SLUG_MIN, SLUG_MAX } from '../../lib/slug'
import { formatearPrecio } from '../../lib/formato'
import { slugExiste } from '../../services/negocios'
import { crearSolicitud } from '../../services/solicitudes'

import CampoTexto from '../panel/CampoTexto'
import SubidorComprobante from './SubidorComprobante'

export default function FormSolicitud({ plan, onVolver, onEnviada }) {
  const [form, setForm] = useState({
    nombreNegocio: '',
    slug: '',
    rubro: 'peluqueria',
    nombreDueno: '',
    email: '',
    whatsapp: '',
  })
  const [slugEstado, setSlugEstado] = useState('idle')
  const [comprobante, setComprobante] = useState(null) // {url, path} | null
  const [aliasCopiado, setAliasCopiado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }
  function setSlug(valor) {
    set('slug', limpiarSlug(valor))
    setSlugEstado('idle')
  }

  async function verificarSlug() {
    if (!form.slug) return setSlugEstado('idle')
    if (!slugFormatoValido(form.slug)) return setSlugEstado('invalido')
    setSlugEstado('verificando')
    try {
      const existe = await slugExiste(form.slug)
      setSlugEstado(existe ? 'ocupado' : 'libre')
    } catch {
      setSlugEstado('idle')
    }
  }

  async function copiarAlias() {
    try {
      await navigator.clipboard.writeText(ALIAS_RIOTECH)
      setAliasCopiado(true)
      setTimeout(() => setAliasCopiado(false), 1800)
    } catch {
      /* navegador sin clipboard API */
    }
  }

  const nombreNegocioOk = form.nombreNegocio.trim().length >= 2
  const slugOk = slugEstado === 'libre'
  const nombreDuenoOk = form.nombreDueno.trim().length >= 2
  const emailOk = /^\S+@\S+\.\S+$/.test(form.email.trim())
  const whatsappOk = form.whatsapp.trim().replace(/\D/g, '').length >= 6
  const comprobanteOk = !!comprobante
  const valido =
    nombreNegocioOk && slugOk && nombreDuenoOk && emailOk && whatsappOk && comprobanteOk

  async function submit(e) {
    e.preventDefault()
    if (!valido || enviando) return
    setEnviando(true)
    setError(null)
    try {
      const emailLimpio = form.email.trim().toLowerCase()
      const id = await crearSolicitud({
        nombreNegocio: form.nombreNegocio.trim(),
        slug: form.slug,
        rubro: form.rubro,
        nombreDueno: form.nombreDueno.trim(),
        email: emailLimpio,
        whatsapp: form.whatsapp.trim(),
        planKey: plan.key,
        monto: plan.precio,
        urlComprobante: comprobante.url,
        pathComprobante: comprobante.path,
      })
      onEnviada?.({ id, email: emailLimpio })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError('No pudimos enviar la solicitud. Probá de nuevo en un momento.')
      setEnviando(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onVolver}
        className="font-sans text-sm text-ink/60 hover:text-ink mb-6"
      >
        ← Volver a los planes
      </button>

      <header className="mb-8">
        <p className="font-sans text-copper text-xs uppercase tracking-widest">
          Plan {plan.nombre}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink font-light mt-2">
          Activá tu cuenta
        </h1>
        <p className="font-sans text-ink/60 text-sm mt-2">
          Completá los datos, transferí la primera mensualidad y subí el comprobante.
          En cuanto verifiquemos, activamos tu Río Turnos.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-6">
        {/* Datos del negocio */}
        <Tarjeta titulo="Datos del negocio">
          <CampoTexto
            label="Nombre del negocio"
            value={form.nombreNegocio}
            onChange={(v) => set('nombreNegocio', v)}
            required
            placeholder="Estudio Bilardo"
          />

          <div>
            <CampoTexto
              label="Slug (URL)"
              value={form.slug}
              onChange={setSlug}
              required
              placeholder="estudio-bilardo"
              hint={`Tu negocio va a vivir en rioturnos.com/${form.slug || 'tu-slug'}. Lowercase, sin espacios.`}
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={verificarSlug}
                disabled={!form.slug || slugEstado === 'verificando'}
                className="rounded-full border border-ink/15 px-3 py-1 font-sans text-xs text-ink hover:bg-ink/5 disabled:opacity-40"
              >
                Verificar disponibilidad
              </button>
              {slugEstado === 'verificando' && (
                <span className="font-sans text-xs text-ink/60">Verificando…</span>
              )}
              {slugEstado === 'libre' && (
                <span className="font-sans text-xs text-teal">Disponible ✓</span>
              )}
              {slugEstado === 'ocupado' && (
                <span className="font-sans text-xs text-copper">Ya está ocupado</span>
              )}
              {slugEstado === 'invalido' && (
                <span className="font-sans text-xs text-copper">
                  Solo letras, números y guiones ({SLUG_MIN}–{SLUG_MAX} chars)
                </span>
              )}
            </div>
          </div>

          <label className="block">
            <span className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-1.5">
              Rubro
            </span>
            <select
              value={form.rubro}
              onChange={(e) => set('rubro', e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-ink focus:outline-none focus:border-ink/40 transition"
            >
              {Object.entries(RUBROS).map(([key, r]) => (
                <option key={key} value={key}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </label>
        </Tarjeta>

        {/* Tus datos */}
        <Tarjeta titulo="Tus datos">
          <CampoTexto
            label="Tu nombre"
            value={form.nombreDueno}
            onChange={(v) => set('nombreDueno', v)}
            required
            placeholder="Joe Pérez"
          />
          <CampoTexto
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => set('email', v)}
            required
            error={form.email && !emailOk ? 'Email inválido.' : null}
            placeholder="joe@ejemplo.com"
            hint="Este email es el que vas a usar para loguearte con Google al panel."
          />
          <CampoTexto
            label="WhatsApp"
            type="tel"
            value={form.whatsapp}
            onChange={(v) => set('whatsapp', v)}
            required
            placeholder="3411234567"
            hint="Para avisarte cuando activemos tu cuenta."
          />
        </Tarjeta>

        {/* Pago */}
        <Tarjeta titulo="Pago de la primera mensualidad">
          <div
            className="rounded-2xl p-5 text-paper text-center"
            style={{ backgroundColor: '#0B6E6E' }}
          >
            <p className="font-sans text-paper/80 text-xs uppercase tracking-widest">
              A transferir
            </p>
            <p className="font-serif text-4xl sm:text-5xl font-light mt-1">
              {formatearPrecio(plan.precio)}
            </p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-paper p-4">
            <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
              Alias de Río Tech
            </p>
            <p className="font-serif text-xl text-ink font-light mt-1 break-all">
              {ALIAS_RIOTECH}
            </p>
            <button
              type="button"
              onClick={copiarAlias}
              className="mt-3 rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5 transition"
            >
              {aliasCopiado ? '¡Copiado!' : 'Copiar alias'}
            </button>
          </div>

          <div>
            <p className="font-sans text-ink/60 text-xs uppercase tracking-wider mb-2">
              Comprobante de la transferencia
            </p>
            <SubidorComprobante onSubido={setComprobante} />
          </div>
        </Tarjeta>

        {error && <p className="font-sans text-copper text-sm">{error}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={!valido || enviando}
            className="w-full rounded-full bg-teal text-paper px-6 py-4 font-sans text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {enviando ? 'Enviando solicitud…' : 'Enviar solicitud'}
          </button>
          {!comprobanteOk && (
            <p className="font-sans text-ink/50 text-xs mt-2 text-center">
              Subí el comprobante para poder enviar.
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

function Tarjeta({ titulo, children }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 space-y-4">
      <h3 className="font-serif text-xl text-ink font-light">{titulo}</h3>
      {children}
    </section>
  )
}
