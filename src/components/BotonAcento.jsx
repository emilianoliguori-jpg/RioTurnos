// Botón con el color de acento del negocio (viene de Firestore, no es fijo).
// Multi-tenant: el color cambia por negocio. Por eso va inline en lugar de
// usar una clase Tailwind fija — Tailwind no puede generar clases dinámicas.
//
// La variante 'fantasma' usa clases t-* (theme) → se adapta a tema oscuro/claro.

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
        className={`${base} ${ancho} bg-transparent border t-border-s t-body t-hover`}
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
