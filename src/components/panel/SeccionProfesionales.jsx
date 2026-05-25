// Sección Profesionales del panel. CRUD de la subcolección profesionales.
// El título usa la etiqueta del rubro: en peluquería "Profesionales",
// en tattoo "Artistas", en barbería "Barberos", etc.

import { useEffect, useState } from 'react'
import {
  getProfesionales,
  crearProfesional,
  upsertProfesional,
  eliminarProfesional,
} from '../../services/profesionales'
import { getRubro } from '../../lib/rubros'
import ProfesionalForm from './ProfesionalForm'

export default function SeccionProfesionales({ negocio }) {
  const rubro = getRubro(negocio.rubro)
  const tituloPlural = capitalizar(rubro.profesionalPlural)
  const etiqueta = rubro.profesionalSingular

  const [items, setItems] = useState(null)
  const [creando, setCreando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [confirmandoBorradoId, setConfirmandoBorradoId] = useState(null)

  async function recargar() {
    const arr = await getProfesionales(negocio.id, { soloActivos: false })
    arr.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
    setItems(arr)
  }

  useEffect(() => {
    recargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocio.id])

  async function alCrear(datos) {
    await crearProfesional(negocio.id, datos)
    setCreando(false)
    await recargar()
  }

  async function alEditar(id, datos) {
    await upsertProfesional(negocio.id, id, datos)
    setEditandoId(null)
    await recargar()
  }

  async function alBorrar(id) {
    await eliminarProfesional(negocio.id, id)
    setConfirmandoBorradoId(null)
    await recargar()
  }

  if (items === null) {
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
          <ProfesionalForm
            etiquetaProfesional={etiqueta}
            onGuardar={alCrear}
            onCancelar={() => setCreando(false)}
          />
        )}

        {items.length === 0 && !creando && (
          <p className="font-sans text-ink/60 text-sm py-8 text-center">
            Todavía no cargaste ningún {etiqueta}. Tocá "+ Agregar".
          </p>
        )}

        {items.map((p) =>
          editandoId === p.id ? (
            <ProfesionalForm
              key={p.id}
              valorInicial={p}
              etiquetaProfesional={etiqueta}
              onGuardar={(datos) => alEditar(p.id, datos)}
              onCancelar={() => setEditandoId(null)}
            />
          ) : (
            <FilaProfesional
              key={p.id}
              profesional={p}
              confirmando={confirmandoBorradoId === p.id}
              onEditar={() => setEditandoId(p.id)}
              onPedirBorrar={() => setConfirmandoBorradoId(p.id)}
              onCancelarBorrado={() => setConfirmandoBorradoId(null)}
              onConfirmarBorrado={() => alBorrar(p.id)}
            />
          )
        )}
      </div>
    </div>
  )
}

function FilaProfesional({
  profesional,
  confirmando,
  onEditar,
  onPedirBorrar,
  onCancelarBorrado,
  onConfirmarBorrado,
}) {
  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal text-paper font-sans font-medium"
        >
          {(profesional.nombre || '?').charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="font-sans text-ink font-medium truncate">
            {profesional.nombre}
          </p>
          {!profesional.activo && (
            <span className="inline-flex items-center rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink/60 mt-1">
              Inactivo
            </span>
          )}
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

function capitalizar(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
