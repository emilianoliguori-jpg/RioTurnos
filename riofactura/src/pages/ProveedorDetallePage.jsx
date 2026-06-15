import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getProveedor } from '../services/proveedores'
import { comprasDeProveedor } from '../services/compras'
import { pagosDeProveedor } from '../services/pagos'
import { ctaCteProveedor, saldoFinal } from '../lib/ctaCte'
import { etiquetaCondicionReceptor } from '../lib/afip'
import { formatearMoneda, formatearCuit } from '../lib/formato'
import TablaCtaCte from '../components/TablaCtaCte'
import { Button, Card, Spinner, TituloPagina, Badge } from '../components/ui'

export default function ProveedorDetallePage() {
  const { usuario } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [proveedor, setProveedor] = useState(null)
  const [movs, setMovs] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([
      getProveedor(usuario.uid, id),
      comprasDeProveedor(usuario.uid, id),
      pagosDeProveedor(usuario.uid, id),
    ]).then(([prov, compras, pagos]) => {
      setProveedor(prov)
      setMovs(ctaCteProveedor(compras, pagos))
      setCargando(false)
    })
  }, [usuario.uid, id])

  if (cargando) return <Spinner />
  if (!proveedor) return <p className="text-ink/60">Proveedor no encontrado.</p>

  const saldo = saldoFinal(movs)

  return (
    <>
      <Button variante="fantasma" className="mb-3" onClick={() => navigate('/proveedores')}>
        <ArrowLeft size={16} /> Proveedores
      </Button>

      <TituloPagina titulo={proveedor.razonSocial} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-ink/45">CUIT</p>
          <p className="mt-1 font-medium">{proveedor.cuit ? formatearCuit(proveedor.cuit) : '—'}</p>
          <p className="mt-2"><Badge color="gris">{etiquetaCondicionReceptor(proveedor.condicionIva)}</Badge></p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-ink/45">Contacto</p>
          <p className="mt-1 text-sm text-ink/70">{proveedor.email || '—'}</p>
          <p className="text-sm text-ink/70">{proveedor.telefono || ''}</p>
          <p className="text-sm text-ink/70">{proveedor.rubro || ''}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-ink/45">Saldo cuenta corriente</p>
          <p className={`mt-1 text-2xl font-bold ${saldo > 0 ? 'text-danger' : 'text-ok'}`}>
            {formatearMoneda(saldo)}
          </p>
          <p className="text-xs text-ink/45">{saldo > 0 ? 'Le debés al proveedor' : saldo < 0 ? 'Saldo a favor' : 'Sin deuda'}</p>
        </Card>
      </div>

      <h3 className="mb-3 font-semibold text-ink">Cuenta corriente</h3>
      <TablaCtaCte movimientos={movs} />
    </>
  )
}
