// Barra de progreso superior del flujo de reserva.
// Muestra 5 puntitos; el actual y los previos se pintan con el color de acento.

export default function StepProgress({ paso, total = 5, colorAcento }) {
  return (
    <div className="flex items-center gap-1.5 w-full max-w-md mx-auto">
      {Array.from({ length: total }).map((_, i) => {
        const activo = i < paso
        return (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              backgroundColor: activo ? colorAcento : 'rgba(15,20,25,0.12)',
            }}
          />
        )
      })}
    </div>
  )
}
