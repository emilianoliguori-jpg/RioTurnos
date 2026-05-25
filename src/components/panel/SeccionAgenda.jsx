// Sección Agenda del panel.
// Tiene 2 vistas:
//   - 'dia': turnos del día seleccionado (vista por defecto).
//   - 'pendientes': todos los pendiente_pago del negocio, ordenados cronológicamente.
// Permite: alta manual, marcar atendido, reagendar, cancelar, confirmar pago,
// rechazar (los dos últimos sólo en pendientes_pago).

import { useEffect, useState } from 'react'
import { formatearFecha } from '../../lib/fechas'
import { getRubro } from '../../lib/rubros'
import {
  getTurnosDelDia,
  getTurnosPendientesDePago,
  crearTurno,
  actualizarEstadoTurno,
  actualizarTurno,
  confirmarPagoTurno,
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

  const [vista, setVista] = useState('dia') // 'dia' | 'pendientes'
  const [fechaStr, setFechaStr] = useState(() => formatearFecha(new Date()))
  const [turnos, setTurnos] = useState(null) // null = cargando
  const [servicios, setServicios] = useState([])
  const [profesionales, setProfesionales] = useState([])

  const [creandoManual, setCreandoManual] = useState(false)
  const [reagendandoId, setReagendandoId] = useState(null)
  const [confirmandoNegativaId, setConfirmandoNegativaId] = useState(null)

  // Carga catálogos una sola vez (servicios + profesionales para el form manual).
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
    if (vista === 'pendientes') {
      const items = await getTurnosPendientesDePago(negocio.id)
      setTurnos(items)
    } else {
      const items = await getTurnosDelDia(negocio.id, fechaStr, {
        incluirCancelados: true,
      })
      items.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
      setTurnos(items)
    }
  }

  useEffect(() => {
    setTurnos(null)
    recargar()
    setReagendandoId(null)
    setConfirmandoNegativaId(null)
    setCreandoManual(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocio.id, fechaStr, vista])

  // --- Handlers ---
  async function crearManual(payload) {
    const id = await crearTurno(negocio.id, payload)
    setCreandoManual(false)
    if (payload.fecha !== fechaStr && vista === 'dia') {
      setFechaStr(payload.fecha)
    } else {
      await recargar()
    }
    return id
  }

  async function reagendar(turnoId, { fecha, hora }) {
    await actualizarTurno(negocio.id, turnoId, { fecha, hora })
    setReagendandoId(null)
    if (vista === 'dia' && fecha !== fechaStr) {
      setFechaStr(fecha)
    } else {
      await recargar()
    }
  }

  async function marcarAtendido(turnoId) {
    await actualizarEstadoTurno(negocio.id, turnoId, 'atendido')
    await recargar()
  }

  async function aplicarNegativa(turnoId) {
    // Tanto "Cancelar" como "Rechazar" terminan en estado=cancelado: el slot
    // se libera. La diferencia es semántica (rechazar = el cliente no pagó).
    await actualizarEstadoTurno(negocio.id, turnoId, 'cancelado')
    setConfirmandoNegativaId(null)
    await recargar()
  }

  async function aprobarPago(turnoId) {
    await confirmarPagoTurno(negocio.id, turnoId)
    await recargar()
  }

  // --- Render ---
  return (
    <div className="space-y-5">
      {/* Selector de vista */}
      <div className="inline-flex rounded-full border border-ink/15 bg-white p-1">
        <BotonVista
          activo={vista === 'dia'}
          onClick={() => setVista('dia')}
          colorAcento={colorAcento}
        >
          Día
        </BotonVista>
        <BotonVista
          activo={vista === 'pendientes'}
          onClick={() => setVista('pendientes')}
          colorAcento={colorAcento}
        >
          Pendientes de pago
        </BotonVista>
      </div>

      {vista === 'dia' && (
        <>
          <SelectorDia valor={fechaStr} onCambiar={setFechaStr} />
          <MetricasDia turnos={turnos || []} colorAcento={colorAcento} />

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
        </>
      )}

      {vista === 'pendientes' && (
        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <p className="font-serif text-lg text-ink font-light">
            Pendientes de pago
          </p>
          <p className="font-sans text-ink/50 text-xs mt-1">
            Todos los turnos que esperan tu confirmación, en orden cronológico.
          </p>
        </div>
      )}

      {/* Lista de turnos */}
      {turnos === null ? (
        <p className="font-sans text-ink/50 text-sm">Cargando…</p>
      ) : turnos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center">
          <p className="font-serif text-xl text-ink font-light">
            {vista === 'pendientes' ? 'No hay pagos pendientes.' : 'No hay turnos este día.'}
          </p>
          <p className="font-sans text-ink/50 text-sm mt-2">
            {vista === 'pendientes'
              ? 'Cuando un cliente reserve con pago, va a aparecer acá.'
              : 'Tocá "+ Cargar turno manual" para sumar uno, o esperá reservas online.'}
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
                mostrarFecha={vista === 'pendientes'}
                confirmandoNegativa={confirmandoNegativaId === t.id}
                onPedirNegativa={() => setConfirmandoNegativaId(t.id)}
                onConfirmarNegativa={() => aplicarNegativa(t.id)}
                onAbortarNegativa={() => setConfirmandoNegativaId(null)}
                onMarcarAtendido={() => marcarAtendido(t.id)}
                onPedirReagendar={() => setReagendandoId(t.id)}
                onConfirmarPago={() => aprobarPago(t.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}

function BotonVista({ activo, onClick, children, colorAcento }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-1.5 font-sans text-sm transition"
      style={
        activo
          ? { backgroundColor: colorAcento, color: '#F5F1EA' }
          : { backgroundColor: 'transparent', color: '#0F1419' }
      }
    >
      {children}
    </button>
  )
}
