// Paso 4: formulario con datos del cliente.
// Validaciones simples del lado del cliente; las reglas duras irán en
// Firestore Security Rules (próxima etapa).

import { useState } from 'react'
import StepHeader from './StepHeader'
import BotonAcento from '../BotonAcento'

export default function Step4Datos({
  onConfirmar,
  colorAcento,
  enviando,
  etiquetaBoton = 'Confirmar turno',
}) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')

  const valido =
    nombre.trim().length >= 2 &&
    whatsapp.trim().length >= 6 &&
    /^\S+@\S+\.\S+$/.test(email)

  function submit(e) {
    e.preventDefault()
    if (!valido || enviando) return
    onConfirmar({
      nombre: nombre.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
    })
  }

  const inputCls =
    'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-sans text-ink placeholder:text-ink/40 focus:outline-none focus:border-ink/40 transition'

  return (
    <section>
      <StepHeader titulo="¿A nombre de quién?" subtitulo="Para confirmarte el turno." />

      <form onSubmit={submit} className="space-y-3">
        <input
          className={inputCls}
          type="text"
          placeholder="Nombre y apellido"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="name"
        />
        <input
          className={inputCls}
          type="tel"
          placeholder="WhatsApp (ej: 3411234567)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          autoComplete="tel"
        />
        <input
          className={inputCls}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <div className="pt-4">
          <BotonAcento
            type="submit"
            disabled={!valido || enviando}
            colorAcento={colorAcento}
          >
            {enviando ? 'Confirmando…' : etiquetaBoton}
          </BotonAcento>
        </div>
      </form>
    </section>
  )
}
