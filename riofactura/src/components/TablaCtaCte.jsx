// Tabla de movimientos de cuenta corriente con saldo acumulado.
import { formatearMoneda, formatearFecha } from '../lib/formato'
import { Card, VacioEstado } from './ui'
import { ArrowLeftRight } from 'lucide-react'

export default function TablaCtaCte({ movimientos }) {
  if (!movimientos.length) {
    return (
      <VacioEstado
        icono={ArrowLeftRight}
        titulo="Sin movimientos"
        descripcion="Todavía no hay comprobantes ni pagos para esta cuenta."
      />
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(14,23,38,0.08)] text-left text-xs uppercase tracking-wide text-ink/45">
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Detalle</th>
              <th className="px-4 py-3 text-right font-semibold">Debe</th>
              <th className="px-4 py-3 text-right font-semibold">Haber</th>
              <th className="px-4 py-3 text-right font-semibold">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m, i) => (
              <tr key={i} className="border-b border-[rgba(14,23,38,0.05)]">
                <td className="px-4 py-3 text-ink/60">{formatearFecha(m.fecha)}</td>
                <td className="px-4 py-3">{m.detalle}</td>
                <td className="px-4 py-3 text-right text-ink/70">{m.debe ? formatearMoneda(m.debe) : '—'}</td>
                <td className="px-4 py-3 text-right text-ink/70">{m.haber ? formatearMoneda(m.haber) : '—'}</td>
                <td className={`px-4 py-3 text-right font-semibold ${m.saldo > 0 ? 'text-danger' : m.saldo < 0 ? 'text-ok' : 'text-ink/70'}`}>
                  {formatearMoneda(m.saldo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
