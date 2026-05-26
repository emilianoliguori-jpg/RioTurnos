// Pantalla final del flujo de solicitud.
// El admin recibe la solicitud, verifica el pago, aprueba (Bloque 3),
// y entonces el dueño puede loguearse en /panel.

import LogoRiotech from '../comun/LogoRiotech'

export default function ConfirmacionSolicitud({ email, onVolverInicio }) {
  return (
    <div className="text-center">
      <LogoRiotech alto={28} className="opacity-80 mb-8" />
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto bg-teal"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5F1EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl text-ink font-light tracking-tight">
        ¡Recibimos tu solicitud!
      </h1>
      <p className="font-sans text-ink/70 text-base mt-4 max-w-md mx-auto">
        En cuanto verifiquemos el pago activamos tu cuenta y te avisamos por
        WhatsApp y a <strong className="text-ink">{email}</strong>.
      </p>
      <p className="font-sans text-ink/50 text-sm mt-2">
        Generalmente menos de 24 hs hábiles.
      </p>

      <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-5 text-left max-w-md mx-auto">
        <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
          Qué sigue
        </p>
        <ol className="mt-3 space-y-2 font-sans text-ink text-sm">
          <li>1. Verificamos tu comprobante (≤ 24 hs hábiles).</li>
          <li>2. Activamos tu cuenta y te avisamos.</li>
          <li>3. Entrás a <code className="text-teal">/panel/login</code> con la cuenta de Google del email que usaste, y empezás a cargar tus servicios y horarios.</li>
        </ol>
      </div>

      {onVolverInicio && (
        <div className="mt-8">
          <button
            type="button"
            onClick={onVolverInicio}
            className="font-sans text-sm text-ink/60 hover:text-ink underline"
          >
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  )
}
