// Barra de pestañas del panel.
// Mobile-first: scroll horizontal si no entran. En desktop quedan en línea.
// "Resumen" va primero porque es lo que el dueño abre cuando entra.

const SECCIONES = [
  { key: 'resumen',       label: 'Resumen' },
  { key: 'configuracion', label: 'Configuración' },
  { key: 'servicios',     label: 'Servicios' },
  { key: 'profesionales', label: 'Profesionales' },
  { key: 'horarios',      label: 'Horarios' },
  { key: 'agenda',        label: 'Agenda' },
  { key: 'suscripcion',   label: 'Mi suscripción' },
  { key: 'ayuda',         label: 'Ayuda' },
]

export default function TabsPanel({ activa, onCambiar, colorAcento = '#0B6E6E' }) {
  return (
    <nav className="border-b border-ink/10 bg-paper">
      <div className="max-w-5xl mx-auto overflow-x-auto">
        <ul className="flex gap-1 px-3 py-1 w-max sm:w-auto">
          {SECCIONES.map((s) => {
            const esActiva = s.key === activa
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => onCambiar(s.key)}
                  className="font-sans text-sm whitespace-nowrap px-4 py-3 transition border-b-2"
                  style={{
                    color: esActiva ? colorAcento : '#0F1419',
                    borderColor: esActiva ? colorAcento : 'transparent',
                    opacity: esActiva ? 1 : 0.6,
                  }}
                >
                  {s.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export { SECCIONES }
