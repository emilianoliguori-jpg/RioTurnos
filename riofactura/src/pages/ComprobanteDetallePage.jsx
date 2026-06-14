import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getComprobante } from '../services/comprobantes'
import { getEmpresa } from '../services/empresa'
import {
  formatearMoneda,
  formatearFecha,
  formatearCuit,
  formatearNumeroComprobante,
} from '../lib/formato'
import { ALICUOTAS_IVA, etiquetaCondicionReceptor, etiquetaTipoDoc } from '../lib/afip'
import { Button, Spinner } from '../components/ui'

export default function ComprobanteDetallePage() {
  const { usuario } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [comp, setComp] = useState(null)
  const [empresa, setEmpresa] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([getComprobante(usuario.uid, id), getEmpresa(usuario.uid)]).then(
      ([c, e]) => {
        setComp(c)
        setEmpresa(e)
        setCargando(false)
      }
    )
  }, [usuario.uid, id])

  if (cargando) return <Spinner />
  if (!comp) return <p className="text-ink/60">Comprobante no encontrado.</p>

  const discriminaIva = comp.letra === 'A'

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Button variante="fantasma" onClick={() => navigate('/comprobantes')}>
          <ArrowLeft size={16} /> Volver
        </Button>
        <Button onClick={() => window.print()}>
          <Printer size={16} /> Imprimir / PDF
        </Button>
      </div>

      <div className="hoja-comprobante mx-auto max-w-3xl rounded-2xl border border-[rgba(14,23,38,0.1)] bg-white p-8 shadow-sm">
        {/* Cabecera con la letra centrada al estilo AFIP */}
        <div className="relative border-b-2 border-ink/80 pb-4">
          <div className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 flex-col items-center justify-center border-2 border-ink/80 bg-white">
            <span className="text-3xl font-bold leading-none">{comp.letra}</span>
            <span className="text-[9px] leading-none">COD {String(comp.tipoId).padStart(2, '0')}</span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="font-serif text-xl font-bold">{empresa?.razonSocial || '—'}</h2>
              {empresa?.nombreFantasia && (
                <p className="text-sm text-ink/60">{empresa.nombreFantasia}</p>
              )}
              <p className="mt-2 text-xs text-ink/70">{empresa?.domicilio}</p>
              <p className="text-xs text-ink/70">
                {[empresa?.localidad, empresa?.provincia].filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                {comp.tipoLabel}
              </p>
              <p className="text-sm">
                Nº {formatearNumeroComprobante(comp.puntoVenta, comp.numero)}
              </p>
              <p className="mt-2 text-xs text-ink/70">Fecha: {formatearFecha(comp.fecha)}</p>
              <p className="text-xs text-ink/70">CUIT: {formatearCuit(empresa?.cuit)}</p>
              {empresa?.ingresosBrutos && (
                <p className="text-xs text-ink/70">IIBB: {empresa.ingresosBrutos}</p>
              )}
              {empresa?.inicioActividades && (
                <p className="text-xs text-ink/70">
                  Inicio act.: {formatearFecha(empresa.inicioActividades)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg bg-[rgba(14,23,38,0.03)] p-4 text-sm">
          <p><span className="text-ink/50">Cliente: </span><span className="font-medium">{comp.cliente?.razonSocial || 'Consumidor Final'}</span></p>
          <p><span className="text-ink/50">Cond. IVA: </span>{etiquetaCondicionReceptor(comp.cliente?.condicionIva)}</p>
          <p>
            <span className="text-ink/50">{etiquetaTipoDoc(comp.cliente?.tipoDoc)}: </span>
            {comp.cliente?.tipoDoc === 80 ? formatearCuit(comp.cliente?.nroDoc) : comp.cliente?.nroDoc || '—'}
          </p>
          <p><span className="text-ink/50">Domicilio: </span>{comp.cliente?.domicilio || '—'}</p>
          <p><span className="text-ink/50">Cond. venta: </span>{comp.condicionVenta === 'contado' ? 'Contado' : 'Cuenta corriente'}</p>
          {comp.comprobanteAsociado && (
            <p><span className="text-ink/50">Comp. asociado: </span>{comp.comprobanteAsociado}</p>
          )}
        </div>

        {/* Items */}
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-ink/20 text-left text-xs uppercase text-ink/50">
              <th className="py-2">Descripción</th>
              <th className="py-2 text-right">Cant.</th>
              <th className="py-2 text-right">P. unit.</th>
              {discriminaIva && <th className="py-2 text-right">IVA</th>}
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {comp.items.map((it, i) => (
              <tr key={i} className="border-b border-ink/5">
                <td className="py-2">{it.descripcion || '—'}</td>
                <td className="py-2 text-right">{it.cantidad}</td>
                <td className="py-2 text-right">{formatearMoneda(it.precioUnitario)}</td>
                {discriminaIva && (
                  <td className="py-2 text-right">
                    {ALICUOTAS_IVA.find((a) => a.id === it.alicuotaIva)?.label || '—'}
                  </td>
                )}
                <td className="py-2 text-right">{formatearMoneda(discriminaIva ? it.neto : it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="mt-4 flex justify-end">
          <dl className="w-64 space-y-1 text-sm">
            {discriminaIva && (
              <>
                <div className="flex justify-between">
                  <dt className="text-ink/55">Neto gravado</dt>
                  <dd>{formatearMoneda(comp.netoGravado)}</dd>
                </div>
                {comp.ivaPorAlicuota?.map((a) => (
                  <div key={a.alicuotaIva} className="flex justify-between text-ink/55">
                    <dt>IVA {ALICUOTAS_IVA.find((x) => x.id === a.alicuotaIva)?.label}</dt>
                    <dd>{formatearMoneda(a.importe)}</dd>
                  </div>
                ))}
              </>
            )}
            <div className="flex justify-between border-t border-ink/20 pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatearMoneda(comp.total)}</dd>
            </div>
          </dl>
        </div>

        {comp.observaciones && (
          <p className="mt-4 text-xs text-ink/60">Obs.: {comp.observaciones}</p>
        )}

        {/* Pie CAE */}
        <div className="mt-6 border-t border-ink/20 pt-3 text-right text-sm">
          <p>
            <span className="text-ink/55">CAE Nº: </span>
            <span className="font-mono font-semibold">{comp.cae?.cae || '—'}</span>
          </p>
          <p>
            <span className="text-ink/55">Vto. CAE: </span>
            {formatearFecha(comp.cae?.caeVencimiento)}
          </p>
          {comp.cae?.modo === 'simulado' && (
            <p className="mt-1 text-xs font-semibold text-warn">
              ⚠ COMPROBANTE NO VÁLIDO COMO FACTURA — CAE simulado (modo prueba)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
