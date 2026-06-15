import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import {
  listarProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from '../services/proveedores'
import { CONDICIONES_RECEPTOR, etiquetaCondicionReceptor } from '../lib/afip'
import { formatearCuit } from '../lib/formato'
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  Modal,
  Spinner,
  TituloPagina,
  VacioEstado,
  Badge,
} from '../components/ui'

const VACIO = {
  razonSocial: '',
  cuit: '',
  condicionIva: 1,
  rubro: '',
  domicilio: '',
  email: '',
  telefono: '',
}

export default function ProveedoresPage() {
  const { usuario } = useAuth()
  const uid = usuario.uid
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const [tick, setTick] = useState(0)
  const recargar = () => setTick((t) => t + 1)
  useEffect(() => {
    let cancelado = false
    async function cargar() {
      const data = await listarProveedores(uid)
      if (!cancelado) {
        setItems(data)
        setCargando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [uid, tick])

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      const d = { ...modal.datos, condicionIva: Number(modal.datos.condicionIva) }
      if (modal.id) await actualizarProveedor(uid, modal.id, d)
      else await crearProveedor(uid, d)
      setModal(null)
      await recargar()
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(p) {
    if (!confirm(`¿Eliminar al proveedor "${p.razonSocial}"?`)) return
    await eliminarProveedor(uid, p.id)
    await recargar()
  }

  const filtrados = items.filter((p) =>
    `${p.razonSocial} ${p.cuit}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const set = (campo, valor) => setModal({ ...modal, datos: { ...modal.datos, [campo]: valor } })

  if (cargando) return <Spinner />

  return (
    <>
      <TituloPagina titulo="Proveedores" descripcion="Quiénes te facturan. Llevá su cuenta corriente y pagos.">
        <Button onClick={() => setModal({ datos: { ...VACIO } })}>
          <Plus size={16} /> Nuevo proveedor
        </Button>
      </TituloPagina>

      {items.length === 0 ? (
        <VacioEstado
          icono={Truck}
          titulo="Todavía no cargaste proveedores"
          descripcion="Agregá tus proveedores para registrar compras y llevar su cuenta corriente."
          accion={
            <Button onClick={() => setModal({ datos: { ...VACIO } })}>
              <Plus size={16} /> Nuevo proveedor
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="border-b border-[rgba(14,23,38,0.08)] p-3">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
              <Input
                className="pl-9"
                placeholder="Buscar…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(14,23,38,0.08)] text-left text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-4 py-3 font-semibold">Razón social</th>
                  <th className="px-4 py-3 font-semibold">CUIT</th>
                  <th className="px-4 py-3 font-semibold">Condición IVA</th>
                  <th className="px-4 py-3 font-semibold">Rubro</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id} className="border-b border-[rgba(14,23,38,0.05)] hover:bg-[rgba(14,23,38,0.02)]">
                    <td className="px-4 py-3">
                      <Link to={`/proveedores/${p.id}`} className="font-medium text-brand hover:underline">
                        {p.razonSocial}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{p.cuit ? formatearCuit(p.cuit) : '—'}</td>
                    <td className="px-4 py-3">
                      <Badge color="gris">{etiquetaCondicionReceptor(p.condicionIva)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{p.rubro || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setModal({ id: p.id, datos: { ...VACIO, ...p } })}
                          className="rounded-lg p-2 text-ink/50 hover:bg-[rgba(14,23,38,0.06)] hover:text-ink"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => borrar(p)}
                          className="rounded-lg p-2 text-ink/50 hover:bg-danger-soft hover:text-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        abierto={!!modal}
        onClose={() => setModal(null)}
        titulo={modal?.id ? 'Editar proveedor' : 'Nuevo proveedor'}
      >
        {modal && (
          <form onSubmit={guardar} className="space-y-4">
            <Field label="Razón social" requerido>
              <Input value={modal.datos.razonSocial} onChange={(e) => set('razonSocial', e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="CUIT">
                <Input
                  value={modal.datos.cuit}
                  onChange={(e) => set('cuit', e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                />
              </Field>
              <Field label="Condición IVA">
                <Select value={modal.datos.condicionIva} onChange={(e) => set('condicionIva', e.target.value)}>
                  {CONDICIONES_RECEPTOR.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Rubro">
              <Input value={modal.datos.rubro} onChange={(e) => set('rubro', e.target.value)} placeholder="Insumos, servicios, alquiler…" />
            </Field>
            <Field label="Domicilio">
              <Input value={modal.datos.domicilio} onChange={(e) => set('domicilio', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email">
                <Input type="email" value={modal.datos.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Teléfono">
                <Input value={modal.datos.telefono} onChange={(e) => set('telefono', e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variante="secundario" onClick={() => setModal(null)}>Cancelar</Button>
              <Button type="submit" cargando={guardando}>Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
