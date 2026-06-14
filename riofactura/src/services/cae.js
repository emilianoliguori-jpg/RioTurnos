// ════════════════════════════════════════════════════════════════════
// ADAPTADOR DE CAE — punto unico de integracion con AFIP.
// ════════════════════════════════════════════════════════════════════
//
// El CAE (Codigo de Autorizacion Electronico) es lo que convierte un
// comprobante en una FACTURA LEGAL. Lo otorga AFIP via el web service
// WSFEv1, previa autenticacion en WSAA firmando un ticket con el
// certificado digital X.509 de la empresa (por CUIT).
//
// Esa parte es BACKEND (no se puede hacer desde el navegador: requiere
// firmar PKCS#7 con la clave privada y llamar SOAP). Por eso esta funcion
// esta DESACOPLADA: hoy devuelve un CAE SIMULADO para que toda la app
// (numeracion, cuenta corriente, PDF, reportes) funcione de punta a punta.
//
// PARA ENCHUFAR AFIP REAL (cuando tengas certificado + CUIT):
//   1. Crear una Cloud Function `solicitarCAE` que:
//        a. Autentique en WSAA (homologacion o produccion) -> token + sign.
//        b. Llame FECAESolicitar de WSFEv1 con los datos del comprobante.
//        c. Devuelva { cae, caeVencimiento, resultado }.
//   2. Reemplazar el cuerpo de `solicitarCAE` de abajo por un fetch
//      autenticado a esa function. El resto de la app no cambia.
//
// El modo se guarda en cada comprobante (cae.modo) para distinguir
// claramente lo simulado de lo legal.

const MODO = import.meta.env.VITE_AFIP_MODO || 'simulado' // 'simulado' | 'homologacion' | 'produccion'

// Genera un CAE simulado de 14 digitos y vencimiento a 10 dias.
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

// Solicita el CAE para un comprobante ya numerado.
// `comprobante` y `empresa` se pasan completos para que la futura
// implementacion real tenga todo lo que AFIP necesita.
export async function solicitarCAE(/* { empresa, comprobante } */) {
  if (MODO === 'simulado') {
    // Pequena latencia para que la UI muestre el estado "solicitando".
    await new Promise((r) => setTimeout(r, 400))
    return caeSimulado()
  }

  // TODO: cuando exista la Cloud Function, llamar aca:
  // const res = await fetch(import.meta.env.VITE_AFIP_FUNCTION_URL, {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${await getIdToken()}` },
  //   body: JSON.stringify({ empresa, comprobante }),
  // })
  // const { cae, caeVencimiento } = await res.json()
  // return { cae, caeVencimiento, modo: MODO }
  throw new Error(
    `Modo AFIP "${MODO}" todavia no implementado. Configura VITE_AFIP_MODO=simulado o conecta la Cloud Function de WSFEv1.`
  )
}

export const modoCAE = MODO
