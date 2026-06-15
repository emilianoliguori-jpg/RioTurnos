import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import {
  listarClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from '../services/clientes'
import { CONDICIONES_RECEPTOR, TIPOS_DOC, etiquetaCondicionReceptor } from '../lib/afip'
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
  condicionIva: 5,
  tipoDoc: 96,
  nroDoc: '',
  domicilio: '',
  email: '',
  telefono: '',
}

export default function ClientesPage() {
  const { usuario } = useAuth()
  const uid = usuario.uid
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null) // null | {datos, id?}
  const [guardando, setGuardando] = useState(false)

  const [tick, setTick] = useState(0)
  const recargar = () => setTick((t) => t + 1)
  useEffect(() => {
    let cancelado = false
    async function cargar() {
      const data = await listarClientes(uid)
      if (!cancelado) {
        setClientes(data)
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
      const d = {
        ...modal.datos,
        condicionIva: Number(modal.datos.condicionIva),
        tipoDoc: Number(modal.datos.tipoDoc),
      }
      if (modal.id) await actualizarCliente(uid, modal.id, d)
      else await crearCliente(uid, d)
      setModal(null)
      await recargar()
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(c) {
    if (!confirm(`¿Eliminar a "${c.razonSocial}"? Sus comprobantes no se borran.`)) return
    await eliminarCliente(uid, c.id)
    await recargar()
  }

  const filtrados = clientes.filter((c) =>
    `${c.razonSocial} ${c.nroDoc}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (cargando) return <Spinner />

  return (
    <>
      <TituloPagina titulo="Clientes" descripcion="Tu cartera de clientes y sus datos fiscales.">
        <Button onClick={() => setModal({ datos: { ...VACIO } })}>
          <Plus size={16} /> Nuevo cliente
        </Button>
      </TituloPagina>

      {clientes.length === 0 ? (
        <VacioEstado
          icono={Users}
          titulo="Todavía no cargaste clientes"
          descripcion="Creá tu primer cliente para empezar a facturar y llevar su cuenta corriente."
          accion={
            <Button onClick={() => setModal({ datos: { ...VACIO } })}>
              <Plus size={16} /> Nuevo cliente
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
                  <th className="px-4 py-3 font-semibold">Documento</th>
                  <th className="px-4 py-3 font-semibold">Condición IVA</th>
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr key={c.id} className="border-b border-[rgba(14,23,38,0.05)] hover:bg-[rgba(14,23,38,0.02)]">
                    <td className="px-4 py-3">
                      <Link to={`/clientes/${c.id}`} className="font-medium text-brand hover:underline">
                        {c.razonSocial}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      {TIPOS_DOC.find((t) => t.id === c.tipoDoc)?.label || ''}{' '}
                      {c.tipoDoc === 80 ? formatearCuit(c.nroDoc) : c.nroDoc}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color="gris">{etiquetaCondicionReceptor(c.condicionIva)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{c.email || c.telefono || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setModal({ id: c.id, datos: { ...VACIO, ...c } })}
                          className="rounded-lg p-2 text-ink/50 hover:bg-[rgba(14,23,38,0.06)] hover:text-ink"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => borrar(c)}
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
        titulo={modal?.id ? 'Editar cliente' : 'Nuevo cliente'}
      >
        {modal && (
          <form onSubmit={guardar} className="space-y-4">
            <Field label="Razón social / Nombre" requerido>
              <Input
                value={modal.datos.razonSocial}
                onChange={(e) => setModal({ ...modal, datos: { ...modal.datos, razonSocial: e.target.value } })}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Condición IVA" requerido>
                <Select
                  value={modal.datos.condicionIva}
                  onChange={(e) => setModal({ ...modal, datos: { ...modal.datos, condicionIva: e.target.value } })}
                >
                  {CONDICIONES_RECEPTOR.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Tipo de documento">
                <Select
                  value={modal.datos.tipoDoc}
                  onChange={(e) => setModal({ ...modal, datos: { ...modal.datos, tipoDoc: e.target.value } })}
                >
                  {TIPOS_DOC.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Número de documento">
              <Input
                value={modal.datos.nroDoc}
                onChange={(e) => setModal({ ...modal, datos: { ...modal.datos, nroDoc: e.target.value.replace(/\D/g, '') } })}
              />
            </Field>
            <Field label="Domicilio">
              <Input
                value={modal.datos.domicilio}
                onChange={(e) => setModal({ ...modal, datos: { ...modal.datos, domicilio: e.target.value } })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email">
                <Input
                  type="email"
                  value={modal.datos.email}
                  onChange={(e) => setModal({ ...modal, datos: { ...modal.datos, email: e.target.value } })}
                />
              </Field>
              <Field label="Teléfono">
                <Input
                  value={modal.datos.telefono}
                  onChange={(e) => setModal({ ...modal, datos: { ...modal.datos, telefono: e.target.value } })}
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variante="secundario" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardando}>Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
