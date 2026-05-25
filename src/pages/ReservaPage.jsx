// Página pública del flujo de reserva — /:slug
// Es la orquestadora: carga datos del negocio, mantiene el estado del flujo
// (paso actual + elecciones del usuario), y monta el step correspondiente.
//
// Los textos de los pasos 1 y 2 salen del diccionario de rubro del negocio.
// El color de acento sale del campo colorAcento del negocio.
// Nada está hardcodeado.

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

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
import Step5Confirmacion from '../components/reserva/Step5Confirmacion'

export default function ReservaPage() {
  const { slug } = useParams()

  const [estado, setEstado] = useState({
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
  const [resumenFinal, setResumenFinal] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Carga inicial: negocio + servicios + profesionales
  useEffect(() => {
    async function cargar() {
      try {
        const negocio = await getNegocioPorSlug(slug)
        if (!negocio) {
          setEstado((e) => ({ ...e, cargando: false, error: 'no-encontrado' }))
          return
        }
        const [servicios, profesionales] = await Promise.all([
          getServicios(negocio.id),
          getProfesionales(negocio.id),
        ])
        setEstado({ cargando: false, error: null, negocio, servicios, profesionales })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        setEstado((e) => ({ ...e, cargando: false, error: 'firestore' }))
      }
    }
    cargar()
  }, [slug])

  // --- Estados de error y carga ---
  if (estado.cargando) {
    return (
      <Layout>
        <p className="font-sans text-ink/60 text-sm">Cargando…</p>
      </Layout>
    )
  }
  if (estado.error === 'no-encontrado') {
    return (
      <Layout>
        <p className="font-serif text-2xl text-ink">No encontramos este negocio.</p>
        <p className="font-sans text-ink/60 text-sm mt-2">
          Revisá el link que te pasaron.
        </p>
      </Layout>
    )
  }
  if (estado.error) {
    return (
      <Layout>
        <p className="font-serif text-2xl text-ink">Algo salió mal.</p>
        <p className="font-sans text-ink/60 text-sm mt-2">
          No pudimos cargar los datos. Probá refrescar la página en un rato.
        </p>
      </Layout>
    )
  }

  const { negocio, servicios, profesionales } = estado
  const rubro = getRubro(negocio.rubro)
  const colorAcento = negocio.colorAcento || '#0B6E6E'

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

  async function confirmar(datosCliente) {
    setEnviando(true)
    try {
      // Si eligió "cualquiera", asignamos el primer profesional activo.
      // (Versión simple. En el futuro podríamos elegir el que tenga el slot
      // libre exactamente; por ahora alcanza con el primero, dado que el
      // Step3 ya filtró por disponibilidad real.)
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
        datosCliente,
      }
      await crearTurno(negocio.id, turno)
      setResumenFinal(turno)
      setPaso(5)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      alert('No pudimos confirmar el turno. Probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Layout>
      <div className="mb-8">
        <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
          {negocio.nombre}
        </p>
        <StepProgress paso={paso} total={5} colorAcento={colorAcento} />
      </div>

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
          onConfirmar={confirmar}
          colorAcento={colorAcento}
          enviando={enviando}
        />
      )}
      {paso === 5 && resumenFinal && (
        <Step5Confirmacion
          negocio={negocio}
          resumen={resumenFinal}
          colorAcento={colorAcento}
        />
      )}
    </Layout>
  )
}

function Layout({ children }) {
  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-md mx-auto">{children}</div>
    </main>
  )
}
