// Sección Agenda del panel.
// Tiene 2 vistas principales:
//   - 'dia': turnos del día seleccionado (con sub-vista 'lista' o 'grilla').
//   - 'pendientes': todos los pendiente_pago del negocio, ordenados crono.
//
// La sub-vista 'grilla' muestra los turnos por profesional sobre el eje de
// hora, estilo calendario. Al clickear un turno se abre la misma TurnoCard
// que en la lista (mismas acciones, mismos callbacks).

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
import GrillaPorProfesional from './grilla/GrillaPorProfesional'

export default function SeccionAgenda({ negocio }) {
  const rubro = getRubro(negocio.rubro)
  const colorAcento = negocio.colorAcento || '#0B6E6E'

  const [vista, setVista] = useState('dia') // 'dia' | 'pendientes'
  const [vistaTurnos, setVistaTurnos] = useState('lista') // 'lista' | 'grilla'
  const [fechaStr, setFechaStr] = useState(() => formatearFecha(new Date()))
  const [turnos, setTurnos] = useState(null) // null = cargando
  const [servicios, setServicios] = useState([])
  const [profesionales, setProfesionales] = useState([])

  const [creandoManual, setCreandoManual] = useState(false)
  const [prefillManual, setPrefillManual] = useState(null) // { profId, hora } | null
  const [reagendandoId, setReagendandoId] = useState(null)
  const [confirmandoNegativaId, setConfirmandoNegativaId] = useState(null)
  // En la grilla, qué turno está "expandido" abajo. En la lista no se usa.
  const [turnoSeleccionadoId, setTurnoSeleccionadoId] = useState(null)

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
    setPrefillManual(null)
    setTurnoSeleccionadoId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocio.id, fechaStr, vista])

  // --- Handlers ---
  async function crearManual(payload) {
    const id = await crearTurno(negocio.id, payload)
    setCreandoManual(false)
    setPrefillManual(null)
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
    setTurnoSeleccionadoId(null)
    if (vista === 'dia' && fecha !== fechaStr) {
      setFechaStr(fecha)
    } else {
      await recargar()
    }
  }

  async function marcarAtendido(turnoId) {
    await actualizarEstadoTurno(negocio.id, turnoId, 'atendido')
    setTurnoSeleccionadoId(null)
    await recargar()
  }

  async function aplicarNegativa(turnoId) {
    await actualizarEstadoTurno(negocio.id, turnoId, 'cancelado')
    setConfirmandoNegativaId(null)
    setTurnoSeleccionadoId(null)
    await recargar()
  }

  async function aprobarPago(turnoId) {
    await confirmarPagoTurno(negocio.id, turnoId)
    setTurnoSeleccionadoId(null)
    await recargar()
  }

  // --- Handlers de la grilla ---
  function alClickTurnoGrilla(turno) {
    setTurnoSeleccionadoId(turno.id)
  }
  function alClickLibreGrilla(profesionalId, horaStr) {
    setPrefillManual({ profesionalId: profesionalId || '', hora: horaStr })
    setCreandoManual(true)
    setTurnoSeleccionadoId(null)
  }

  // Encapsula el render de un item (TurnoCard o ReagendarForm). Lo reusan
  // la lista (en map) y la grilla (para el detalle del seleccionado).
  function renderItem(t) {
    if (reagendandoId === t.id) {
      return (
        <ReagendarForm
          key={t.id}
          negocio={negocio}
          turno={t}
          onConfirmar={(nuevo) => reagendar(t.id, nuevo)}
          onCancelar={() => setReagendandoId(null)}
          colorAcento={colorAcento}
        />
      )
    }
    return (
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
  }

  const turnoSeleccionado = (turnos || []).find((t) => t.id === turnoSeleccionadoId)

  // --- Render ---
  return (
    <div className="space-y-5">
      {/* Selector de vista principal (Día / Pendientes) */}
      <div className="inline-flex rounded-full border border-ink/15 bg-white p-1">
        <BotonChip activo={vista === 'dia'} onClick={() => setVista('dia')} colorAcento={colorAcento}>
          Día
        </BotonChip>
        <BotonChip activo={vista === 'pendientes'} onClick={() => setVista('pendientes')} colorAcento={colorAcento}>
          Pendientes de pago
        </BotonChip>
      </div>

      {vista === 'dia' && (
        <>
          <SelectorDia valor={fechaStr} onCambiar={setFechaStr} />
          <MetricasDia turnos={turnos || []} colorAcento={colorAcento} />

          {/* Sub-selector Lista / Grilla — sólo en vista día */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex rounded-full border border-ink/15 bg-white p-1">
              <BotonChip
                activo={vistaTurnos === 'lista'}
                onClick={() => setVistaTurnos('lista')}
                colorAcento={colorAcento}
              >
                Lista
              </BotonChip>
              <BotonChip
                activo={vistaTurnos === 'grilla'}
                onClick={() => setVistaTurnos('grilla')}
                colorAcento={colorAcento}
              >
                Por profesional
              </BotonChip>
            </div>

            {!creandoManual && (
              <button
                type="button"
                onClick={() => {
                  setPrefillManual(null)
                  setCreandoManual(true)
                }}
                className="rounded-full bg-teal text-paper px-4 py-2 font-sans text-sm font-medium hover:opacity-90"
              >
                + Cargar turno manual
              </button>
            )}
          </div>

          {creandoManual && (
            <TurnoFormManual
              negocio={negocio}
              servicios={servicios}
              profesionales={profesionales}
              fechaInicial={fechaStr}
              horaInicial={prefillManual?.hora || null}
              profesionalIdInicial={prefillManual?.profesionalId || ''}
              onCrear={crearManual}
              onCancelar={() => {
                setCreandoManual(false)
                setPrefillManual(null)
              }}
              colorAcento={colorAcento}
              etiquetaServicio={rubro.servicioSingular}
              etiquetaProfesional={rubro.profesionalSingular}
            />
          )}
        </>
      )}

      {vista === 'pendientes' && (
        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <p className="font-serif text-lg text-ink font-light">Pendientes de pago</p>
          <p className="font-sans text-ink/50 text-xs mt-1">
            Todos los turnos que esperan tu confirmación, en orden cronológico.
          </p>
        </div>
      )}

      {/* Cuerpo: grilla o lista */}
      {turnos === null ? (
        <p className="font-sans text-ink/50 text-sm">Cargando…</p>
      ) : vista === 'dia' && vistaTurnos === 'grilla' ? (
        <>
          <GrillaPorProfesional
            negocio={negocio}
            fechaStr={fechaStr}
            turnos={turnos}
            profesionales={profesionales}
            onClickTurno={alClickTurnoGrilla}
            onClickLibre={alClickLibreGrilla}
          />

          {turnoSeleccionado && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
                  Turno seleccionado
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTurnoSeleccionadoId(null)
                    setReagendandoId(null)
                    setConfirmandoNegativaId(null)
                  }}
                  className="font-sans text-xs text-ink/60 hover:text-ink underline"
                >
                  Cerrar
                </button>
              </div>
              {renderItem(turnoSeleccionado)}
            </div>
          )}
        </>
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
          {turnos.map((t) => renderItem(t))}
        </div>
      )}
    </div>
  )
}

function BotonChip({ activo, onClick, children, colorAcento }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-1.5 font-sans text-sm transition whitespace-nowrap"
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
