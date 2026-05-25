// Alta manual de negocio desde el admin.
// Reemplaza el "truco del seed": ahora se crea desde acá un negocio con
// defaults sensatos, vinculado a un email. Cuando ese email se loguee,
// el sistema auto-vincula via vincularPorEmail.

import { useState } from 'react'
import { RUBROS } from '../../lib/rubros'
import { PLANES } from '../../lib/planes'
import { NEGOCIO_DEFAULTS } from '../../lib/negocioDefaults'
import { crearNegocio, slugExiste } from '../../services/negocios'
import { limpiarSlug, slugFormatoValido, SLUG_MIN, SLUG_MAX } from '../../lib/slug'

import CampoTexto from '../panel/CampoTexto'

export default function FormCrearNegocio({ onCreado, onCancelar }) {
  const [form, setForm] = useState({
    nombre: '',
    slug: '',
    rubro: 'peluqueria',
    email: '',
    plan: 'fundador',
  })
  // slug check: 'idle' | 'verificando' | 'libre' | 'ocupado' | 'invalido'
  const [slugEstado, setSlugEstado] = useState('idle')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }
  function setSlug(valor) {
    set('slug', limpiarSlug(valor))
    setSlugEstado('idle')
  }

  async function verificarSlug() {
    if (!form.slug) {
      setSlugEstado('idle')
      return
    }
    if (!slugFormatoValido(form.slug)) {
      setSlugEstado('invalido')
      return
    }
    setSlugEstado('verificando')
    try {
      const existe = await slugExiste(form.slug)
      setSlugEstado(existe ? 'ocupado' : 'libre')
    } catch {
      setSlugEstado('idle')
    }
  }

  const nombreOk = form.nombre.trim().length >= 2
  const emailOk = /^\S+@\S+\.\S+$/.test(form.email.trim())
  const slugOk = slugEstado === 'libre'
  const valido = nombreOk && slugOk && emailOk && form.rubro && form.plan

  async function submit(e) {
    e.preventDefault()
    if (!valido || guardando) return
    setGuardando(true)
    setError(null)
    try {
      await crearNegocio(form.slug, {
        ...NEGOCIO_DEFAULTS,
        nombre: form.nombre.trim(),
        rubro: form.rubro,
        plan: form.plan,
        emailDuenoAutorizado: form.email.trim().toLowerCase(),
      })
      onCreado?.()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError(err.message || 'No pudimos crear el negocio.')
      setGuardando(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-ink/15 bg-white p-5 space-y-4"
    >
      <h3 className="font-serif text-xl text-ink font-light">Crear negocio manualmente</h3>

      <CampoTexto
        label="Nombre del negocio"
        value={form.nombre}
        onChange={(v) => set('nombre', v)}
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
          hint={`Se usa en la URL: /${form.slug || 'tu-slug'}. Lowercase, sin espacios.`}
        />
        {/* Botón verificar disponibilidad — explícito en vez de onBlur por UX
            (el admin entiende qué hace) */}
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
            <span className="font-sans text-xs text-copper">Ya existe</span>
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

      <CampoTexto
        label="Email del dueño"
        type="email"
        value={form.email}
        onChange={(v) => set('email', v)}
        required
        error={form.email && !emailOk ? 'Email inválido.' : null}
        placeholder="dueno@ejemplo.com"
        hint="Cuando este email se loguee con Google, queda vinculado al negocio automáticamente."
      />

      <label className="block">
        <span className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-1.5">
          Plan
        </span>
        <select
          value={form.plan}
          onChange={(e) => set('plan', e.target.value)}
          className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-ink focus:outline-none focus:border-ink/40 transition"
        >
          {Object.values(PLANES).map((p) => (
            <option key={p.key} value={p.key}>
              {p.nombre} {p.precio > 0 ? `· $${p.precio.toLocaleString('es-AR')}/mes` : '· Gratis'}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="font-sans text-copper text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!valido || guardando}
          className="rounded-full bg-teal text-paper px-5 py-2.5 font-sans text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {guardando ? 'Creando…' : 'Crear negocio'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          className="rounded-full border border-ink/15 px-5 py-2.5 font-sans text-sm text-ink hover:bg-ink/5"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
