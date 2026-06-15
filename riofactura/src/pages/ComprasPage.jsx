import { useEffect, useState } from 'react'
import { ShoppingCart, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { listarCompras, registrarCompra, eliminarCompra } from '../services/compras'
import { listarProveedores } from '../services/proveedores'
import { ALICUOTAS_IVA, tasaIva } from '../lib/afip'
import { formatearMoneda, formatearFecha, hoyISO, redondear } from '../lib/formato'
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
} from '../components/ui'

const VACIO = () => ({
  fecha: hoyISO(),
  proveedorId: '',
  tipoLabel: 'Factura A',
  numeroComprobante: '',
  neto: '',
  alicuotaIva: 5,
  otrosTributos: '',
  descripcion: '',
  condicionVenta: 'cuenta_corriente',
})

export default function ComprasPage() {
  const { usuario } = useAuth()
  const uid = usuario.uid
  const [compras, setCompras] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const [tick, setTick] = useState(0)
  const recargar = () => setTick((t) => t + 1)
  useEffect(() => {
    let cancelado = false
    async function cargar() {
      const [cs, ps] = await Promise.all([listarCompras(uid), listarProveedores(uid)])
      if (!cancelado) {
        setCompras(cs)
        setProveedores(ps)
        setCargando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [uid, tick])

  const set = (campo, valor) => setModal({ ...modal, [campo]: valor })

  // IVA y total calculados a partir del neto + alicuota.
  const neto = Number(modal?.neto) || 0
  const otros = Number(modal?.otrosTributos) || 0
  const ivaCalc = redondear(neto * tasaIva(Number(modal?.alicuotaIva)))
  const totalCalc = redondear(neto + ivaCalc + otros)

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      const prov = proveedores.find((p) => p.id === modal.proveedorId)
      await registrarCompra(uid, {
        fecha: modal.fecha,
        tipoLabel: modal.tipoLabel,
        letra: modal.tipoLabel.slice(-1),
        numeroComprobante: modal.numeroComprobante,
        proveedor: prov ? { id: prov.id, razonSocial: prov.razonSocial, cuit: prov.cuit } : null,
        neto,
        iva: ivaCalc,
        otrosTributos: otros,
        total: totalCalc,
        descripcion: modal.descripcion,
        condicionVenta: modal.condicionVenta,
      })
      setModal(null)
      await recargar()
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(c) {
    if (!confirm('¿Eliminar esta compra?')) return
    await eliminarCompra(uid, c.id)
    await recargar()
  }

  if (cargando) return <Spinner />

  return (
    <>
      <TituloPagina titulo="Compras" descripcion="Facturas y gastos recibidos de proveedores.">
        <Button onClick={() => setModal(VACIO())}>
          <Plus size={16} /> Registrar compra
        </Button>
      </TituloPagina>

      {compras.length === 0 ? (
        <VacioEstado
          icono={ShoppingCart}
          titulo="No registraste compras"
          descripcion="Cargá las facturas de tus proveedores para llevar el gasto y el Libro IVA Compras."
          accion={<Button onClick={() => setModal(VACIO())}><Plus size={16} /> Registrar compra</Button>}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(14,23,38,0.08)] text-left text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Comprobante</th>
                  <th className="px-4 py-3 font-semibold">Proveedor</th>
                  <th className="px-4 py-3 text-right font-semibold">Neto</th>
                  <th className="px-4 py-3 text-right font-semibold">IVA</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {compras.map((c) => (
                  <tr key={c.id} className="border-b border-[rgba(14,23,38,0.05)] hover:bg-[rgba(14,23,38,0.02)]">
                    <td className="px-4 py-3 text-ink/60">{formatearFecha(c.fecha)}</td>
                    <td className="px-4 py-3">{c.tipoLabel} {c.numeroComprobante}</td>
                    <td className="px-4 py-3 text-ink/70">{c.proveedor?.razonSocial || '—'}</td>
                    <td className="px-4 py-3 text-right text-ink/70">{formatearMoneda(c.neto)}</td>
                    <td className="px-4 py-3 text-right text-ink/70">{formatearMoneda(c.iva)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatearMoneda(c.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => borrar(c)} className="rounded-lg p-2 text-ink/40 hover:bg-danger-soft hover:text-danger">
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

      <Modal abierto={!!modal} onClose={() => setModal(null)} titulo="Registrar compra">
        {modal && (
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha" requerido>
                <Input type="date" value={modal.fecha} onChange={(e) => set('fecha', e.target.value)} required />
              </Field>
              <Field label="Proveedor">
                <Select value={modal.proveedorId} onChange={(e) => set('proveedorId', e.target.value)}>
                  <option value="">Sin proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>{p.razonSocial}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Tipo">
                <Select value={modal.tipoLabel} onChange={(e) => set('tipoLabel', e.target.value)}>
                  {['Factura A', 'Factura B', 'Factura C', 'Nota de Crédito A', 'Nota de Débito A', 'Ticket', 'Otro'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Nº comprobante">
                <Input value={modal.numeroComprobante} onChange={(e) => set('numeroComprobante', e.target.value)} placeholder="0001-00000123" />
              </Field>
              <Field label="Neto" requerido>
                <Input type="number" step="any" min={0} value={modal.neto} onChange={(e) => set('neto', e.target.value)} required />
              </Field>
              <Field label="Alícuota IVA">
                <Select value={modal.alicuotaIva} onChange={(e) => set('alicuotaIva', Number(e.target.value))}>
                  {ALICUOTAS_IVA.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Otros tributos" hint="Percepciones, imp. internos…">
                <Input type="number" step="any" min={0} value={modal.otrosTributos} onChange={(e) => set('otrosTributos', e.target.value)} />
              </Field>
              <Field label="Condición">
                <Select value={modal.condicionVenta} onChange={(e) => set('condicionVenta', e.target.value)}>
                  <option value="cuenta_corriente">Cuenta corriente</option>
                  <option value="contado">Contado</option>
                </Select>
              </Field>
            </div>
            <Field label="Descripción">
              <Input value={modal.descripcion} onChange={(e) => set('descripcion', e.target.value)} placeholder="Detalle del gasto" />
            </Field>

            <div className="flex items-center justify-between rounded-lg bg-[rgba(14,23,38,0.03)] px-4 py-3 text-sm">
              <span className="text-ink/55">IVA: {formatearMoneda(ivaCalc)}</span>
              <span className="font-semibold">Total: {formatearMoneda(totalCalc)}</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variante="secundario" onClick={() => setModal(null)}>Cancelar</Button>
              <Button type="submit" cargando={guardando}>Guardar compra</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
