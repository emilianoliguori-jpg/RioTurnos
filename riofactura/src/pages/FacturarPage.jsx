import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2, FileText, AlertTriangle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getEmpresa } from '../services/empresa'
import { listarClientes } from '../services/clientes'
import { emitirComprobante } from '../services/comprobantes'
import { calcularComprobante } from '../lib/calculoIva'
import {
  ALICUOTAS_IVA,
  letrasHabilitadas,
  letraSugerida,
  tiposParaLetra,
  tipoComprobante,
} from '../lib/afip'
import { formatearMoneda, hoyISO, formatearCuit } from '../lib/formato'
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  Spinner,
  TituloPagina,
  Badge,
} from '../components/ui'

const itemVacio = () => ({ descripcion: '', cantidad: 1, precioUnitario: '', alicuotaIva: 5 })

export default function FacturarPage() {
  const { usuario } = useAuth()
  const uid = usuario.uid
  const navigate = useNavigate()

  const [empresa, setEmpresa] = useState(null)
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [emitiendo, setEmitiendo] = useState(false)
  const [error, setError] = useState('')

  const [clienteId, setClienteId] = useState('')
  const [clase, setClase] = useState('factura') // factura | nota_debito | nota_credito
  const [fecha, setFecha] = useState(hoyISO())
  const [condicionVenta, setCondicionVenta] = useState('contado')
  const [observaciones, setObservaciones] = useState('')
  const [comprobanteAsociado, setComprobanteAsociado] = useState('')
  const [items, setItems] = useState([itemVacio()])

  useEffect(() => {
    Promise.all([getEmpresa(uid), listarClientes(uid)]).then(([e, cs]) => {
      setEmpresa(e)
      setClientes(cs)
      setCargando(false)
    })
  }, [uid])

  const cliente = clientes.find((c) => c.id === clienteId) || null

  // Letra que corresponde segun emisor + receptor.
  const letra = useMemo(() => {
    if (!empresa) return 'C'
    return letraSugerida(empresa.condicionIva, cliente?.condicionIva ?? 5)
  }, [empresa, cliente])

  const letrasOk = empresa ? letrasHabilitadas(empresa.condicionIva) : ['C']

  // El tipo de comprobante queda determinado por la letra + clase: existe
  // exactamente un tipo AFIP por combinacion (ej. A + factura = id 1), asi
  // que lo derivamos en vez de guardarlo en estado.
  const tiposDisponibles = useMemo(
    () => tiposParaLetra(letra, clase),
    [letra, clase]
  )
  const tipoId = tiposDisponibles[0]?.id ?? null

  const esC = letra === 'C'
  const calc = useMemo(() => calcularComprobante(items, tipoId), [items, tipoId])

  function setItem(i, campo, valor) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)))
  }
  function agregarItem() {
    setItems((arr) => [...arr, itemVacio()])
  }
  function quitarItem(i) {
    setItems((arr) => (arr.length === 1 ? arr : arr.filter((_, idx) => idx !== i)))
  }

  async function emitir() {
    setError('')
    if (calc.total <= 0) {
      setError('Cargá al menos un ítem con importe.')
      return
    }
    setEmitiendo(true)
    try {
      const borrador = {
        tipoId,
        puntoVenta: Number(empresa.puntoVenta) || 1,
        fecha,
        cliente: cliente
          ? {
              id: cliente.id,
              razonSocial: cliente.razonSocial,
              tipoDoc: cliente.tipoDoc,
              nroDoc: cliente.nroDoc,
              condicionIva: cliente.condicionIva,
              domicilio: cliente.domicilio || '',
            }
          : {
              id: null,
              razonSocial: 'Consumidor Final',
              tipoDoc: 99,
              nroDoc: '',
              condicionIva: 5,
              domicilio: '',
            },
        items,
        condicionVenta,
        observaciones,
        comprobanteAsociado: comprobanteAsociado || null,
      }
      const r = await emitirComprobante(uid, borrador)
      navigate(`/comprobantes/${r.id}`)
    } catch (e) {
      setError(e.message || 'No se pudo emitir el comprobante.')
      setEmitiendo(false)
    }
  }

  if (cargando) return <Spinner />

  if (!empresa || !empresa.cuit || !empresa.razonSocial) {
    return (
      <>
        <TituloPagina titulo="Facturar" />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <AlertTriangle size={36} className="text-warn" />
          <p className="font-medium text-ink/80">Primero completá los datos de tu empresa</p>
          <p className="max-w-sm text-sm text-ink/55">
            Necesitamos tu razón social, CUIT, condición de IVA y punto de venta
            para poder emitir comprobantes.
          </p>
          <Link to="/empresa">
            <Button>Configurar mi empresa</Button>
          </Link>
        </Card>
      </>
    )
  }

  const tipo = tipoComprobante(tipoId)

  return (
    <>
      <TituloPagina
        titulo="Emitir comprobante"
        descripcion={`Punto de venta ${String(empresa.puntoVenta).padStart(4, '0')} · ${empresa.razonSocial}`}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Cabecera */}
          <Card className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente" hint="Vacío = Consumidor Final">
                <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                  <option value="">Consumidor Final (sin cliente)</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.razonSocial}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Fecha" requerido>
                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </Field>
              <Field label="Tipo de comprobante">
                <Select value={clase} onChange={(e) => setClase(e.target.value)}>
                  <option value="factura">Factura</option>
                  <option value="nota_debito">Nota de Débito</option>
                  <option value="nota_credito">Nota de Crédito</option>
                </Select>
              </Field>
              <Field label="Letra (automática)">
                <div className="flex items-center gap-2 pt-1">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-lg font-bold text-white">
                    {letra}
                  </span>
                  <span className="text-sm text-ink/55">
                    {tipo?.label}
                    {letrasOk.length > 1 && (
                      <span className="block text-xs text-ink/40">
                        Según condición IVA del cliente
                      </span>
                    )}
                  </span>
                </div>
              </Field>
              <Field label="Condición de venta">
                <Select value={condicionVenta} onChange={(e) => setCondicionVenta(e.target.value)}>
                  <option value="contado">Contado</option>
                  <option value="cuenta_corriente">Cuenta corriente</option>
                </Select>
              </Field>
              {clase !== 'factura' && (
                <Field label="Comprobante asociado" hint="Ej. 0001-00000123">
                  <Input
                    value={comprobanteAsociado}
                    onChange={(e) => setComprobanteAsociado(e.target.value)}
                    placeholder="0001-00000123"
                  />
                </Field>
              )}
            </div>

            {cliente && (
              <div className="rounded-lg bg-[rgba(14,23,38,0.03)] p-3 text-sm text-ink/65">
                {cliente.tipoDoc === 80 ? formatearCuit(cliente.nroDoc) : cliente.nroDoc}
                {cliente.domicilio ? ` · ${cliente.domicilio}` : ''}
              </div>
            )}
          </Card>

          {/* Items */}
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink">Detalle</h3>
              <Button variante="secundario" onClick={agregarItem}>
                <Plus size={16} /> Agregar ítem
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-5">
                    <Input
                      placeholder="Descripción"
                      value={it.descripcion}
                      onChange={(e) => setItem(i, 'descripcion', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="Cant."
                      value={it.cantidad}
                      onChange={(e) => setItem(i, 'cantidad', e.target.value)}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="P. unit. (neto)"
                      value={it.precioUnitario}
                      onChange={(e) => setItem(i, 'precioUnitario', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <Select
                      value={esC ? 3 : it.alicuotaIva}
                      disabled={esC}
                      onChange={(e) => setItem(i, 'alicuotaIva', Number(e.target.value))}
                    >
                      {ALICUOTAS_IVA.map((a) => (
                        <option key={a.id} value={a.id}>IVA {a.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1 sm:col-span-2">
                    <span className="ml-auto text-sm font-medium text-ink/70">
                      {formatearMoneda(calc.lineas[i]?.subtotal || 0)}
                    </span>
                    <button
                      onClick={() => quitarItem(i)}
                      className="rounded-lg p-2 text-ink/40 hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Field label="Observaciones" hint="Opcional">
              <Input
                className="mt-3"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas internas o leyenda del comprobante"
              />
            </Field>
          </Card>
        </div>

        {/* Resumen / totales */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 p-5">
            <h3 className="mb-4 font-semibold text-ink">Resumen</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/55">Neto gravado</dt>
                <dd className="font-medium">{formatearMoneda(calc.netoGravado)}</dd>
              </div>
              {!esC &&
                calc.ivaPorAlicuota.map((a) => (
                  <div key={a.alicuotaIva} className="flex justify-between text-ink/55">
                    <dt>IVA {ALICUOTAS_IVA.find((x) => x.id === a.alicuotaIva)?.label}</dt>
                    <dd>{formatearMoneda(a.importe)}</dd>
                  </div>
                ))}
              <div className="mt-2 flex justify-between border-t border-[rgba(14,23,38,0.1)] pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="text-brand">{formatearMoneda(calc.total)}</dd>
              </div>
            </dl>

            {esC && (
              <p className="mt-3 text-xs text-ink/45">
                Comprobante C: no discrimina IVA.
              </p>
            )}

            {error && (
              <p className="mt-3 flex items-center gap-1 text-sm text-danger">
                <AlertTriangle size={14} /> {error}
              </p>
            )}

            <Button className="mt-5 w-full" cargando={emitiendo} onClick={emitir}>
              <FileText size={16} /> Emitir {tipo?.label}
            </Button>
            <p className="mt-2 text-center text-xs text-ink/40">
              Se solicitará el CAE automáticamente.
            </p>
            <div className="mt-3 flex justify-center">
              <Badge color="ambar">CAE simulado · modo prueba</Badge>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
