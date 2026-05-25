// Mini dashboard arriba del listado de negocios.
// 4 métricas que el admin necesita ver de un vistazo: cuántos hay, cuántos
// activos, cuántos pagaron este mes, cuántos deben pagar.

import { getPlan } from '../../lib/planes'
import { mesActualKey } from '../../lib/fechas'
import Metrica from '../comun/Metrica'

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
