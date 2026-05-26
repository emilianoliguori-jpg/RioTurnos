// Pie "con tecnología de Río Turnos" para superficies que ve el CLIENTE FINAL
// que está reservando turno.
//
// JERARQUÍA DE MARCA — el protagonista en estas superficies es el negocio.
// Esta línea es discreta a propósito: comunica de dónde sale el sistema sin
// competir con la marca del negocio. NO usa el logo de Río Tech (esa marca
// es para hablarle al dueño, no al cliente final).
//
// Usa clases t-* del sistema de tema → contrasta correctamente sobre paper
// y sobre fondo oscuro automáticamente.

export default function PoweredByRioTurnos() {
  return (
    <p className="font-sans text-xs t-faded text-center mt-10">
      con tecnología de{' '}
      <span className="font-serif italic t-soft">Río Turnos</span>
    </p>
  )
}
