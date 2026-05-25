// Sección Agenda del panel.
// Lista los turnos de un día, los gestiona (atendido/reagendar/cancelar) y
// permite alta manual.
//
// Estructura del estado:
//   fechaStr               día visible (YYYY-MM-DD)
//   turnos                 cargados para ese día (incluye cancelados)
//   creandoManual          bool — mostramos el form de alta
//   reagendandoId          turnoId | null — mostramos el form de reagendado en esa card
//   confirmandoCancelarId  turnoId | null — la card pregunta "¿cancelar?"

import { useEffect, useState } from 'react'
import { formatearFecha } from '../../lib/fechas'
import { getRubro } from '../../lib/rubros'
import {
  getTurnosDelDia,
  crearTurno,
  actualizarEstadoTurno,
  actualizarTurno,
} from '../../services/turnos'
import { getServicios } from '../../services/servicios'
import { getProfesionales } from '../../services/profesionales'

import SelectorDia from './SelectorDia'
import MetricasDia from './MetricasDia'
import TurnoCard from './TurnoCard'
import TurnoFormManual from './TurnoFormManual'
import ReagendarForm from './ReagendarForm'

export default function SeccionAgenda({ negocio }) {
  const rubro = getRubro(negocio.rubro)
  const colorAcento = negocio.colorAcento || '#0B6E6E'

  const [fechaStr, setFechaStr] = useState(() => formatearFecha(new Date()))
  const [turnos, setTurnos] = useState(null) // null = cargando
  const [servicios, setServicios] = useState([])
  const [profesionales, setProfesionales] = useState([])

  const [creandoManual, setCreandoManual] = useState(false)
  const [reagendandoId, setReagendandoId] = useState(null)
  const [confirmandoCancelarId, setConfirmandoCancelarId] = useState(null)

  // Carga catálogos (servicios + profesionales) una sola vez para usarlos
  // en los selectores del form manual.
  useEffect(() => {
    let cancelado = false
    async function cargar() {
      const [svs, profs] = await Promise.all([
        getServicios(negocio.id, { soloActivos: true }),
        getProfesionales(negocio.id, { soloActivos: true }),
      ])
      if (cancelado) return
      setServicios(svs)
      setProfesionales(profs)
    }
    cargar()
    return () => { cancelado = true }
  }, [negocio.id])

  async function recargar() {
    const items = await getTurnosDelDia(negocio.id, fechaStr, {
      incluirCancelados: true,
    })
    items.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
    setTurnos(items)
  }

  useEffect(() => {
    setTurnos(null)
    recargar()
    // Salgo de cualquier modo de edición al cambiar de día.
    setReagendandoId(null)
    setConfirmandoCancelarId(null)
    setCreandoManual(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocio.id, fechaStr])

  // --- Handlers ---
  async function crearManual(payload) {
    const id = await crearTurno(negocio.id, payload)
    setCreandoManual(false)
    // Si el turno creado cae en otro día, saltamos a ese día.
    if (payload.fecha !== fechaStr) {
      setFechaStr(payload.fecha)
    } else {
      await recargar()
    }
    return id
  }

  async function reagendar(turnoId, { fecha, hora }) {
    await actualizarTurno(negocio.id, turnoId, { fecha, hora })
    setReagendandoId(null)
    if (fecha !== fechaStr) {
      setFechaStr(fecha)
    } else {
      await recargar()
    }
  }

  async function marcarAtendido(turnoId) {
    await actualizarEstadoTurno(negocio.id, turnoId, 'atendido')
    await recargar()
  }

  async function cancelar(turnoId) {
    await actualizarEstadoTurno(negocio.id, turnoId, 'cancelado')
    setConfirmandoCancelarId(null)
    await recargar()
  }

  // --- Render ---
  return (
    <div className="space-y-5">
      <SelectorDia valor={fechaStr} onCambiar={setFechaStr} />

      <MetricasDia turnos={turnos || []} colorAcento={colorAcento} />

      {/* Acción cargar turno manual */}
      {!creandoManual && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setCreandoManual(true)}
            className="rounded-full bg-teal text-paper px-4 py-2 font-sans text-sm font-medium hover:opacity-90"
          >
            + Cargar turno manual
          </button>
        </div>
      )}

      {creandoManual && (
        <TurnoFormManual
          negocio={negocio}
          servicios={servicios}
          profesionales={profesionales}
          fechaInicial={fechaStr}
          onCrear={crearManual}
          onCancelar={() => setCreandoManual(false)}
          colorAcento={colorAcento}
          etiquetaServicio={rubro.servicioSingular}
          etiquetaProfesional={rubro.profesionalSingular}
        />
      )}

      {/* Lista de turnos */}
      {turnos === null ? (
        <p className="font-sans text-ink/50 text-sm">Cargando…</p>
      ) : turnos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center">
          <p className="font-serif text-xl text-ink font-light">
            No hay turnos este día.
          </p>
          <p className="font-sans text-ink/50 text-sm mt-2">
            Tocá "+ Cargar turno manual" para sumar uno, o esperá reservas online.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {turnos.map((t) =>
            reagendandoId === t.id ? (
              <ReagendarForm
                key={t.id}
                negocio={negocio}
                turno={t}
                onConfirmar={(nuevo) => reagendar(t.id, nuevo)}
                onCancelar={() => setReagendandoId(null)}
                colorAcento={colorAcento}
              />
            ) : (
              <TurnoCard
                key={t.id}
                turno={t}
                confirmandoCancelar={confirmandoCancelarId === t.id}
                onPedirCancelar={() => setConfirmandoCancelarId(t.id)}
                onConfirmarCancelar={() => cancelar(t.id)}
                onAbortarCancelar={() => setConfirmandoCancelarId(null)}
                onMarcarAtendido={() => marcarAtendido(t.id)}
                onPedirReagendar={() => setReagendandoId(t.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}
