import { useEffect, useMemo, useState } from 'react'
import { Printer } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { listarComprobantes } from '../services/comprobantes'
import { listarCompras } from '../services/compras'
import { signoCtaCte } from '../lib/afip'
import {
  formatearMoneda,
  formatearFecha,
  formatearNumeroComprobante,
  formatearCuit,
  redondear,
} from '../lib/formato'
import { Button, Card, Select, Field, Spinner, TituloPagina, Badge } from '../components/ui'

function ultimosMeses(n = 12) {
  const arr = []
  const d = new Date()
  for (let i = 0; i < n; i++) {
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
    arr.push({ value: m, label: label.charAt(0).toUpperCase() + label.slice(1) })
    d.setMonth(d.getMonth() - 1)
  }
  return arr
}

export default function ReportesPage() {
  const { usuario } = useAuth()
  const [comps, setComps] = useState([])
  const [compras, setCompras] = useState([])
  const [cargando, setCargando] = useState(true)
  const meses = useMemo(() => ultimosMeses(12), [])
  const [mes, setMes] = useState(meses[0].value)
  const [libro, setLibro] = useState('ventas') // ventas | compras

  useEffect(() => {
    Promise.all([listarComprobantes(usuario.uid), listarCompras(usuario.uid)]).then(
      ([cs, cp]) => {
        setComps(cs)
        setCompras(cp)
        setCargando(false)
      }
    )
  }, [usuario.uid])

  if (cargando) return <Spinner />

  const esVentas = libro === 'ventas'
  const ventasMes = comps.filter((c) => (c.fecha || '').startsWith(mes))
  const comprasMes = compras.filter((c) => (c.fecha || '').startsWith(mes))

  const totales = esVentas
    ? ventasMes.reduce(
        (acc, c) => {
          const s = signoCtaCte(c.tipoId)
          acc.neto = redondear(acc.neto + s * c.netoGravado)
          acc.iva = redondear(acc.iva + s * (c.totalIva || 0))
          acc.total = redondear(acc.total + s * c.total)
          return acc
        },
        { neto: 0, iva: 0, total: 0 }
      )
    : comprasMes.reduce(
        (acc, c) => {
          acc.neto = redondear(acc.neto + c.neto)
          acc.iva = redondear(acc.iva + c.iva)
          acc.total = redondear(acc.total + c.total)
          return acc
        },
        { neto: 0, iva: 0, total: 0 }
      )

  return (
    <>
      <TituloPagina titulo="Reportes" descripcion="Libro IVA Ventas y Compras por período.">
        <Button variante="secundario" onClick={() => window.print()}>
          <Printer size={16} /> Imprimir
        </Button>
      </TituloPagina>

      <div className="no-print mb-4 flex flex-wrap gap-3">
        <Field label="Libro">
          <Select value={libro} onChange={(e) => setLibro(e.target.value)} className="w-48">
            <option value="ventas">IVA Ventas</option>
            <option value="compras">IVA Compras</option>
          </Select>
        </Field>
        <Field label="Período">
          <Select value={mes} onChange={(e) => setMes(e.target.value)} className="w-48">
            {meses.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-ink/45">Neto gravado</p>
          <p className="mt-1 text-xl font-bold">{formatearMoneda(totales.neto)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-ink/45">IVA</p>
          <p className="mt-1 text-xl font-bold">{formatearMoneda(totales.iva)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-ink/45">Total</p>
          <p className="mt-1 text-xl font-bold text-brand">{formatearMoneda(totales.total)}</p>
        </Card>
      </div>

      <Card className="hoja-comprobante">
        <div className="border-b border-[rgba(14,23,38,0.08)] p-4">
          <h3 className="font-semibold">
            Libro IVA {esVentas ? 'Ventas' : 'Compras'} — {meses.find((m) => m.value === mes)?.label}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(14,23,38,0.08)] text-left text-xs uppercase tracking-wide text-ink/45">
                <th className="px-3 py-2 font-semibold">Fecha</th>
                <th className="px-3 py-2 font-semibold">Comprobante</th>
                <th className="px-3 py-2 font-semibold">{esVentas ? 'Cliente' : 'Proveedor'}</th>
                <th className="px-3 py-2 font-semibold">CUIT/Doc</th>
                <th className="px-3 py-2 text-right font-semibold">Neto</th>
                <th className="px-3 py-2 text-right font-semibold">IVA</th>
                <th className="px-3 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {(esVentas ? ventasMes : comprasMes).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-ink/45">
                    Sin comprobantes en este período.
                  </td>
                </tr>
              )}
              {esVentas
                ? ventasMes.map((c) => {
                    const s = signoCtaCte(c.tipoId)
                    return (
                      <tr key={c.id} className="border-b border-[rgba(14,23,38,0.05)]">
                        <td className="px-3 py-2 text-ink/60">{formatearFecha(c.fecha)}</td>
                        <td className="px-3 py-2">
                          <Badge color="gris">{c.letra}</Badge> {formatearNumeroComprobante(c.puntoVenta, c.numero)}
                        </td>
                        <td className="px-3 py-2">{c.cliente?.razonSocial || 'Consumidor Final'}</td>
                        <td className="px-3 py-2 text-ink/60">
                          {c.cliente?.tipoDoc === 80 ? formatearCuit(c.cliente?.nroDoc) : c.cliente?.nroDoc || '—'}
                        </td>
                        <td className="px-3 py-2 text-right">{formatearMoneda(s * c.netoGravado)}</td>
                        <td className="px-3 py-2 text-right">{formatearMoneda(s * (c.totalIva || 0))}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatearMoneda(s * c.total)}</td>
                      </tr>
                    )
                  })
                : comprasMes.map((c) => (
                    <tr key={c.id} className="border-b border-[rgba(14,23,38,0.05)]">
                      <td className="px-3 py-2 text-ink/60">{formatearFecha(c.fecha)}</td>
                      <td className="px-3 py-2">{c.tipoLabel} {c.numeroComprobante}</td>
                      <td className="px-3 py-2">{c.proveedor?.razonSocial || '—'}</td>
                      <td className="px-3 py-2 text-ink/60">{c.proveedor?.cuit ? formatearCuit(c.proveedor.cuit) : '—'}</td>
                      <td className="px-3 py-2 text-right">{formatearMoneda(c.neto)}</td>
                      <td className="px-3 py-2 text-right">{formatearMoneda(c.iva)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatearMoneda(c.total)}</td>
                    </tr>
                  ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-ink/20 font-bold">
                <td className="px-3 py-3" colSpan={4}>Totales del período</td>
                <td className="px-3 py-3 text-right">{formatearMoneda(totales.neto)}</td>
                <td className="px-3 py-3 text-right">{formatearMoneda(totales.iva)}</td>
                <td className="px-3 py-3 text-right text-brand">{formatearMoneda(totales.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </>
  )
}
