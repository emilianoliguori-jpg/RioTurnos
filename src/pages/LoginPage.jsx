// Pantalla de login del panel — /panel/login
// Editorial, mobile-first. Un solo botón: entrar con Google.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginConGoogle } from '../services/auth'
import { useAuth } from '../lib/AuthContext'

export default function LoginPage() {
  const { usuario, cargando } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [entrando, setEntrando] = useState(false)

  // Si ya hay sesión REAL (Google, no anónima), mandamos directo al panel.
  // La sesión anónima viene del useGuestSession del flujo público — no
  // debe redirigir, sino quedaríamos en loop con RutaProtegida.
  useEffect(() => {
    if (!cargando && usuario && !usuario.isAnonymous) {
      navigate('/panel', { replace: true })
    }
  }, [usuario, cargando, navigate])

  async function entrar() {
    setError(null)
    setEntrando(true)
    try {
      await loginConGoogle()
      // El efecto de arriba detecta el cambio y redirige.
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Cerraste el popup antes de terminar.')
      } else {
        setError('No pudimos completar el login. Probá de nuevo.')
      }
    } finally {
      setEntrando(false)
    }
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="font-sans text-ink/50 text-xs uppercase tracking-widest">
          Río Turnos
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink font-light tracking-tight mt-3">
          Panel del dueño
        </h1>
        <p className="font-sans text-ink/60 text-sm mt-4">
          Entrá con tu cuenta de Google para administrar tu negocio.
        </p>

        <div className="mt-10">
          <button
            type="button"
            onClick={entrar}
            disabled={entrando}
            className="inline-flex items-center justify-center gap-3 w-full rounded-full border border-ink/15 bg-white hover:bg-ink/5 transition px-6 py-3 font-sans text-sm font-medium text-ink disabled:opacity-50"
          >
            <GoogleIcon />
            {entrando ? 'Entrando…' : 'Entrar con Google'}
          </button>

          {error && (
            <p className="font-sans text-copper text-sm mt-4">{error}</p>
          )}
        </div>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}
