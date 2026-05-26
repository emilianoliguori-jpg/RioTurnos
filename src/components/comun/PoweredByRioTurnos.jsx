// Pie "con tecnología de Río Turnos" para superficies que ve el CLIENTE FINAL
// que está reservando turno.
//
// JERARQUÍA DE MARCA — el protagonista en estas superficies es el negocio.
// Esta línea es discreta a propósito: comunica de dónde sale el sistema sin
// competir con la marca del negocio. NO usa el logo de Río Tech (esa marca
// es para hablarle al dueño, no al cliente final).

export default function PoweredByRioTurnos() {
  return (
    <p className="font-sans text-xs text-ink/40 text-center mt-10">
      con tecnología de{' '}
      <span className="font-serif italic text-ink/60">Río Turnos</span>
    </p>
  )
}
