// Formulario inline para crear o editar un servicio.
// Modo crear: se invoca con valorInicial = null.
// Modo editar: se invoca con valorInicial = { id, nombre, duracionMinutos, ... }.

import { useState } from 'react'
import CampoTexto from './CampoTexto'

const VACIO = { nombre: '', duracionMinutos: 30, precio: 0, activo: true }

export default function ServicioForm({
  valorInicial = null,
  onGuardar,   // (datos) => Promise
  onCancelar,
  etiquetaServicio = 'servicio',
}) {
  const [form, setForm] = useState(valorInicial || VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const nombreVacio = !String(form.nombre || '').trim()
  const duracionInvalida = !Number(form.duracionMinutos) || Number(form.duracionMinutos) < 5
  const precioInvalido = Number(form.precio) < 0 || Number.isNaN(Number(form.precio))
  const valido = !nombreVacio && !duracionInvalida && !precioInvalido

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
        nombre:          String(form.nombre).trim(),
        duracionMinutos: Number(form.duracionMinutos),
        precio:          Number(form.precio),
        activo:          Boolean(form.activo),
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
        label={`Nombre del ${etiquetaServicio}`}
        value={form.nombre}
        onChange={(v) => set('nombre', v)}
        required
        error={nombreVacio ? 'Obligatorio.' : null}
        placeholder="Ej: Corte mujer"
      />
      <div className="grid grid-cols-2 gap-3">
        <CampoTexto
          label="Duración (min)"
          type="number"
          min={5}
          step={5}
          value={form.duracionMinutos}
          onChange={(v) => set('duracionMinutos', v)}
          error={duracionInvalida ? 'Mínimo 5.' : null}
        />
        <CampoTexto
          label="Precio (ARS)"
          type="number"
          min={0}
          step={500}
          value={form.precio}
          onChange={(v) => set('precio', v)}
          error={precioInvalido ? 'Inválido.' : null}
        />
      </div>

      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(form.activo)}
          onChange={(e) => set('activo', e.target.checked)}
          className="w-4 h-4 accent-teal"
        />
        <span className="font-sans text-sm text-ink">Activo (visible para reservas)</span>
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
