import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getCliente } from '../services/clientes'
import { comprobantesDeCliente } from '../services/comprobantes'
import { cobrosDeCliente } from '../services/pagos'
import { ctaCteCliente, saldoFinal } from '../lib/ctaCte'
import { etiquetaCondicionReceptor, etiquetaTipoDoc } from '../lib/afip'
import { formatearMoneda, formatearCuit } from '../lib/formato'
import TablaCtaCte from '../components/TablaCtaCte'
import { Button, Card, Spinner, TituloPagina, Badge } from '../components/ui'

export default function ClienteDetallePage() {
  const { usuario } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [movs, setMovs] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([
      getCliente(usuario.uid, id),
      comprobantesDeCliente(usuario.uid, id),
      cobrosDeCliente(usuario.uid, id),
    ]).then(([cli, comps, cobros]) => {
      setCliente(cli)
      setMovs(ctaCteCliente(comps, cobros))
      setCargando(false)
    })
  }, [usuario.uid, id])

  if (cargando) return <Spinner />
  if (!cliente) return <p className="text-ink/60">Cliente no encontrado.</p>

  const saldo = saldoFinal(movs)

  return (
    <>
      <Button variante="fantasma" className="mb-3" onClick={() => navigate('/clientes')}>
        <ArrowLeft size={16} /> Clientes
      </Button>

      <TituloPagina titulo={cliente.razonSocial}>
        <Link to="/facturar">
          <Button><FileText size={16} /> Facturar</Button>
        </Link>
      </TituloPagina>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-ink/45">Documento</p>
          <p className="mt-1 font-medium">
            {etiquetaTipoDoc(cliente.tipoDoc)}: {cliente.tipoDoc === 80 ? formatearCuit(cliente.nroDoc) : cliente.nroDoc || '—'}
          </p>
          <p className="mt-2"><Badge color="gris">{etiquetaCondicionReceptor(cliente.condicionIva)}</Badge></p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-ink/45">Contacto</p>
          <p className="mt-1 text-sm text-ink/70">{cliente.email || '—'}</p>
          <p className="text-sm text-ink/70">{cliente.telefono || ''}</p>
          <p className="text-sm text-ink/70">{cliente.domicilio || ''}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-ink/45">Saldo cuenta corriente</p>
          <p className={`mt-1 text-2xl font-bold ${saldo > 0 ? 'text-danger' : 'text-ok'}`}>
            {formatearMoneda(saldo)}
          </p>
          <p className="text-xs text-ink/45">{saldo > 0 ? 'El cliente adeuda' : saldo < 0 ? 'Saldo a favor del cliente' : 'Sin deuda'}</p>
        </Card>
      </div>

      <h3 className="mb-3 font-semibold text-ink">Cuenta corriente</h3>
      <TablaCtaCte movimientos={movs} />
    </>
  )
}
