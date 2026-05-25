// Ruta oculta /__seed para ejecutar el script de datos de prueba.
// SOLO PARA DESARROLLO. Cuando exista el panel del admin, se elimina esta página.

import { useState } from 'react'
import { cargarDatosDePrueba } from '../lib/seed'

export default function SeedPage() {
  const [estado, setEstado] = useState({ estado: 'idle', resultado: null, error: null })

  async function correr() {
    setEstado({ estado: 'corriendo', resultado: null, error: null })
    try {
      const r = await cargarDatosDePrueba()
      setEstado({ estado: 'ok', resultado: r, error: null })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setEstado({ estado: 'error', resultado: null, error: err.message || String(err) })
    }
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-md mx-auto">
        <h1 className="font-serif text-3xl text-ink font-light">Seed de prueba</h1>
        <p className="font-sans text-ink/60 text-sm mt-2">
          Crea el negocio de ejemplo <strong>Estudio Bilardo</strong> con sus
          servicios y profesionales. Es seguro ejecutarlo varias veces
          (sobreescribe, no duplica).
        </p>

        <button
          type="button"
          onClick={correr}
          disabled={estado.estado === 'corriendo'}
          className="mt-6 rounded-full bg-teal text-paper px-6 py-3 font-sans text-sm font-medium disabled:opacity-50"
        >
          {estado.estado === 'corriendo' ? 'Cargando…' : 'Cargar datos de prueba'}
        </button>

        {estado.estado === 'ok' && (
          <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5">
            <p className="font-sans text-ink font-medium">¡Listo!</p>
            <p className="font-sans text-ink/70 text-sm mt-1">
              Negocio: <code>{estado.resultado.slug}</code><br />
              Servicios creados: {estado.resultado.serviciosCreados}<br />
              Profesionales creados: {estado.resultado.profesionalesCreados}
            </p>
            <p className="font-sans text-ink/60 text-sm mt-3">
              Probá el flujo en{' '}
              <a
                href={`/${estado.resultado.slug}`}
                className="underline text-teal"
              >
                /{estado.resultado.slug}
              </a>
              .
            </p>
          </div>
        )}

        {estado.estado === 'error' && (
          <div className="mt-6 rounded-2xl border border-copper bg-copper/5 p-5">
            <p className="font-sans text-copper font-medium">Falló</p>
            <p className="font-sans text-ink/70 text-sm mt-1 break-all">
              {estado.error}
            </p>
            <p className="font-sans text-ink/60 text-sm mt-3">
              Revisá que el .env tenga las credenciales y que Firestore esté
              creado en la consola de Firebase.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
