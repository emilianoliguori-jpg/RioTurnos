// Botón "Ver comprobante" reutilizable. Se adapta a dos casos:
//   - Nuevo flujo (pathComprobante): pide URL on-demand a Storage usando la
//     auth del admin/dueño que tenga permisos de lectura.
//   - Compatibilidad hacia atrás (urlComprobante): registros viejos que
//     tienen la URL guardada directo en Firestore — la abre tal cual.

import { useState } from 'react'
import { getUrlComprobante } from '../../services/storage'

export default function BotonVerComprobante({
  pathComprobante,
  urlComprobante,
  className,
}) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  // Si no hay ni path ni URL, no rendereamos nada.
  if (!pathComprobante && !urlComprobante) return null

  async function abrir() {
    setError(null)
    let url = urlComprobante

    if (pathComprobante) {
      setCargando(true)
      try {
        url = await getUrlComprobante(pathComprobante)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        setError('No pudimos abrir el comprobante.')
        setCargando(false)
        return
      }
      setCargando(false)
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const cls = className
    || 'inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 font-sans text-xs text-ink hover:bg-ink/5 transition disabled:opacity-50'

  return (
    <div>
      <button type="button" onClick={abrir} disabled={cargando} className={cls}>
        <IconoArchivo />
        {cargando ? 'Abriendo…' : 'Ver comprobante'}
      </button>
      {error && <p className="font-sans text-copper text-xs mt-1">{error}</p>}
    </div>
  )
}

function IconoArchivo() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
