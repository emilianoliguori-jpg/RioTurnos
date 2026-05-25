// Métricas resumen del día: total + por estado.
// Incluye "Pendientes" (de pago) — los turnos pendiente_pago.

import Metrica from '../comun/Metrica'

export default function MetricasDia({ turnos, colorAcento = '#0B6E6E' }) {
  const total       = turnos.length
  const confirmados = turnos.filter((t) => t.estado === 'confirmado').length
  const pendientes  = turnos.filter((t) => t.estado === 'pendiente_pago').length
  const atendidos   = turnos.filter((t) => t.estado === 'atendido').length
  const cancelados  = turnos.filter((t) => t.estado === 'cancelado').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <Metrica label="Total"       valor={total}        colorValor={colorAcento} />
      <Metrica label="Confirmados" valor={confirmados}  colorValor="#0F1419" />
      <Metrica label="Pendientes"  valor={pendientes}   colorValor="#C2410C" />
      <Metrica label="Atendidos"   valor={atendidos}    colorValor="#0B6E6E" />
      <Metrica label="Cancelados"  valor={cancelados}   colorValor="#7B2D3A" />
    </div>
  )
}
