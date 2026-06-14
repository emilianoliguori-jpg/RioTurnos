import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Receipt,
  Plus,
  ArrowRight,
  Landmark,
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { listarComprobantes } from '../services/comprobantes'
import { listarCompras } from '../services/compras'
import { getEmpresa } from '../services/empresa'
import { signoCtaCte } from '../lib/afip'
import {
  formatearMoneda,
  formatearFecha,
  formatearNumeroComprobante,
  redondear,
} from '../lib/formato'
import { Button, Card, Spinner, TituloPagina, Badge } from '../components/ui'

function mesActual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function DashboardPage() {
  const { usuario } = useAuth()
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    Promise.all([
      listarComprobantes(usuario.uid),
      listarCompras(usuario.uid),
      getEmpresa(usuario.uid),
    ]).then(([comps, compras, empresa]) => {
      const mes = mesActual()
      const compsMes = comps.filter((c) => (c.fecha || '').startsWith(mes))
      const comprasMes = compras.filter((c) => (c.fecha || '').startsWith(mes))

      let ventas = 0
      let ivaDebito = 0
      for (const c of compsMes) {
        const s = signoCtaCte(c.tipoId)
        ventas = redondear(ventas + s * c.total)
        ivaDebito = redondear(ivaDebito + s * (c.totalIva || 0))
      }
      const comprasTotal = comprasMes.reduce((a, c) => redondear(a + c.total), 0)
      const ivaCredito = comprasMes.reduce((a, c) => redondear(a + (c.iva || 0)), 0)

      setDatos({
        empresa,
        comps,
        ventas,
        ivaDebito,
        comprasTotal,
        ivaCredito,
        saldoIva: redondear(ivaDebito - ivaCredito),
        cantComps: compsMes.length,
      })
    })
  }, [usuario.uid])

  if (!datos) return <Spinner />

  const sinEmpresa = !datos.empresa?.cuit

  const tarjetas = [
    { label: 'Ventas del mes', valor: datos.ventas, icon: TrendingUp, color: 'text-ok' },
    { label: 'Compras del mes', valor: datos.comprasTotal, icon: TrendingDown, color: 'text-danger' },
    { label: 'IVA débito (ventas)', valor: datos.ivaDebito, icon: Receipt, color: 'text-ink' },
    { label: 'IVA crédito (compras)', valor: datos.ivaCredito, icon: Receipt, color: 'text-ink' },
  ]

  return (
    <>
      <TituloPagina
        titulo={`Hola${datos.empresa?.razonSocial ? `, ${datos.empresa.razonSocial}` : ''} 👋`}
        descripcion="Resumen del mes en curso."
      >
        <Link to="/facturar"><Button><Plus size={16} /> Facturar</Button></Link>
      </TituloPagina>

      {sinEmpresa && (
        <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-warn p-4">
          <p className="text-sm text-ink/70">
            Completá los datos fiscales de tu empresa para empezar a emitir comprobantes.
          </p>
          <Link to="/empresa"><Button variante="secundario">Configurar empresa</Button></Link>
        </Card>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <Card key={t.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-ink/45">{t.label}</p>
              <t.icon size={18} className="text-ink/30" />
            </div>
            <p className={`mt-2 text-2xl font-bold ${t.color}`}>{formatearMoneda(t.valor)}</p>
          </Card>
        ))}
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center gap-2 text-ink/55">
            <Landmark size={18} />
            <p className="text-xs uppercase tracking-wide">Posición de IVA del mes</p>
          </div>
          <p className={`mt-3 text-3xl font-bold ${datos.saldoIva > 0 ? 'text-danger' : 'text-ok'}`}>
            {formatearMoneda(Math.abs(datos.saldoIva))}
          </p>
          <p className="mt-1 text-sm text-ink/55">
            {datos.saldoIva > 0
              ? 'A pagar (débito mayor al crédito)'
              : datos.saldoIva < 0
                ? 'Saldo a favor'
                : 'Equilibrado'}
          </p>
          <p className="mt-3 text-xs text-ink/40">{datos.cantComps} comprobantes emitidos este mes</p>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Últimos comprobantes</h3>
            <Link to="/comprobantes" className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          {datos.comps.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-ink/45">
              <FileText size={28} className="text-ink/20" />
              <p className="text-sm">Todavía no emitiste comprobantes</p>
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(14,23,38,0.06)]">
              {datos.comps.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link to={`/comprobantes/${c.id}`} className="flex items-center justify-between py-2.5 hover:opacity-80">
                    <span className="flex items-center gap-2">
                      <Badge color="brand">{c.letra}</Badge>
                      <span className="text-sm font-medium">{formatearNumeroComprobante(c.puntoVenta, c.numero)}</span>
                      <span className="text-sm text-ink/50">{c.cliente?.razonSocial || 'Consumidor Final'}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-ink/40">{formatearFecha(c.fecha)}</span>
                      <span className="text-sm font-semibold">{formatearMoneda(c.total)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
