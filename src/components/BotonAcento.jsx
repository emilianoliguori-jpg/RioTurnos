// Botón con el color de acento del negocio (que viene de Firestore, no es fijo).
// Si está deshabilitado, se grisa.
//
// Multi-tenant: el color cambia por negocio. Por eso va inline en lugar de
// usar una clase Tailwind fija — Tailwind no puede generar clases dinámicas.

export default function BotonAcento({
  children,
  onClick,
  disabled = false,
  colorAcento,
  variante = 'lleno', // 'lleno' | 'fantasma'
  type = 'button',
  fullWidth = true,
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-sans font-medium transition disabled:cursor-not-allowed disabled:opacity-40'
  const ancho = fullWidth ? 'w-full' : ''

  if (variante === 'fantasma') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${ancho} bg-transparent border border-ink/20 text-ink hover:bg-ink/5`}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${ancho} text-paper hover:opacity-90`}
      style={{ backgroundColor: colorAcento }}
    >
      {children}
    </button>
  )
}
