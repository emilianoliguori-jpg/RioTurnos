// Sección Negocios del admin: métricas + lista + alta manual.

import { useEffect, useState } from 'react'
import {
  getTodosLosNegocios,
  marcarPagoMesActual,
  desmarcarPagoMes,
} from '../../services/negocios'

import MetricasNegocios from './MetricasNegocios'
import TarjetaNegocio from './TarjetaNegocio'
import FormCrearNegocio from './FormCrearNegocio'

export default function SeccionNegocios() {
  const [negocios, setNegocios] = useState(null) // null = cargando
  const [creando, setCreando] = useState(false)

  async function recargar() {
    const items = await getTodosLosNegocios()
    setNegocios(items)
  }

  useEffect(() => {
    recargar()
  }, [])

  async function alCrear() {
    setCreando(false)
    await recargar()
  }

  async function togglePago(negocio, marcarComoPagado) {
    if (marcarComoPagado) {
      await marcarPagoMesActual(negocio.id)
    } else {
      await desmarcarPagoMes(negocio.id)
    }
    await recargar()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="font-serif text-2xl text-ink font-light">Negocios</h2>
        {!creando && (
          <button
            type="button"
            onClick={() => setCreando(true)}
            className="rounded-full bg-teal text-paper px-4 py-2 font-sans text-sm font-medium hover:opacity-90"
          >
            + Crear negocio
          </button>
        )}
      </div>

      <MetricasNegocios negocios={negocios || []} />

      {creando && (
        <FormCrearNegocio
          onCreado={alCrear}
          onCancelar={() => setCreando(false)}
        />
      )}

      {negocios === null ? (
        <p className="font-sans text-ink/50 text-sm">Cargando…</p>
      ) : negocios.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center">
          <p className="font-serif text-xl text-ink font-light">No hay negocios todavía.</p>
          <p className="font-sans text-ink/50 text-sm mt-2">
            Tocá "+ Crear negocio" para dar de alta el primero.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {negocios.map((n) => (
            <TarjetaNegocio key={n.id} negocio={n} onTogglePago={togglePago} />
          ))}
        </div>
      )}
    </div>
  )
}
