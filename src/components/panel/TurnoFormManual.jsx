// Form para alta manual de turno desde el panel.
// El dueño elige servicio, profesional (o "cualquiera"), fecha + hora y carga
// los datos del cliente. Crea el turno con estado "confirmado".

import { useState } from 'react'
import CampoTexto from './CampoTexto'
import SelectorFechaHora from './SelectorFechaHora'

export default function TurnoFormManual({
  negocio,
  servicios,
  profesionales,
  fechaInicial,
  horaInicial = null,            // si viene, preselecciona el slot
  profesionalIdInicial = '',     // si viene, preselecciona ese profesional
  onCrear,
  onCancelar,
  colorAcento,
  etiquetaServicio = 'servicio',
  etiquetaProfesional = 'profesional',
}) {
  const [servicioId, setServicioId] = useState(servicios[0]?.id || '')
  const [profId, setProfId] = useState(profesionalIdInicial || '')
  // Si nos llegó horaInicial + fechaInicial, arrancamos con el slot preseleccionado.
  const [horario, setHorario] = useState(
    horaInicial && fechaInicial
      ? { fecha: fechaInicial, hora: horaInicial }
      : null
  )
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  // Cuando cambia servicio o profesional, el slot elegido puede dejar de ser
  // válido. Reset explícito en los onChange (no useEffect — evita pisar el
  // horario preseleccionado en el primer mount).
  function cambiarServicio(id) {
    setServicioId(id)
    setHorario(null)
  }
  function cambiarProfesional(id) {
    setProfId(id)
    setHorario(null)
  }

  const servicio = servicios.find((s) => s.id === servicioId) || null
  const nombreVacio = nombre.trim().length === 0
  const valido = servicio && horario && !nombreVacio

  async function submit(e) {
    e.preventDefault()
    if (!valido || guardando) return
    setGuardando(true)
    setError(null)
    try {
      // Si "cualquiera", asignamos el primer profesional activo.
      const profAsignado = profId
        ? profesionales.find((p) => p.id === profId)
        : profesionales[0] || { id: null, nombre: '' }

      await onCrear({
        servicioId: servicio.id,
        servicioNombre: servicio.nombre,
        profesionalId: profAsignado?.id || null,
        profesionalNombre: profAsignado?.nombre || '',
        fecha: horario.fecha,
        hora: horario.hora,
        duracionMinutos: servicio.duracionMinutos,
        datosCliente: {
          nombre: nombre.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
        },
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError('No pudimos crear el turno. Probá de nuevo.')
      setGuardando(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-ink/15 bg-white p-5 space-y-5"
    >
      <h3 className="font-serif text-xl text-ink font-light">Cargar turno manual</h3>

      {/* Servicio */}
      <label className="block">
        <span className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-1.5">
          {capitalizar(etiquetaServicio)}
        </span>
        {servicios.length === 0 ? (
          <p className="font-sans text-copper text-sm">
            Todavía no cargaste ningún {etiquetaServicio}. Andá a la pestaña de
            {' '}servicios primero.
          </p>
        ) : (
          <select
            value={servicioId}
            onChange={(e) => cambiarServicio(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-ink focus:outline-none focus:border-ink/40"
          >
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} ({s.duracionMinutos} min)
              </option>
            ))}
          </select>
        )}
      </label>

      {/* Profesional */}
      <label className="block">
        <span className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-1.5">
          {capitalizar(etiquetaProfesional)}
        </span>
        <select
          value={profId}
          onChange={(e) => cambiarProfesional(e.target.value)}
          className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-ink focus:outline-none focus:border-ink/40"
        >
          <option value="">Cualquier {etiquetaProfesional}</option>
          {profesionales.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>

      {/* Fecha + hora */}
      <SelectorFechaHora
        negocio={negocio}
        duracionMin={servicio?.duracionMinutos}
        profesionalId={profId || null}
        fechaInicial={fechaInicial}
        elegido={horario}
        onElegir={setHorario}
        colorAcento={colorAcento}
      />

      {/* Cliente */}
      <div className="space-y-3 pt-2 border-t border-ink/10">
        <p className="font-sans text-ink/60 text-xs uppercase tracking-wider">
          Datos del cliente
        </p>
        <CampoTexto
          label="Nombre"
          value={nombre}
          onChange={setNombre}
          required
          error={nombreVacio ? 'Obligatorio.' : null}
          placeholder="Juan Pérez"
        />
        <CampoTexto
          label="WhatsApp"
          value={whatsapp}
          onChange={setWhatsapp}
          placeholder="3411234567"
          hint="Opcional pero recomendado."
        />
        <CampoTexto
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="juan@gmail.com"
          hint="Opcional."
        />
      </div>

      {error && <p className="font-sans text-copper text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!valido || guardando}
          className="rounded-full bg-teal text-paper px-5 py-2.5 font-sans text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {guardando ? 'Creando…' : 'Crear turno'}
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

function capitalizar(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
