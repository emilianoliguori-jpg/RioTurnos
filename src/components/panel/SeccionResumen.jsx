// Sección Resumen del panel del dueño — la primera pestaña.
// Foto rápida al entrar: próximos turnos de hoy + actividad + ingresos del mes
// + top servicios. Una sola query a Firestore (getTurnosDelMes) alimenta todo.

import { useEffect, useState } from 'react'
import { getTurnosDelMes } from '../../services/turnos'
import { calcularEstadisticasMes } from '../../services/estadisticas'
import { formatearPrecio } from '../../lib/formato'
import { limitesDePlan, planSiguiente } from '../../lib/limitesPlan'

import Metrica from '../comun/Metrica'
import BloqueLinkReservas from './BloqueLinkReservas'

export default function SeccionResumen({ negocio, onIrASeccion }) {
  const colorAcento = negocio.colorAcento || '#0B6E6E'
  const cobroActivado = !!negocio.cobro?.activado
  const { dashboardCompleto } = limitesDePlan(negocio.plan)
  const planSig = planSiguiente(negocio.plan)

  const [stats, setStats] = useState(null) // null = cargando
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      setStats(null)
      setError(null)
      try {
        const turnos = await getTurnosDelMes(negocio.id)
        if (cancelado) return
        setStats(calcularEstadisticasMes(turnos))
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        if (!cancelado) setError('No pudimos cargar el resumen.')
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [negocio.id])

  return (
    <div className="space-y-10">
      {/* 0. Link público de reservas — siempre visible, lo más importante para
          que el dueño pueda compartirlo apenas entra al panel. No depende de
          stats, por eso va antes de los early-returns de loading/error. */}
      <BloqueLinkReservas negocio={negocio} />

      {error && (
        <div className="rounded-2xl border border-copper bg-copper/5 p-5">
          <p className="font-sans text-copper text-sm">{error}</p>
        </div>
      )}

      {!error && stats === null && (
        <div className="rounded-2xl border border-ink/10 bg-white p-10 text-center">
          <p className="font-sans text-ink/50 text-sm">Cargando resumen…</p>
        </div>
      )}

      {!error && stats !== null && (
        <>
          {/* 1. Próximos turnos de hoy */}
          <section>
            <h2 className="font-serif text-2xl text-ink font-light mb-4">
              Próximos turnos de hoy
            </h2>
            <ProximosTurnosHoy turnos={stats.proximosHoy} />
          </section>

          {/* 2. Actividad del mes */}
          <section>
            <h2 className="font-serif text-2xl text-ink font-light mb-4">
              Actividad del mes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Metrica label="Total"       valor={stats.total}        colorValor={colorAcento} />
              <Metrica label="Atendidos"   valor={stats.atendidos}    colorValor="#0B6E6E" />
              <Metrica label="Confirmados" valor={stats.confirmados}  colorValor="#0F1419" />
              <Metrica label="Cancelados"  valor={stats.cancelados}   colorValor="#7B2D3A" />
            </div>
          </section>

          {/* 3 + 4. Ingresos + Top servicios — sólo si el plan los incluye.
              Si el plan es Inicial (dashboardCompleto: false), una sola card
              de upgrade reemplaza ambas secciones. */}
          {dashboardCompleto ? (
            <>
              {cobroActivado && (
                <section>
                  <h2 className="font-serif text-2xl text-ink font-light mb-4">
                    Ingresos del mes
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CardIngreso
                      etiqueta="Cobrado este mes"
                      monto={stats.ingresoCobrado}
                      variante="teal"
                      hint="Plata que ya entró (turnos confirmados o atendidos)."
                    />
                    <CardIngreso
                      etiqueta="Por confirmar"
                      monto={stats.ingresoPorConfirmar}
                      variante="copper"
                      hint="Reservaron y dicen que transfirieron, pero todavía no verificaste el pago."
                    />
                  </div>
                </section>
              )}

              <section>
                <h2 className="font-serif text-2xl text-ink font-light mb-4">
                  Top servicios del mes
                </h2>
                <TopServicios items={stats.topServicios} />
              </section>
            </>
          ) : (
            <CardUpgradeDashboard
              planSiguiente={planSig}
              onIrASuscripcion={() => onIrASeccion?.('suscripcion')}
            />
          )}
        </>
      )}
    </div>
  )
}

function CardUpgradeDashboard({ planSiguiente, onIrASuscripcion }) {
  return (
    <section className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 sm:p-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink/5 mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F1419" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h3 className="font-serif text-xl text-ink font-light">
        Más estadísticas del negocio
      </h3>
      <p className="font-sans text-ink/60 text-sm mt-2 max-w-md mx-auto">
        Ingresos del mes y top servicios — disponibles{planSiguiente ? ` en plan ${planSiguiente.nombre}` : ' en plan Profesional'}.
      </p>
      {planSiguiente && (
        <button
          type="button"
          onClick={onIrASuscripcion}
          className="mt-5 inline-flex items-center rounded-full bg-teal text-paper px-5 py-2.5 font-sans text-sm font-medium hover:opacity-90 transition"
        >
          Pasá a {planSiguiente.nombre} →
        </button>
      )}
    </section>
  )
}

function ProximosTurnosHoy({ turnos }) {
  if (turnos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
        <p className="font-serif text-xl text-ink font-light">Todo tranquilo por hoy.</p>
        <p className="font-sans text-ink/50 text-sm mt-1">
          No tenés más turnos confirmados para hoy.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white divide-y divide-ink/10">
      {turnos.map((t) => (
        <div key={t.id} className="flex items-center gap-4 p-4">
          <p className="font-serif text-2xl font-light text-ink w-16 flex-shrink-0">
            {t.hora}
          </p>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-ink font-medium truncate">
              {t.datosCliente?.nombre || 'Sin nombre'}
            </p>
            <p className="font-sans text-ink/60 text-sm truncate">
              {t.servicioNombre}
              {t.profesionalNombre ? ` · ${t.profesionalNombre}` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CardIngreso({ etiqueta, monto, variante, hint }) {
  // variante: 'teal' (lo cobrado) | 'copper' (lo pendiente de verificación)
  const estilo =
    variante === 'teal'
      ? { card: 'border-teal/30 bg-teal/5', monto: 'text-teal' }
      : { card: 'border-copper/30 bg-copper/5', monto: 'text-copper' }

  return (
    <div className={`rounded-2xl p-5 border ${estilo.card}`}>
      <p className="font-sans text-ink/60 text-xs uppercase tracking-wider">{etiqueta}</p>
      <p className={`font-serif text-3xl sm:text-4xl font-light mt-1 ${estilo.monto}`}>
        {formatearPrecio(monto)}
      </p>
      {hint && (
        <p className="font-sans text-ink/50 text-xs mt-2 leading-snug">{hint}</p>
      )}
    </div>
  )
}

function TopServicios({ items }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
        <p className="font-sans text-ink/60 text-sm">
          Todavía no hay reservas este mes.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white divide-y divide-ink/10">
      {items.map((s, i) => (
        <div key={s.id} className="flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-serif text-lg text-ink/40 font-light w-6 text-right flex-shrink-0">
              {i + 1}
            </span>
            <p className="font-sans text-ink font-medium truncate">{s.nombre}</p>
          </div>
          <span className="font-sans text-ink/60 text-sm whitespace-nowrap">
            {s.cantidad} {s.cantidad === 1 ? 'reserva' : 'reservas'}
          </span>
        </div>
      ))}
    </div>
  )
}
