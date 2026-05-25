// Valores por defecto para un negocio recién creado (vía admin manual o vía
// aprobación de solicitud). Garantizan que el flujo del dueño (panel + flujo
// público) funcione sin pisar campos esperados.
//
// Lo que define el creador (nombre, slug, rubro, plan, email) se mergea
// encima de estos defaults.

export const NEGOCIO_DEFAULTS = {
  direccion: '',
  telefono: '',
  colorAcento: '#0B6E6E',
  logoUrl: '',
  aliasPago: '',
  cobro: {
    activado: false,
    tipoCobro: 'sena',
    montoSena: 5000,
    pagoObligatorio: true,
  },
  textos: { bienvenida: '' },
  horariosAtencion: {
    lunes:     { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '19:00' }] },
    martes:    { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '19:00' }] },
    miercoles: { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '19:00' }] },
    jueves:    { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '19:00' }] },
    viernes:   { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '19:00' }] },
    sabado:    { abierto: true,  franjas: [{ horaInicio: '09:00', horaFin: '14:00' }] },
    domingo:   { abierto: false, franjas: [] },
  },
  estado: 'activo', // 'activo' | 'pausado'
}
