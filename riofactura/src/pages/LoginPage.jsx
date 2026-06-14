import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { Button, Input, Field, Card } from '../components/ui'

export default function LoginPage() {
  const { usuario, cargando, loginGoogle, loginEmail, registrarEmail } = useAuth()
  const [modo, setModo] = useState('login') // 'login' | 'registro'
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (!cargando && usuario) return <Navigate to="/" replace />

  async function submit(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      if (modo === 'login') await loginEmail(email, pass)
      else await registrarEmail(email, pass)
    } catch (err) {
      setError(traducirError(err?.code) || 'No se pudo iniciar sesión.')
    } finally {
      setEnviando(false)
    }
  }

  async function conGoogle() {
    setError('')
    try {
      await loginGoogle()
    } catch {
      setError('No se pudo iniciar sesión con Google.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-dark to-brand p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
            <Receipt size={24} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink">RioFactura</h1>
          <p className="mt-1 text-sm text-ink/55">
            Administración y facturación electrónica AFIP
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Email" requerido>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </Field>
          <Field label="Contraseña" requerido>
            <Input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </Field>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full" cargando={enviando}>
            {modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-ink/40">
          <span className="h-px flex-1 bg-[rgba(14,23,38,0.1)]" />o<span className="h-px flex-1 bg-[rgba(14,23,38,0.1)]" />
        </div>

        <Button variante="secundario" className="w-full" onClick={conGoogle}>
          Continuar con Google
        </Button>

        <p className="mt-5 text-center text-sm text-ink/55">
          {modo === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
          <button
            type="button"
            className="font-semibold text-brand hover:underline"
            onClick={() => {
              setModo(modo === 'login' ? 'registro' : 'login')
              setError('')
            }}
          >
            {modo === 'login' ? 'Registrate' : 'Iniciá sesión'}
          </button>
        </p>
      </Card>
    </div>
  )
}

function traducirError(code) {
  const map = {
    'auth/invalid-credential': 'Email o contraseña incorrectos.',
    'auth/user-not-found': 'No existe una cuenta con ese email.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email': 'El email no es válido.',
  }
  return map[code]
}
