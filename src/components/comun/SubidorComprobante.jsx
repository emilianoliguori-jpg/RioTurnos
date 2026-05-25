// Componente de subida de comprobante a Firebase Storage.
// Reusable en cualquier flujo: suscripción de plan, pago de turno, etc.
// Auto-sube en cuanto el usuario elige archivo, muestra progreso real,
// resultado y permite reemplazar.
//
// Props:
//   onSubido({url, path}) — callback cuando termina. Llamado con null al quitar.
//   onCambioEstado(estado) — opcional. Estado: 'idle' | 'subiendo' | 'listo' | 'error'.
//                            Útil si el padre necesita deshabilitar otros botones
//                            mientras hay subida en curso.
//   carpeta — prefijo del path en Storage. Default: 'comprobantes-suscripcion'.

import { useRef, useState } from 'react'
import { subirComprobante, validarArchivo, TAMANO_MAX_BYTES } from '../../services/storage'

export default function SubidorComprobante({
  onSubido,
  onCambioEstado,
  carpeta,
}) {
  const inputRef = useRef(null)
  const [archivo, setArchivo] = useState(null)
  const [estado, setEstadoLocal] = useState('idle') // idle | subiendo | listo | error
  const [progreso, setProgreso] = useState(0)
  const [error, setError] = useState(null)

  function setEstado(nuevo) {
    setEstadoLocal(nuevo)
    onCambioEstado?.(nuevo)
  }

  async function elegirArchivo(file) {
    if (!file) return
    const err = validarArchivo(file)
    if (err) {
      setError(err)
      setEstado('error')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setArchivo(file)
    setError(null)
    setEstado('subiendo')
    setProgreso(0)

    try {
      const result = await subirComprobante(file, {
        onProgreso: setProgreso,
        carpeta,
      })
      setEstado('listo')
      onSubido?.(result)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setEstado('error')
      setError('Falló la subida. Probá de nuevo.')
      onSubido?.(null)
    }
  }

  function quitar() {
    setArchivo(null)
    setProgreso(0)
    setError(null)
    setEstado('idle')
    if (inputRef.current) inputRef.current.value = ''
    onSubido?.(null)
  }

  const maxMB = (TAMANO_MAX_BYTES / 1024 / 1024).toFixed(0)

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
        className="hidden"
        onChange={(e) => elegirArchivo(e.target.files?.[0])}
      />

      {!archivo && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-ink/20 bg-white px-5 py-8 text-center hover:border-ink/40 transition"
        >
          <p className="font-sans text-ink font-medium">
            Elegí el comprobante
          </p>
          <p className="font-sans text-ink/50 text-xs mt-1">
            Imagen (JPG/PNG/WebP) o PDF · hasta {maxMB} MB
          </p>
        </button>
      )}

      {archivo && (
        <div className="rounded-2xl border border-ink/15 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-sans text-ink font-medium truncate">{archivo.name}</p>
              <p className="font-sans text-ink/50 text-xs mt-0.5">
                {(archivo.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={quitar}
              className="font-sans text-xs text-ink/60 hover:text-ink underline whitespace-nowrap"
            >
              Quitar
            </button>
          </div>

          {estado === 'subiendo' && (
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
                <div
                  className="h-full bg-teal transition-[width] duration-200"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <p className="font-sans text-ink/50 text-xs mt-1">
                Subiendo… {Math.round(progreso)}%
              </p>
            </div>
          )}

          {estado === 'listo' && (
            <p className="font-sans text-teal text-sm mt-3">✓ Comprobante subido</p>
          )}

          {estado === 'error' && (
            <p className="font-sans text-copper text-sm mt-3">{error}</p>
          )}
        </div>
      )}

      {error && !archivo && (
        <p className="font-sans text-copper text-xs">{error}</p>
      )}
    </div>
  )
}
