// Sección Servicios del panel. CRUD completo sobre la subcolección.
//
// Patrón de UI:
// - Lista de servicios como cards apilados (mobile-first).
// - Cada uno tiene botones "Editar" y "Borrar".
// - "Borrar" muestra una confirmación inline (no usamos window.confirm).
// - "Editar" cambia la fila por el form inline.
// - Hay un botón "Agregar" arriba que abre un form vacío al tope.

import { useEffect, useState } from 'react'
import {
  getServicios,
  crearServicio,
  upsertServicio,
  eliminarServicio,
} from '../../services/servicios'
import { getRubro } from '../../lib/rubros'
import ServicioForm from './ServicioForm'

export default function SeccionServicios({ negocio }) {
  const rubro = getRubro(negocio.rubro)
  const tituloPlural = capitalizar(rubro.servicioPlural)
  const etiqueta = rubro.servicioSingular

  const [servicios, setServicios] = useState(null) // null = cargando, [] = vacío
  const [creando, setCreando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [confirmandoBorradoId, setConfirmandoBorradoId] = useState(null)

  async function recargar() {
    const items = await getServicios(negocio.id, { soloActivos: false })
    // Ordeno por nombre para que la lista sea estable visualmente.
    items.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
    setServicios(items)
  }

  useEffect(() => {
    recargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocio.id])

  async function alCrear(datos) {
    await crearServicio(negocio.id, datos)
    setCreando(false)
    await recargar()
  }

  async function alEditar(id, datos) {
    await upsertServicio(negocio.id, id, datos)
    setEditandoId(null)
    await recargar()
  }

  async function alBorrar(id) {
    await eliminarServicio(negocio.id, id)
    setConfirmandoBorradoId(null)
    await recargar()
  }

  if (servicios === null) {
    return <p className="font-sans text-ink/50 text-sm">Cargando…</p>
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-serif text-2xl text-ink font-light">{tituloPlural}</h2>
        {!creando && (
          <button
            type="button"
            onClick={() => setCreando(true)}
            className="rounded-full bg-teal text-paper px-4 py-2 font-sans text-sm font-medium hover:opacity-90"
          >
            + Agregar
          </button>
        )}
      </div>

      <div className="space-y-3">
        {creando && (
          <ServicioForm
            etiquetaServicio={etiqueta}
            onGuardar={alCrear}
            onCancelar={() => setCreando(false)}
          />
        )}

        {servicios.length === 0 && !creando && (
          <p className="font-sans text-ink/60 text-sm py-8 text-center">
            Todavía no cargaste ningún {etiqueta}. Tocá "+ Agregar".
          </p>
        )}

        {servicios.map((s) =>
          editandoId === s.id ? (
            <ServicioForm
              key={s.id}
              valorInicial={s}
              etiquetaServicio={etiqueta}
              onGuardar={(datos) => alEditar(s.id, datos)}
              onCancelar={() => setEditandoId(null)}
            />
          ) : (
            <FilaServicio
              key={s.id}
              servicio={s}
              confirmando={confirmandoBorradoId === s.id}
              onEditar={() => setEditandoId(s.id)}
              onPedirBorrar={() => setConfirmandoBorradoId(s.id)}
              onCancelarBorrado={() => setConfirmandoBorradoId(null)}
              onConfirmarBorrado={() => alBorrar(s.id)}
            />
          )
        )}
      </div>
    </div>
  )
}

function FilaServicio({
  servicio,
  confirmando,
  onEditar,
  onPedirBorrar,
  onCancelarBorrado,
  onConfirmarBorrado,
}) {
  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-sans text-ink font-medium truncate">{servicio.nombre}</p>
          <p className="font-sans text-ink/50 text-sm mt-1">
            {servicio.duracionMinutos} min · {formatearPrecio(servicio.precio)}
            {!servicio.activo && (
              <span className="ml-2 inline-flex items-center rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink/60">
                Inactivo
              </span>
            )}
          </p>
        </div>
      </div>

      {confirmando ? (
        <div className="mt-4 flex items-center gap-3">
          <span className="font-sans text-sm text-ink">¿Borrar?</span>
          <button
            type="button"
            onClick={onConfirmarBorrado}
            className="rounded-full bg-copper text-paper px-4 py-1.5 font-sans text-sm hover:opacity-90"
          >
            Sí, borrar
          </button>
          <button
            type="button"
            onClick={onCancelarBorrado}
            className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onEditar}
            className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onPedirBorrar}
            className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink/70 hover:bg-ink/5"
          >
            Borrar
          </button>
        </div>
      )}
    </article>
  )
}

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precio || 0)
}

function capitalizar(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
