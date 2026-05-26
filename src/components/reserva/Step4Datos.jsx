// Paso 4: datos del cliente.
// Inputs sin border-box, solo underline minimal. Floating labels que suben
// y toman el color de acento al focus o llenado. Estilo periódico.

import { useId, useState } from 'react'
import StepHeader from './StepHeader'

export default function Step4Datos({
  onConfirmar,
  colorAcento,
  enviando,
  etiquetaBoton = 'Confirmar turno',
}) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')

  const idNombre = useId()
  const idWhatsapp = useId()
  const idEmail = useId()

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

  return (
    <section>
      <div className="reveal-up">
        <StepHeader
          titulo="¿A nombre de quién?"
          subtitulo="Para confirmarte el turno."
        />
      </div>

      <form onSubmit={submit} className="space-y-7">
        <Campo
          id={idNombre}
          label="Nombre y apellido"
          type="text"
          value={nombre}
          onChange={setNombre}
          autoComplete="name"
          delay="delay-1"
        />
        <Campo
          id={idWhatsapp}
          label="WhatsApp"
          type="tel"
          value={whatsapp}
          onChange={setWhatsapp}
          autoComplete="tel"
          delay="delay-2"
        />
        <Campo
          id={idEmail}
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          delay="delay-3"
        />

        <div className="pt-6 reveal-up delay-4">
          <button
            type="submit"
            disabled={!valido || enviando}
            className="card-editorial w-full rounded-full px-7 py-4 font-sans text-sm font-medium tracking-wide text-paper transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: colorAcento }}
          >
            {enviando ? 'Confirmando…' : etiquetaBoton}
          </button>
        </div>
      </form>
    </section>
  )
}

// Input con floating label estilo periódico (sin border box, solo underline).
function Campo({ id, label, type, value, onChange, autoComplete, delay }) {
  return (
    <div className={`relative reveal-up ${delay}`}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder=" "
        className="float-input"
      />
      <label htmlFor={id} className="float-label">
        {label}
      </label>
    </div>
  )
}
