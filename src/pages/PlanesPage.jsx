// Página pública de planes — /planes
// Tres vistas internas, sin cambiar de URL:
//   - 'planes':       grilla de cards de planes
//   - 'formulario':   form de solicitud para el plan elegido
//   - 'confirmacion': mensaje final

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { planesPublicos } from '../lib/planes'
import TarjetaPlan from '../components/planes/TarjetaPlan'
import FormSolicitud from '../components/planes/FormSolicitud'
import ConfirmacionSolicitud from '../components/planes/ConfirmacionSolicitud'

export default function PlanesPage() {
  const navigate = useNavigate()
  const planes = planesPublicos()
  const [vista, setVista] = useState({ tipo: 'planes' })

  function elegirPlan(plan) {
    setVista({ tipo: 'formulario', plan })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function alEnviada({ email }) {
    setVista({ tipo: 'confirmacion', email })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-paper px-5 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto">
        {vista.tipo === 'planes' && (
          <VistaPlanes
            planes={planes}
            onElegirPlan={elegirPlan}
            onIrAInicio={() => navigate('/')}
          />
        )}
        {vista.tipo === 'formulario' && (
          <div className="max-w-2xl mx-auto">
            <FormSolicitud
              plan={vista.plan}
              onVolver={() => setVista({ tipo: 'planes' })}
              onEnviada={alEnviada}
            />
          </div>
        )}
        {vista.tipo === 'confirmacion' && (
          <div className="max-w-2xl mx-auto pt-6">
            <ConfirmacionSolicitud
              email={vista.email}
              onVolverInicio={() => navigate('/')}
            />
          </div>
        )}
      </div>
    </main>
  )
}

function VistaPlanes({ planes, onElegirPlan, onIrAInicio }) {
  return (
    <div>
      <header className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <button
          type="button"
          onClick={onIrAInicio}
          className="font-sans text-xs uppercase tracking-widest text-ink/50 hover:text-ink mb-6"
        >
          Río Turnos
        </button>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink font-light tracking-tight">
          Elegí tu plan
        </h1>
        <p className="font-sans text-ink/60 text-base sm:text-lg mt-4">
          Una mensualidad transparente, sin contratos. Cancelás cuando quieras.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-5 items-stretch sm:pt-6">
        {planes.map((p) => (
          <TarjetaPlan
            key={p.key}
            plan={p}
            destacado={!!p.destacado}
            onSuscribirse={() => onElegirPlan(p)}
          />
        ))}
      </div>

      <p className="font-sans text-ink/50 text-xs text-center mt-10 max-w-xl mx-auto">
        Hecho en Rosario. Pago por transferencia mensual. Te activamos en menos
        de 24 hs hábiles desde que verificamos tu pago.
      </p>
    </div>
  )
}
