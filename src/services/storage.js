// Servicio: subida de archivos a Firebase Storage.
// Encapsula la API del SDK para que el resto de la app no la importe directo.

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { storage } from '../lib/firebase'

export const TAMANO_MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export const TIPOS_VALIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
]

// Devuelve mensaje de error o null si el archivo está OK.
export function validarArchivo(file) {
  if (!file) return 'Elegí un archivo.'
  if (!TIPOS_VALIDOS.includes(file.type)) {
    return 'El archivo tiene que ser imagen (JPG, PNG, WebP) o PDF.'
  }
  if (file.size > TAMANO_MAX_BYTES) {
    const mb = (TAMANO_MAX_BYTES / 1024 / 1024).toFixed(0)
    return `El archivo no puede pesar más de ${mb} MB.`
  }
  return null
}

function sanitizarNombre(nombre) {
  return (nombre || 'archivo')
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .slice(-80) // recortamos nombres muy largos
}

function generarId() {
  return Math.random().toString(36).slice(2, 10)
}

// Sube un comprobante al bucket. Devuelve { url, path }.
//   onProgreso → callback que recibe un número 0-100 mientras sube.
//   carpeta    → prefijo del path. Default: comprobantes-suscripcion.
//                Pasá algo como "comprobantes-turnos/<slug>" para otros flujos.
export function subirComprobante(
  file,
  { onProgreso, carpeta = 'comprobantes-suscripcion' } = {}
) {
  const carpetaNorm = String(carpeta).replace(/\/+$/, '')
  const path = `${carpetaNorm}/${Date.now()}-${generarId()}-${sanitizarNombre(file.name)}`
  const refArchivo = ref(storage, path)
  const tarea = uploadBytesResumable(refArchivo, file, {
    contentType: file.type,
  })

  return new Promise((resolve, reject) => {
    tarea.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgreso?.(pct)
      },
      (err) => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(tarea.snapshot.ref)
          resolve({ url, path })
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}
