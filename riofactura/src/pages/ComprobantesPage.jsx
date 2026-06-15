import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, Plus, Search } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { listarComprobantes } from '../services/comprobantes'
import { formatearMoneda, formatearFecha, formatearNumeroComprobante } from '../lib/formato'
import {
  Button,
  Card,
  Input,
  Spinner,
  TituloPagina,
  VacioEstado,
  Badge,
} from '../components/ui'

const colorClase = {
  factura: 'brand',
  nota_debito: 'ambar',
  nota_credito: 'rojo',
}

export default function ComprobantesPage() {
  const { usuario } = useAuth()
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    listarComprobantes(usuario.uid).then((cs) => {
      setItems(cs)
      setCargando(false)
    })
  }, [usuario.uid])

  const filtrados = items.filter((c) => {
    const txt = `${c.tipoLabel} ${formatearNumeroComprobante(c.puntoVenta, c.numero)} ${c.cliente?.razonSocial || ''}`
    return txt.toLowerCase().includes(busqueda.toLowerCase())
  })

  if (cargando) return <Spinner />

  return (
    <>
      <TituloPagina titulo="Comprobantes" descripcion="Todas las facturas y notas emitidas.">
        <Link to="/facturar">
          <Button><Plus size={16} /> Nuevo</Button>
        </Link>
      </TituloPagina>

      {items.length === 0 ? (
        <VacioEstado
          icono={Receipt}
          titulo="Todavía no emitiste comprobantes"
          descripcion="Emití tu primera factura desde la sección Facturar."
          accion={<Link to="/facturar"><Button><Plus size={16} /> Facturar</Button></Link>}
        />
      ) : (
        <Card>
          <div className="border-b border-[rgba(14,23,38,0.08)] p-3">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
              <Input className="pl-9" placeholder="Buscar…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(14,23,38,0.08)] text-left text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Comprobante</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">CAE</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr key={c.id} className="border-b border-[rgba(14,23,38,0.05)] hover:bg-[rgba(14,23,38,0.02)]">
                    <td className="px-4 py-3 text-ink/60">{formatearFecha(c.fecha)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/comprobantes/${c.id}`} className="flex items-center gap-2 font-medium text-brand hover:underline">
                        <Badge color={colorClase[c.clase] || 'gris'}>{c.letra}</Badge>
                        {c.tipoLabel} {formatearNumeroComprobante(c.puntoVenta, c.numero)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{c.cliente?.razonSocial || 'Consumidor Final'}</td>
                    <td className="px-4 py-3">
                      {c.cae?.modo === 'simulado' ? (
                        <Badge color="ambar">Simulado</Badge>
                      ) : (
                        <Badge color="verde">{c.cae?.cae || '—'}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatearMoneda(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}
