// Mini dashboard arriba del listado de negocios.
// 4 métricas que el admin necesita ver de un vistazo: cuántos hay, cuántos
// activos, cuántos pagaron este mes, cuántos deben pagar.

import { getPlan } from '../../lib/planes'
import { mesActualKey } from '../../lib/fechas'

export default function MetricasNegocios({ negocios }) {
  const mesActual = mesActualKey()

  const total = negocios.length
  const activos = negocios.filter((n) => (n.estado || 'activo') === 'activo').length

  // Sólo los planes con precio > 0 requieren pago mensual.
  const requierenPago = negocios.filter((n) => {
    const p = getPlan(n.plan)
    return p && p.precio > 0
  })
  const alDia = requierenPago.filter((n) => n.ultimoPagoMes === mesActual).length
  const pendientes = requierenPago.length - alDia

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Metrica label="Total"        valor={total}      colorValor="#0B6E6E" />
      <Metrica label="Activos"      valor={activos}    colorValor="#0F1419" />
      <Metrica label="Al día"       valor={alDia}      colorValor="#0B6E6E" />
      <Metrica label="Pendientes"   valor={pendientes} colorValor="#C2410C" />
    </div>
  )
}

function Metrica({ label, valor, colorValor }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
      <p
        className="font-serif text-2xl font-light leading-none"
        style={{ color: colorValor }}
      >
        {valor}
      </p>
      <p className="font-sans text-ink/50 text-[11px] uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  )
}
