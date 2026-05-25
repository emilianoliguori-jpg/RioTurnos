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
import { upsertUsuario } from '../services/usuarios'

const NEGOCIO_ID = 'estudio-bilardo'

// Dueño de prueba — vinculado automáticamente al negocio de ejemplo.
// Si querés probar con otro usuario, cambiá estos valores y volvé a correr el seed.
const DUENO_PRUEBA = {
  uid:   'V3fmWq47WxYNeEvnjSbTbsLlhXE2',
  email: 'emilianoliguori@gmail.com',
}

export async function cargarDatosDePrueba() {
  // 1. Negocio
  await upsertNegocio(NEGOCIO_ID, {
    nombre: 'Estudio Bilardo',
    slug: 'estudio-bilardo',
    rubro: 'peluqueria',
    plan: 'fundador',
    estado: 'activo',
    emailDuenoAutorizado: DUENO_PRUEBA.email,
    direccion: 'Mitre 1234, Rosario',
    telefono: '+5493411234567',
    colorAcento: '#0B6E6E',
    logoUrl: '',
    aliasPago: '',
    cobro: {
      activado: false,
      tipoCobro: 'sena',
      montoSena: 5000,
      pagoObligatorio: true,
    },
    textos: {
      bienvenida: 'Reservá tu turno en pocos pasos.',
    },
    horariosAtencion: {
      lunes:     { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '19:00' }] },
      martes:    { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '19:00' }] },
      miercoles: { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '19:00' }] },
      jueves:    { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '19:00' }] },
      viernes:   { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '20:00' }] },
      sabado:    { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '14:00' }] },
      domingo:   { abierto: false, franjas: [] },
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

  // 4. Vínculo dueño ↔ negocio.
  // Documento: usuarios/{uid} con { email, negociosIds: [slug] }.
  // Id = uid de Firebase Auth, así matchea con auth.currentUser.uid.
  await upsertUsuario(DUENO_PRUEBA.uid, {
    email: DUENO_PRUEBA.email,
    negociosIds: [NEGOCIO_ID],
  })

  return {
    ok: true,
    slug: 'estudio-bilardo',
    serviciosCreados: servicios.length,
    profesionalesCreados: profesionales.length,
    duenoVinculado: DUENO_PRUEBA.email,
  }
}
