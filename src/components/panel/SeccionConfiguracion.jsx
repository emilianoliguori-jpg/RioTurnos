// Sección Configuración del panel.
// Edita los datos del negocio: nombre, dirección, contacto, rubro, color,
// alias de pago + config de cobro, texto de bienvenida, logo URL.
//
// Hace UPDATE PARCIAL en Firestore — los campos no presentes (como
// horariosAtencion) quedan intactos.

import { useState } from 'react'
import { actualizarNegocio } from '../../services/negocios'
import { RUBROS } from '../../lib/rubros'

import CampoTexto from './CampoTexto'
import SelectorColor from './SelectorColor'
import ConfigCobro from './ConfigCobro'

const COBRO_DEFAULT = {
  activado: false,
  tipoCobro: 'sena',
  montoSena: 5000,
  pagoObligatorio: true,
}

export default function SeccionConfiguracion({ negocio, onNegocioActualizado }) {
  const [form, setForm] = useState({
    nombre:       negocio.nombre || '',
    direccion:    negocio.direccion || '',
    telefono:     negocio.telefono || '',
    rubro:        negocio.rubro || 'peluqueria',
    colorAcento:  negocio.colorAcento || '#0B6E6E',
    aliasPago:    negocio.aliasPago || '',
    logoUrl:      negocio.logoUrl || '',
    textoBienvenida: negocio.textos?.bienvenida || '',
    cobro:        { ...COBRO_DEFAULT, ...(negocio.cobro || {}) },
  })
  const [estado, setEstado] = useState('idle')

  const nombreVacio = form.nombre.trim().length === 0
  const cobroSinAlias = form.cobro.activado && form.aliasPago.trim().length === 0
  const valido = !nombreVacio && !cobroSinAlias

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
    if (estado === 'guardado' || estado === 'error') setEstado('idle')
  }

  function setCobroParcial(parciales) {
    setForm((f) => ({ ...f, cobro: { ...f.cobro, ...parciales } }))
    if (estado === 'guardado' || estado === 'error') setEstado('idle')
  }

  async function guardar(e) {
    e.preventDefault()
    if (!valido || estado === 'guardando') return
    setEstado('guardando')
    try {
      const parciales = {
        nombre:      form.nombre.trim(),
        direccion:   form.direccion.trim(),
        telefono:    form.telefono.trim(),
        rubro:       form.rubro,
        colorAcento: form.colorAcento,
        aliasPago:   form.aliasPago.trim(),
        logoUrl:     form.logoUrl.trim(),
        cobro:       form.cobro,
        textos: {
          ...(negocio.textos || {}),
          bienvenida: form.textoBienvenida.trim(),
        },
      }
      await actualizarNegocio(negocio.id, parciales)
      onNegocioActualizado?.(parciales)
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
    <form onSubmit={guardar} className="space-y-6">
      <Tarjeta titulo="Datos del negocio">
        <CampoTexto
          label="Nombre"
          value={form.nombre}
          onChange={(v) => set('nombre', v)}
          required
          error={nombreVacio ? 'No puede estar vacío.' : null}
        />
        <CampoTexto
          label="Dirección"
          value={form.direccion}
          onChange={(v) => set('direccion', v)}
          placeholder="Calle 123, Ciudad"
        />
        <CampoTexto
          label="Teléfono / WhatsApp"
          value={form.telefono}
          onChange={(v) => set('telefono', v)}
          placeholder="+5493411234567"
          hint="Formato internacional (con +54...) para que el link de WhatsApp funcione."
        />

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
          <span className="block font-sans text-ink/50 text-xs mt-1">
            Cambia los textos del flujo de reserva (ej: "trabajo" en vez de
            "servicio" para tattoo).
          </span>
        </label>
      </Tarjeta>

      <Tarjeta titulo="Estilo">
        <SelectorColor
          valor={form.colorAcento}
          onElegir={(hex) => set('colorAcento', hex)}
        />
        <CampoTexto
          label="Logo (URL)"
          value={form.logoUrl}
          onChange={(v) => set('logoUrl', v)}
          placeholder="https://..."
          hint="Por ahora pegá un link a tu logo. La subida de archivos viene más adelante."
        />
      </Tarjeta>

      <Tarjeta titulo="Texto de bienvenida">
        <label className="block">
          <span className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-1.5">
            Mensaje que ve el cliente al entrar
          </span>
          <textarea
            value={form.textoBienvenida}
            onChange={(e) => set('textoBienvenida', e.target.value)}
            rows={3}
            placeholder="Reservá tu turno en pocos pasos."
            className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-ink placeholder:text-ink/40 focus:outline-none focus:border-ink/40 transition resize-none"
          />
        </label>
      </Tarjeta>

      <ConfigCobro
        cobro={form.cobro}
        aliasPago={form.aliasPago}
        onCambiarCobro={setCobroParcial}
        onCambiarAlias={(v) => set('aliasPago', v)}
        errorAlias={cobroSinAlias ? 'Tenés que cargar el alias para activar el cobro.' : null}
      />

      {/* Acciones */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={!valido || estado === 'guardando'}
          className="rounded-full bg-teal text-paper px-6 py-3 font-sans text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {estado === 'guardando' ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {estado === 'guardado' && (
          <span className="font-sans text-teal text-sm">¡Listo, guardado!</span>
        )}
        {estado === 'error' && (
          <span className="font-sans text-copper text-sm">
            Algo falló. Intentá de nuevo.
          </span>
        )}
      </div>
    </form>
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
