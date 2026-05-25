// Sección Horarios del panel.
// Edita el horario de atención día por día con soporte para horario partido.
// Es la fuente de verdad para el cálculo de disponibilidad del flujo público.

import { useState } from 'react'
import { actualizarNegocio } from '../../services/negocios'
import {
  DIAS_SEMANA,
  normalizarHorarios,
  franjaInvalida,
  franjasSeSolapan,
} from '../../lib/horarios'

export default function SeccionHorarios({ negocio, onNegocioActualizado }) {
  // Estado siempre normalizado. Si el negocio venía con el formato viejo,
  // entra al estado ya migrado y se guarda en formato nuevo al primer save.
  const [horarios, setHorarios] = useState(() =>
    normalizarHorarios(negocio.horariosAtencion)
  )
  const [estado, setEstado] = useState('idle') // idle | guardando | guardado | error

  function actualizarDia(diaKey, parciales) {
    setHorarios((h) => ({
      ...h,
      [diaKey]: { ...h[diaKey], ...parciales },
    }))
    if (estado === 'guardado' || estado === 'error') setEstado('idle')
  }

  function alternarAbierto(diaKey) {
    const dia = horarios[diaKey]
    const seraAbierto = !dia.abierto
    // Al abrir un día sin franjas, sembramos una franja default razonable
    // para que el dueño no tenga que tocar dos botones.
    actualizarDia(diaKey, {
      abierto: seraAbierto,
      franjas: seraAbierto && dia.franjas.length === 0
        ? [{ horaInicio: '09:00', horaFin: '18:00' }]
        : dia.franjas,
    })
  }

  function agregarFranja(diaKey) {
    actualizarDia(diaKey, {
      franjas: [...horarios[diaKey].franjas, { horaInicio: '', horaFin: '' }],
    })
  }

  function quitarFranja(diaKey, idx) {
    actualizarDia(diaKey, {
      franjas: horarios[diaKey].franjas.filter((_, i) => i !== idx),
    })
  }

  function setFranja(diaKey, idx, parciales) {
    actualizarDia(diaKey, {
      franjas: horarios[diaKey].franjas.map((f, i) =>
        i === idx ? { ...f, ...parciales } : f
      ),
    })
  }

  // Mapa de errores por día. Lo recalculamos en cada render.
  const errores = calcularErrores(horarios)
  const hayErrores = Object.keys(errores).length > 0

  async function guardar() {
    if (hayErrores || estado === 'guardando') return
    setEstado('guardando')
    try {
      await actualizarNegocio(negocio.id, { horariosAtencion: horarios })
      onNegocioActualizado?.({ horariosAtencion: horarios })
      setEstado('guardado')
      setTimeout(() => {
        setEstado((s) => (s === 'guardado' ? 'idle' : s))
      }, 2500)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setEstado('error')
    }
  }

  return (
    <div className="space-y-3">
      {DIAS_SEMANA.map(({ key, label }) => (
        <FilaDia
          key={key}
          label={label}
          dia={horarios[key]}
          errores={errores[key]}
          onAlternar={() => alternarAbierto(key)}
          onAgregarFranja={() => agregarFranja(key)}
          onQuitarFranja={(idx) => quitarFranja(key, idx)}
          onSetFranja={(idx, parciales) => setFranja(key, idx, parciales)}
        />
      ))}

      <div className="flex flex-wrap items-center gap-4 pt-4">
        <button
          type="button"
          disabled={hayErrores || estado === 'guardando'}
          onClick={guardar}
          className="rounded-full bg-teal text-paper px-6 py-3 font-sans text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {estado === 'guardando' ? 'Guardando…' : 'Guardar horarios'}
        </button>
        {estado === 'guardado' && (
          <span className="font-sans text-teal text-sm">¡Listo, guardado!</span>
        )}
        {estado === 'error' && (
          <span className="font-sans text-copper text-sm">
            Algo falló. Intentá de nuevo.
          </span>
        )}
        {hayErrores && estado !== 'error' && (
          <span className="font-sans text-copper text-sm">
            Revisá los días marcados antes de guardar.
          </span>
        )}
      </div>
    </div>
  )
}

function calcularErrores(horarios) {
  const errs = {}
  for (const { key } of DIAS_SEMANA) {
    const dia = horarios[key]
    if (!dia.abierto) continue
    if (dia.franjas.length === 0) {
      errs[key] = { dia: 'Día abierto pero sin franjas.' }
      continue
    }
    const erroresFranjas = dia.franjas.map((f) => franjaInvalida(f))
    const algunaInvalida = erroresFranjas.some((e) => e !== null)
    if (algunaInvalida) {
      errs[key] = { franjas: erroresFranjas }
      continue
    }
    if (franjasSeSolapan(dia.franjas)) {
      errs[key] = { dia: 'Las franjas se solapan entre sí.' }
    }
  }
  return errs
}

function FilaDia({
  label,
  dia,
  errores,
  onAlternar,
  onAgregarFranja,
  onQuitarFranja,
  onSetFranja,
}) {
  const tieneError = !!errores
  return (
    <article
      className={`rounded-2xl border bg-white p-5 transition ${
        tieneError ? 'border-copper/40' : 'border-ink/10'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-serif text-lg text-ink font-light">{label}</h3>
        <button
          type="button"
          onClick={onAlternar}
          aria-pressed={dia.abierto}
          className={`rounded-full px-4 py-1.5 font-sans text-sm transition ${
            dia.abierto
              ? 'bg-teal text-paper hover:opacity-90'
              : 'bg-ink/10 text-ink/60 hover:bg-ink/15'
          }`}
        >
          {dia.abierto ? 'Abierto' : 'Cerrado'}
        </button>
      </div>

      {dia.abierto && (
        <div className="mt-4 space-y-3">
          {dia.franjas.map((f, idx) => {
            const errorFranja = errores?.franjas?.[idx]
            return (
              <div key={idx}>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="time"
                    value={f.horaInicio || ''}
                    onChange={(e) =>
                      onSetFranja(idx, { horaInicio: e.target.value })
                    }
                    className="rounded-xl border border-ink/15 bg-white px-3 py-2 font-sans text-ink text-sm focus:outline-none focus:border-ink/40"
                  />
                  <span className="font-sans text-ink/50 text-sm">a</span>
                  <input
                    type="time"
                    value={f.horaFin || ''}
                    onChange={(e) =>
                      onSetFranja(idx, { horaFin: e.target.value })
                    }
                    className="rounded-xl border border-ink/15 bg-white px-3 py-2 font-sans text-ink text-sm focus:outline-none focus:border-ink/40"
                  />
                  {dia.franjas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onQuitarFranja(idx)}
                      aria-label="Quitar franja"
                      className="rounded-full border border-ink/15 w-8 h-8 font-sans text-base text-ink/70 hover:bg-ink/5 inline-flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>
                {errorFranja && (
                  <p className="font-sans text-copper text-xs mt-1">{errorFranja}</p>
                )}
              </div>
            )
          })}

          {errores?.dia && (
            <p className="font-sans text-copper text-xs">{errores.dia}</p>
          )}

          <button
            type="button"
            onClick={onAgregarFranja}
            className="font-sans text-sm text-teal hover:underline"
          >
            + agregar franja
          </button>
        </div>
      )}
    </article>
  )
}
