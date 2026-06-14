// WSFEv1 — Facturacion Electronica (web service de comprobantes).
//
// Dos operaciones que usamos:
//   - FECompUltimoAutorizado: ultimo numero autorizado para (PtoVta, CbteTipo).
//     El numero del comprobante nuevo es ese + 1. AFIP es la fuente de verdad
//     de la numeracion (no nuestra base), para no generar huecos ni choques.
//   - FECAESolicitar: pide el CAE para el comprobante.

const { XMLParser } = require('fast-xml-parser')

const ENDPOINTS = {
  homologacion: 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx',
  produccion: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx',
}

const NS = 'http://ar.gov.afip.dif.FEV1/'
const parser = new XMLParser({ ignoreAttributes: true, removeNSPrefix: true })

function buscarClave(obj, clave) {
  if (obj == null || typeof obj !== 'object') return null
  if (clave in obj) return obj[clave]
  for (const k of Object.keys(obj)) {
    const r = buscarClave(obj[k], clave)
    if (r != null) return r
  }
  return null
}

async function postSoap(modo, soapAction, body) {
  const url = ENDPOINTS[modo] || ENDPOINTS.homologacion
  const envelope =
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" ' +
    `xmlns:ar="${NS}">` +
    '<soap:Header/><soap:Body>' +
    body +
    '</soap:Body></soap:Envelope>'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `${NS}${soapAction}`,
    },
    body: envelope,
  })
  const texto = await res.text()
  if (!res.ok) throw new Error(`WSFE HTTP ${res.status}: ${texto.slice(0, 500)}`)
  return parser.parse(texto)
}

function authXml({ token, sign, cuit }) {
  return (
    '<ar:Auth>' +
    `<ar:Token>${token}</ar:Token>` +
    `<ar:Sign>${sign}</ar:Sign>` +
    `<ar:Cuit>${cuit}</ar:Cuit>` +
    '</ar:Auth>'
  )
}

// Ultimo numero autorizado. Devuelve number (0 si no hay ninguno).
async function ultimoAutorizado({ auth, modo, ptoVenta, cbteTipo }) {
  const body =
    '<ar:FECompUltimoAutorizado>' +
    authXml(auth) +
    `<ar:PtoVta>${ptoVenta}</ar:PtoVta>` +
    `<ar:CbteTipo>${cbteTipo}</ar:CbteTipo>` +
    '</ar:FECompUltimoAutorizado>'
  const obj = await postSoap(modo, 'FECompUltimoAutorizado', body)
  const errores = leerErrores(obj)
  if (errores) throw new Error(`AFIP (ultimo autorizado): ${errores}`)
  const nro = buscarClave(obj, 'CbteNro')
  return Number(nro) || 0
}

function leerErrores(obj) {
  const errs = buscarClave(obj, 'Errors')
  if (!errs) return null
  let err = buscarClave(errs, 'Err')
  if (!err) return null
  if (!Array.isArray(err)) err = [err]
  return err.map((e) => `[${e.Code}] ${e.Msg}`).join(' | ')
}

function leerObservaciones(detResp) {
  const obs = detResp?.Observaciones
  if (!obs) return []
  let arr = obs.Obs
  if (!arr) return []
  if (!Array.isArray(arr)) arr = [arr]
  return arr.map((o) => `[${o.Code}] ${o.Msg}`)
}

function fechaAfip(iso) {
  return String(iso || '').slice(0, 10).replace(/-/g, '')
}

// Construye el detalle (FECAEDetRequest) del comprobante.
function detalleXml(c, numero) {
  const esC = c.letra === 'C'
  const docTipo = c.cliente?.tipoDoc ?? 99
  const docNro = c.cliente?.nroDoc ? String(c.cliente.nroDoc) : '0'
  const condReceptor = c.cliente?.condicionIva ?? 5

  // Para comprobante C no se discrimina IVA: ImpNeto = total, ImpIVA = 0.
  const impNeto = esC ? c.total : c.netoGravado
  const impIva = esC ? 0 : c.totalIva

  let ivaXml = ''
  if (!esC && Array.isArray(c.ivaPorAlicuota) && c.ivaPorAlicuota.length) {
    ivaXml =
      '<ar:Iva>' +
      c.ivaPorAlicuota
        .map(
          (a) =>
            '<ar:AlicIva>' +
            `<ar:Id>${a.alicuotaIva}</ar:Id>` +
            `<ar:BaseImp>${a.baseImponible.toFixed(2)}</ar:BaseImp>` +
            `<ar:Importe>${a.importe.toFixed(2)}</ar:Importe>` +
            '</ar:AlicIva>'
        )
        .join('') +
      '</ar:Iva>'
  }

  return (
    '<ar:FECAEDetRequest>' +
    '<ar:Concepto>1</ar:Concepto>' + // 1 = Productos
    `<ar:DocTipo>${docTipo}</ar:DocTipo>` +
    `<ar:DocNro>${docNro}</ar:DocNro>` +
    `<ar:CbteDesde>${numero}</ar:CbteDesde>` +
    `<ar:CbteHasta>${numero}</ar:CbteHasta>` +
    `<ar:CbteFch>${fechaAfip(c.fecha)}</ar:CbteFch>` +
    `<ar:ImpTotal>${Number(c.total).toFixed(2)}</ar:ImpTotal>` +
    '<ar:ImpTotConc>0.00</ar:ImpTotConc>' +
    `<ar:ImpNeto>${Number(impNeto).toFixed(2)}</ar:ImpNeto>` +
    '<ar:ImpOpEx>0.00</ar:ImpOpEx>' +
    `<ar:ImpIVA>${Number(impIva).toFixed(2)}</ar:ImpIVA>` +
    '<ar:ImpTrib>0.00</ar:ImpTrib>' +
    '<ar:MonId>PES</ar:MonId>' +
    '<ar:MonCotiz>1</ar:MonCotiz>' +
    `<ar:CondicionIVAReceptorId>${condReceptor}</ar:CondicionIVAReceptorId>` +
    ivaXml +
    '</ar:FECAEDetRequest>'
  )
}

// Solicita el CAE. Devuelve { numero, cae, caeVencimiento, resultado, observaciones }.
async function solicitarCAE({ auth, modo, ptoVenta, cbteTipo, comprobante }) {
  // 1. Numero correlativo desde AFIP.
  const ultimo = await ultimoAutorizado({ auth, modo, ptoVenta, cbteTipo })
  const numero = ultimo + 1

  // 2. FECAESolicitar.
  const body =
    '<ar:FECAESolicitar>' +
    authXml(auth) +
    '<ar:FeCAEReq>' +
    '<ar:FeCabReq>' +
    '<ar:CantReg>1</ar:CantReg>' +
    `<ar:PtoVta>${ptoVenta}</ar:PtoVta>` +
    `<ar:CbteTipo>${cbteTipo}</ar:CbteTipo>` +
    '</ar:FeCabReq>' +
    '<ar:FeDetReq>' +
    detalleXml(comprobante, numero) +
    '</ar:FeDetReq>' +
    '</ar:FeCAEReq>' +
    '</ar:FECAESolicitar>'

  const obj = await postSoap(modo, 'FECAESolicitar', body)

  const erroresTop = leerErrores(obj)
  if (erroresTop) throw new Error(`AFIP: ${erroresTop}`)

  const resultado = buscarClave(obj, 'Resultado') // 'A' aprobado, 'R' rechazado
  const detResp = buscarClave(obj, 'FECAEDetResponse')
  const observaciones = leerObservaciones(detResp)

  if (resultado !== 'A') {
    const motivo = observaciones.length ? observaciones.join(' | ') : 'Rechazado por AFIP.'
    throw new Error(`Comprobante RECHAZADO: ${motivo}`)
  }

  return {
    numero,
    cae: detResp?.CAE ? String(detResp.CAE) : null,
    caeVencimiento: formatearVto(detResp?.CAEFchVto),
    resultado,
    observaciones,
  }
}

// "YYYYMMDD" -> "YYYY-MM-DD".
function formatearVto(yyyymmdd) {
  const s = String(yyyymmdd || '')
  if (s.length !== 8) return null
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

module.exports = { ultimoAutorizado, solicitarCAE }
