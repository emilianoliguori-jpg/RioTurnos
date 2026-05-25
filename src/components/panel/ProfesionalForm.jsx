// Formulario inline para crear o editar un profesional.

import { useState } from 'react'
import CampoTexto from './CampoTexto'

const VACIO = { nombre: '', activo: true }

export default function ProfesionalForm({
  valorInicial = null,
  onGuardar,
  onCancelar,
  etiquetaProfesional = 'profesional',
}) {
  const [form, setForm] = useState(valorInicial || VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const nombreVacio = !String(form.nombre || '').trim()
  const valido = !nombreVacio

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function submit(e) {
    e.preventDefault()
    if (!valido || guardando) return
    setGuardando(true)
    setError(null)
    try {
      await onGuardar({
        nombre: String(form.nombre).trim(),
        activo: Boolean(form.activo),
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError('No pudimos guardar. Probá de nuevo.')
      setGuardando(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-ink/15 bg-white p-5 space-y-4"
    >
      <CampoTexto
        label={`Nombre del ${etiquetaProfesional}`}
        value={form.nombre}
        onChange={(v) => set('nombre', v)}
        required
        error={nombreVacio ? 'Obligatorio.' : null}
        placeholder="Ej: Lucía"
      />

      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(form.activo)}
          onChange={(e) => set('activo', e.target.checked)}
          className="w-4 h-4 accent-teal"
        />
        <span className="font-sans text-sm text-ink">
          Activo (disponible para reservas)
        </span>
      </label>

      {error && (
        <p className="font-sans text-copper text-sm">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!valido || guardando}
          className="rounded-full bg-teal text-paper px-5 py-2.5 font-sans text-sm font-medium hover:opacity-90 disabled:opacity-40"
        >
          {guardando ? 'Guardando…' : 'Guardar'}
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
