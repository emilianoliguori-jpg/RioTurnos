import { useEffect, useState } from 'react'
import { Plus, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import {
  listarCobros,
  registrarCobro,
  eliminarCobro,
  listarPagos,
  registrarPago,
  eliminarPago,
  MEDIOS_PAGO,
} from '../services/pagos'
import { listarClientes } from '../services/clientes'
import { listarProveedores } from '../services/proveedores'
import { formatearMoneda, formatearFecha, hoyISO } from '../lib/formato'
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

export default function MovimientosPage() {
  const { usuario } = useAuth()
  const uid = usuario.uid
  const [tab, setTab] = useState('cobros')
  const [cobros, setCobros] = useState([])
  const [pagos, setPagos] = useState([])
  const [clientes, setClientes] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const [tick, setTick] = useState(0)
  const recargar = () => setTick((t) => t + 1)
  useEffect(() => {
    let cancelado = false
    async function cargar() {
      const [cb, pg, cl, pr] = await Promise.all([
        listarCobros(uid),
        listarPagos(uid),
        listarClientes(uid),
        listarProveedores(uid),
      ])
      if (!cancelado) {
        setCobros(cb)
        setPagos(pg)
        setClientes(cl)
        setProveedores(pr)
        setCargando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [uid, tick])

  function abrir(tipo) {
    setModal({
      tipo, // 'cobro' | 'pago'
      entidadId: '',
      fecha: hoyISO(),
      monto: '',
      medio: 'Efectivo',
      observaciones: '',
    })
  }
  const set = (campo, valor) => setModal({ ...modal, [campo]: valor })

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      if (modal.tipo === 'cobro') {
        const cli = clientes.find((c) => c.id === modal.entidadId)
        await registrarCobro(uid, {
          clienteId: modal.entidadId || null,
          cliente: cli ? { id: cli.id, razonSocial: cli.razonSocial } : null,
          fecha: modal.fecha,
          monto: Number(modal.monto),
          medio: modal.medio,
          observaciones: modal.observaciones,
        })
      } else {
        const prov = proveedores.find((p) => p.id === modal.entidadId)
        await registrarPago(uid, {
          proveedorId: modal.entidadId || null,
          proveedor: prov ? { id: prov.id, razonSocial: prov.razonSocial } : null,
          fecha: modal.fecha,
          monto: Number(modal.monto),
          medio: modal.medio,
          observaciones: modal.observaciones,
        })
      }
      setModal(null)
      await recargar()
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(tipo, item) {
    if (!confirm('¿Eliminar este movimiento?')) return
    if (tipo === 'cobro') await eliminarCobro(uid, item.id)
    else await eliminarPago(uid, item.id)
    await recargar()
  }

  if (cargando) return <Spinner />

  const esCobros = tab === 'cobros'
  const lista = esCobros ? cobros : pagos

  return (
    <>
      <TituloPagina titulo="Cobros y pagos" descripcion="Movimientos de dinero que cancelan cuentas corrientes.">
        <Button variante="secundario" onClick={() => abrir('cobro')}>
          <ArrowDownLeft size={16} /> Cobro
        </Button>
        <Button onClick={() => abrir('pago')}>
          <ArrowUpRight size={16} /> Pago
        </Button>
      </TituloPagina>

      <div className="mb-4 inline-flex rounded-lg border border-[rgba(14,23,38,0.12)] bg-white p-1">
        <button
          onClick={() => setTab('cobros')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${esCobros ? 'bg-brand text-white' : 'text-ink/60 hover:text-ink'}`}
        >
          Cobros ({cobros.length})
        </button>
        <button
          onClick={() => setTab('pagos')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${!esCobros ? 'bg-brand text-white' : 'text-ink/60 hover:text-ink'}`}
        >
          Pagos ({pagos.length})
        </button>
      </div>

      {lista.length === 0 ? (
        <VacioEstado
          icono={esCobros ? ArrowDownLeft : ArrowUpRight}
          titulo={esCobros ? 'Sin cobros registrados' : 'Sin pagos registrados'}
          descripcion={esCobros ? 'Registrá los cobros de tus clientes.' : 'Registrá los pagos a tus proveedores.'}
          accion={<Button onClick={() => abrir(esCobros ? 'cobro' : 'pago')}><Plus size={16} /> {esCobros ? 'Nuevo cobro' : 'Nuevo pago'}</Button>}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(14,23,38,0.08)] text-left text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">{esCobros ? 'Cliente' : 'Proveedor'}</th>
                  <th className="px-4 py-3 font-semibold">Medio</th>
                  <th className="px-4 py-3 font-semibold">Observaciones</th>
                  <th className="px-4 py-3 text-right font-semibold">Monto</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {lista.map((m) => (
                  <tr key={m.id} className="border-b border-[rgba(14,23,38,0.05)] hover:bg-[rgba(14,23,38,0.02)]">
                    <td className="px-4 py-3 text-ink/60">{formatearFecha(m.fecha)}</td>
                    <td className="px-4 py-3 font-medium">
                      {esCobros ? m.cliente?.razonSocial || 'Sin asignar' : m.proveedor?.razonSocial || 'Sin asignar'}
                    </td>
                    <td className="px-4 py-3"><Badge color="gris">{m.medio}</Badge></td>
                    <td className="px-4 py-3 text-ink/55">{m.observaciones || '—'}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${esCobros ? 'text-ok' : 'text-danger'}`}>
                      {esCobros ? '+' : '−'}{formatearMoneda(m.monto)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => borrar(esCobros ? 'cobro' : 'pago', m)} className="rounded-lg p-2 text-ink/40 hover:bg-danger-soft hover:text-danger">
                        <Trash2 size={16} />
                      </button>
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
        titulo={modal?.tipo === 'cobro' ? 'Registrar cobro' : 'Registrar pago'}
      >
        {modal && (
          <form onSubmit={guardar} className="space-y-4">
            <Field label={modal.tipo === 'cobro' ? 'Cliente' : 'Proveedor'}>
              <Select value={modal.entidadId} onChange={(e) => set('entidadId', e.target.value)}>
                <option value="">Sin asignar</option>
                {(modal.tipo === 'cobro' ? clientes : proveedores).map((x) => (
                  <option key={x.id} value={x.id}>{x.razonSocial}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha" requerido>
                <Input type="date" value={modal.fecha} onChange={(e) => set('fecha', e.target.value)} required />
              </Field>
              <Field label="Monto" requerido>
                <Input type="number" step="any" min={0} value={modal.monto} onChange={(e) => set('monto', e.target.value)} required />
              </Field>
            </div>
            <Field label="Medio de pago">
              <Select value={modal.medio} onChange={(e) => set('medio', e.target.value)}>
                {MEDIOS_PAGO.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <Field label="Observaciones">
              <Input value={modal.observaciones} onChange={(e) => set('observaciones', e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variante="secundario" onClick={() => setModal(null)}>Cancelar</Button>
              <Button type="submit" cargando={guardando}>Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
