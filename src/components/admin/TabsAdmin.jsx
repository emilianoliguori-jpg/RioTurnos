// Tabs principales del admin de Río Tech: Solicitudes | Negocios.

const SECCIONES = [
  { key: 'solicitudes', label: 'Solicitudes' },
  { key: 'negocios',    label: 'Negocios' },
]

export default function TabsAdmin({ activa, onCambiar }) {
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
                    color: esActiva ? '#0B6E6E' : '#0F1419',
                    borderColor: esActiva ? '#0B6E6E' : 'transparent',
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
