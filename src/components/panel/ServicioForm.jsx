// Formulario inline para crear o editar un servicio.
// Modo crear: se invoca con valorInicial = null.
// Modo editar: se invoca con valorInicial = { id, nombre, duracionMinutos, ... }.

import { useState } from 'react'
import CampoTexto from './CampoTexto'
import { ICONOS_SERVICIO, ICONO_DEFAULT_ID } from '../../lib/iconosServicio'

const VACIO = {
  nombre: '',
  duracionMinutos: 30,
  precio: 0,
  activo: true,
  icono: ICONO_DEFAULT_ID,
}

export default function ServicioForm({
  valorInicial = null,
  onGuardar,   // (datos) => Promise
  onCancelar,
  etiquetaServicio = 'servicio',
}) {
  // Merge con VACIO para que servicios legacy (sin campo 'icono') tomen el
  // default sin pisar el resto de los campos guardados.
  const [form, setForm] = useState(
    valorInicial ? { ...VACIO, ...valorInicial } : VACIO
  )
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
        icono:           form.icono || ICONO_DEFAULT_ID,
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

      <div>
        <p className="font-sans text-sm text-ink/70 mb-2">Icono</p>
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {ICONOS_SERVICIO.map(({ id, label, Icon }) => {
            const seleccionado = form.icono === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => set('icono', id)}
                title={label}
                aria-label={label}
                aria-pressed={seleccionado}
                className={[
                  'aspect-square rounded-xl border flex items-center justify-center transition-colors',
                  seleccionado
                    ? 'bg-teal border-teal text-paper shadow-sm'
                    : 'bg-white border-ink/15 text-ink/60 hover:bg-ink/5 hover:border-ink/30 hover:text-ink',
                ].join(' ')}
              >
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              </button>
            )
          })}
        </div>
        <p className="font-sans text-xs text-ink/50 mt-2">
          Aparece en la pantalla de reservas, al lado del nombre del {etiquetaServicio}.
        </p>
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
