// Página pública del flujo de reserva — /:slug
// Orquesta los pasos. Si el negocio tiene cobro activado, intercala un paso
// de pago entre los datos del cliente y la confirmación.
//
// Flujo de pasos:
//   1. servicio
//   2. profesional
//   3. fecha+hora
//   4. datos cliente
//   5. PAGO (solo si cobro activado)
//   6. confirmación (5 si no hay cobro)

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useGuestSession } from '../lib/useGuestSession'
import { getNegocioPorSlug } from '../services/negocios'
import { getServicios } from '../services/servicios'
import { getProfesionales } from '../services/profesionales'
import { crearTurno } from '../services/turnos'
import { getRubro } from '../lib/rubros'

import StepProgress from '../components/reserva/StepProgress'
import Step1Servicio from '../components/reserva/Step1Servicio'
import Step2Profesional from '../components/reserva/Step2Profesional'
import Step3Fecha from '../components/reserva/Step3Fecha'
import Step4Datos from '../components/reserva/Step4Datos'
import StepPago from '../components/reserva/StepPago'
import Step5Confirmacion from '../components/reserva/Step5Confirmacion'
import FondoAtmosfera from '../components/reserva/FondoAtmosfera'
import PoweredByRioTurnos from '../components/comun/PoweredByRioTurnos'

export default function ReservaPage() {
  const { slug } = useParams()
  // Arranca login anónimo si nadie está logueado. Necesario para que las
  // reglas permitan crear turnos y subir comprobantes al cliente público.
  useGuestSession()

  const [estadoCarga, setEstadoCarga] = useState({
    cargando: true,
    error: null,
    negocio: null,
    servicios: [],
    profesionales: [],
  })

  // Selecciones del usuario
  const [paso, setPaso] = useState(1)
  const [servicio, setServicio] = useState(null)
  const [profesional, setProfesional] = useState(null)
  const [horario, setHorario] = useState(null) // { fecha, hora }
  const [datosCliente, setDatosCliente] = useState(null)
  const [resumenFinal, setResumenFinal] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Carga inicial: negocio + servicios + profesionales
  useEffect(() => {
    async function cargar() {
      try {
        const negocio = await getNegocioPorSlug(slug)
        if (!negocio) {
          setEstadoCarga((e) => ({ ...e, cargando: false, error: 'no-encontrado' }))
          return
        }
        const [servicios, profesionales] = await Promise.all([
          getServicios(negocio.id),
          getProfesionales(negocio.id),
        ])
        setEstadoCarga({ cargando: false, error: null, negocio, servicios, profesionales })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        setEstadoCarga((e) => ({ ...e, cargando: false, error: 'firestore' }))
      }
    }
    cargar()
  }, [slug])

  // --- Estados de error y carga ---
  if (estadoCarga.cargando) {
    return (
      <Layout>
        <p className="font-sans text-ink/60 text-sm">Cargando…</p>
      </Layout>
    )
  }
  if (estadoCarga.error === 'no-encontrado') {
    return (
      <Layout>
        <p className="font-serif text-2xl text-ink">No encontramos este negocio.</p>
        <p className="font-sans text-ink/60 text-sm mt-2">
          Revisá el link que te pasaron.
        </p>
      </Layout>
    )
  }
  if (estadoCarga.error) {
    return (
      <Layout>
        <p className="font-serif text-2xl text-ink">Algo salió mal.</p>
        <p className="font-sans text-ink/60 text-sm mt-2">
          No pudimos cargar los datos. Probá refrescar la página en un rato.
        </p>
      </Layout>
    )
  }

  const { negocio, servicios, profesionales } = estadoCarga
  const rubro = getRubro(negocio.rubro)
  const colorAcento = negocio.colorAcento || '#0B6E6E'

  // Flags de cobro
  const cobroActivado = !!negocio.cobro?.activado && !!negocio.aliasPago
  const tipoCobro = negocio.cobro?.tipoCobro || 'sena'
  const pagoObligatorio = !!negocio.cobro?.pagoObligatorio
  const totalPasos = cobroActivado ? 6 : 5
  const pasoConfirmacion = cobroActivado ? 6 : 5

  // Monto a cobrar (sólo si cobroActivado)
  function montoACobrar() {
    if (!cobroActivado || !servicio) return null
    if (tipoCobro === 'total') return Number(servicio.precio) || 0
    return Number(negocio.cobro?.montoSena) || 0
  }

  // --- Handlers de avance de pasos ---
  function elegirServicio(s) {
    setServicio(s)
    setPaso(2)
  }
  function elegirProfesional(p) {
    setProfesional(p)
    setPaso(3)
  }
  function elegirHorario(h) {
    setHorario(h)
    setPaso(4)
  }

  // Step 4 → si hay cobro, ir a paso pago; si no, crear y confirmar directo.
  async function alSubmitDatos(datos) {
    setDatosCliente(datos)
    if (cobroActivado) {
      setPaso(5)
    } else {
      await crearYAvanzar(datos, 'confirmado')
    }
  }

  // Step pago — usuario apretó "Ya transferí"
  // payload puede traer { pathComprobante } si subió comprobante en la app.
  async function alConfirmarTransferencia({ pathComprobante } = {}) {
    await crearYAvanzar(datosCliente, 'pendiente_pago', { pathComprobante })
  }

  // Step pago — usuario apretó "Pagar en el local" (solo si !pagoObligatorio)
  async function alPagarEnLocal() {
    await crearYAvanzar(datosCliente, 'confirmado')
  }

  async function crearYAvanzar(datos, estadoNuevo, extra = {}) {
    setEnviando(true)
    try {
      const profAsignado = profesional.id
        ? profesional
        : profesionales[0] || { id: null, nombre: '' }

      const turno = {
        servicioId: servicio.id,
        servicioNombre: servicio.nombre,
        profesionalId: profAsignado.id,
        profesionalNombre: profAsignado.nombre,
        fecha: horario.fecha,
        hora: horario.hora,
        duracionMinutos: servicio.duracionMinutos,
        datosCliente: datos,
        estado: estadoNuevo,
      }

      // Si pasó por el flujo de pago por transferencia, sumamos los campos
      // del cobro. Si eligió pago en el local, el monto se cobra después
      // en persona — no lo registramos acá.
      if (estadoNuevo === 'pendiente_pago') {
        turno.montoCobrado = montoACobrar()
        turno.tipoCobroAplicado = tipoCobro
      }

      // Comprobante (opcional): si el cliente lo subió en la app, guardamos
      // el path. La URL se obtiene on-demand cuando el dueño lo abre.
      if (extra.pathComprobante) {
        turno.pathComprobante = extra.pathComprobante
      }

      await crearTurno(negocio.id, turno)
      setResumenFinal(turno)
      setPaso(pasoConfirmacion)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      alert('No pudimos confirmar el turno. Probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Layout colorAcento={colorAcento}>
      {/* Chrome de la página: nombre del negocio + (opcional bienvenida) + progress */}
      <header className="mb-12">
        <p className="eyebrow t-soft reveal-up">
          {negocio.nombre}
        </p>
        {paso === 1 && negocio.textos?.bienvenida && (
          <p className="font-serif t-body text-base sm:text-lg mt-3 max-w-sm italic leading-snug reveal-up delay-1">
            {negocio.textos.bienvenida}
          </p>
        )}
        <div className="mt-8 reveal-up delay-2">
          <StepProgress paso={paso} total={totalPasos} colorAcento={colorAcento} />
        </div>
      </header>

      {/* Stage del paso. key={paso} re-monta → corre stageEnter en cada cambio. */}
      <div key={paso} className="stage-enter">
        {paso === 1 && (
          <Step1Servicio
            pregunta={rubro.preguntaPaso1}
            servicios={servicios}
            onElegir={elegirServicio}
            colorAcento={colorAcento}
          />
        )}
        {paso === 2 && (
          <Step2Profesional
            pregunta={rubro.preguntaPaso2}
            profesionales={profesionales}
            onElegir={elegirProfesional}
            colorAcento={colorAcento}
            etiquetaCualquiera={`Cualquier ${rubro.profesionalSingular}`}
          />
        )}
        {paso === 3 && (
          <Step3Fecha
            negocio={negocio}
            servicio={servicio}
            profesional={profesional}
            onElegir={elegirHorario}
            colorAcento={colorAcento}
          />
        )}
        {paso === 4 && (
          <Step4Datos
            onConfirmar={alSubmitDatos}
            colorAcento={colorAcento}
            enviando={enviando && !cobroActivado}
            etiquetaBoton={cobroActivado ? 'Continuar al pago' : 'Confirmar turno'}
          />
        )}
        {cobroActivado && paso === 5 && (
          <StepPago
            negocio={negocio}
            servicio={servicio}
            horario={horario}
            monto={montoACobrar()}
            tipoCobro={tipoCobro}
            pagoObligatorio={pagoObligatorio}
            colorAcento={colorAcento}
            enviando={enviando}
            onConfirmarTransferencia={alConfirmarTransferencia}
            onPagarEnLocal={alPagarEnLocal}
          />
        )}
        {paso === pasoConfirmacion && resumenFinal && (
          <Step5Confirmacion
            negocio={negocio}
            resumen={resumenFinal}
            colorAcento={colorAcento}
          />
        )}
      </div>
    </Layout>
  )
}

// Layout con atmósfera oscura fija.
// Aplica .tema-oscuro a <main> → todas las clases t-* descendientes leen los
// valores oscuros de las CSS vars. Pasa colorAcento como var --accent para
// que cualquier descendiente pueda usarlo (floating labels, hovers, etc.).
function Layout({ children, colorAcento = '#0B6E6E' }) {
  return (
    <main
      className="tema-oscuro relative min-h-screen overflow-hidden t-app-bg"
      style={{ '--accent': colorAcento }}
    >
      <FondoAtmosfera />
      <div className="relative max-w-md mx-auto px-6 py-12 sm:py-16">
        {children}
        <PoweredByRioTurnos />
      </div>
    </main>
  )
}
