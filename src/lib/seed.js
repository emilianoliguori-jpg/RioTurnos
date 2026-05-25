// Datos semilla para probar la app sin tener el panel todavía.
// Inserta UN negocio de ejemplo (Estudio Bilardo, peluquería) con sus
// servicios, profesionales y horarios de atención.
//
// COMO EJECUTARLO:
//   1. Asegurate de tener el .env completo con las credenciales de Firebase.
//   2. Andá a http://localhost:5173/__seed en el navegador (ruta oculta).
//   3. Apretá el botón "Cargar datos de prueba".
//   4. Una vez que termine, ya podés visitar /estudio-bilardo para el flujo
//      de reserva.
//
// Es idempotente: podés ejecutarlo varias veces, no duplica nada porque usa
// ids fijos (setDoc con id explícito).

import { upsertNegocio } from '../services/negocios'
import { upsertServicio } from '../services/servicios'
import { upsertProfesional } from '../services/profesionales'

const NEGOCIO_ID = 'estudio-bilardo'

export async function cargarDatosDePrueba() {
  // 1. Negocio
  await upsertNegocio(NEGOCIO_ID, {
    nombre: 'Estudio Bilardo',
    slug: 'estudio-bilardo',
    rubro: 'peluqueria',
    direccion: 'Mitre 1234, Rosario',
    telefono: '+5493411234567',
    colorAcento: '#0B6E6E',
    logoUrl: '',
    aliasPago: '',
    textos: {
      bienvenida: 'Reservá tu turno en pocos pasos.',
    },
    horariosAtencion: {
      lunes:     { abre: '09:00', cierra: '19:00', cerrado: false },
      martes:    { abre: '09:00', cierra: '19:00', cerrado: false },
      miercoles: { abre: '09:00', cierra: '19:00', cerrado: false },
      jueves:    { abre: '09:00', cierra: '19:00', cerrado: false },
      viernes:   { abre: '09:00', cierra: '20:00', cerrado: false },
      sabado:    { abre: '09:00', cierra: '14:00', cerrado: false },
      domingo:   { cerrado: true },
    },
  })

  // 2. Servicios
  const servicios = [
    { id: 'corte-mujer',    nombre: 'Corte mujer',    duracionMinutos: 60, precio: 12000, activo: true },
    { id: 'corte-hombre',   nombre: 'Corte hombre',   duracionMinutos: 30, precio: 7000,  activo: true },
    { id: 'color-completo', nombre: 'Color completo', duracionMinutos: 90, precio: 25000, activo: true },
  ]
  for (const s of servicios) {
    const { id, ...datos } = s
    await upsertServicio(NEGOCIO_ID, id, datos)
  }

  // 3. Profesionales
  const profesionales = [
    { id: 'lucia', nombre: 'Lucía',  activo: true },
    { id: 'mateo', nombre: 'Mateo',  activo: true },
  ]
  for (const p of profesionales) {
    const { id, ...datos } = p
    await upsertProfesional(NEGOCIO_ID, id, datos)
  }

  return {
    ok: true,
    slug: 'estudio-bilardo',
    serviciosCreados: servicios.length,
    profesionalesCreados: profesionales.length,
  }
}
