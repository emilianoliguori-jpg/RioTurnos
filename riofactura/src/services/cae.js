// ════════════════════════════════════════════════════════════════════
// ADAPTADOR DE CAE — punto unico de integracion con AFIP.
// ════════════════════════════════════════════════════════════════════
//
// El CAE (Codigo de Autorizacion Electronico) es lo que convierte un
// comprobante en una FACTURA LEGAL. Lo otorga AFIP via WSFEv1, previa
// autenticacion WSAA firmando con el certificado digital de la empresa.
//
// Esa parte corre en el BACKEND (Cloud Function `solicitarCae`, en
// functions/), porque requiere la clave privada y llamadas SOAP que no
// pueden hacerse desde el navegador.
//
// Modos (VITE_AFIP_MODO):
//   - 'simulado'  : CAE de prueba local. Sirve para operar la app sin AFIP.
//   - 'homologacion' / 'produccion' : llama a la Cloud Function real.
//
// En modo real, la FUNCTION es la fuente de verdad de la numeracion
// (la pide a AFIP), asi que devuelve { numero, cae, caeVencimiento }.

import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'

const MODO = import.meta.env.VITE_AFIP_MODO || 'simulado'

function caeSimulado() {
  let cae = ''
  for (let i = 0; i < 14; i++) cae += Math.floor(Math.random() * 10)
  const vto = new Date()
  vto.setDate(vto.getDate() + 10)
  const y = vto.getFullYear()
  const m = String(vto.getMonth() + 1).padStart(2, '0')
  const d = String(vto.getDate()).padStart(2, '0')
  return { cae, caeVencimiento: `${y}-${m}-${d}`, modo: 'simulado' }
}

// Solicita el CAE para un comprobante ya calculado.
// Devuelve { cae, caeVencimiento, modo, numero? }.
// Si trae `numero`, ese es el numero correlativo asignado por AFIP y debe
// usarse en lugar del contador local.
export async function solicitarCAE({ comprobante } = {}) {
  if (MODO === 'simulado') {
    await new Promise((r) => setTimeout(r, 400))
    return caeSimulado()
  }

  // Modo real: delega en la Cloud Function (WSAA + WSFEv1).
  const fn = httpsCallable(functions, 'solicitarCae')
  const { data } = await fn({ comprobante })
  if (!data?.cae) {
    throw new Error('AFIP no devolvió un CAE válido.')
  }
  return {
    cae: data.cae,
    caeVencimiento: data.caeVencimiento,
    numero: data.numero,
    observaciones: data.observaciones || [],
    modo: data.modo || MODO,
  }
}

export const modoCAE = MODO
