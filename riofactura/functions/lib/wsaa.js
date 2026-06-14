// WSAA — autenticacion ante AFIP.
//
// Flujo:
//   1. Se arma un "LoginTicketRequest" (XML con un id unico y una ventana
//      de validez de ~10 min).
//   2. Se firma con CMS/PKCS#7 usando el certificado + clave privada de la
//      empresa (node-forge, sin depender de openssl del sistema).
//   3. Se envia por SOAP al servicio LoginCms de AFIP.
//   4. AFIP devuelve un "token" y un "sign" validos por 12 hs, que luego
//      usa WSFEv1 para autorizar cada comprobante.
//
// El token se cachea en memoria del proceso para no re-autenticar en cada
// factura (AFIP limita la cantidad de logins por intervalo).

const forge = require('node-forge')
const { XMLParser } = require('fast-xml-parser')

const ENDPOINTS = {
  homologacion: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms',
  produccion: 'https://wsaa.afip.gov.ar/ws/services/LoginCms',
}

// Cache simple por (servicio + modo). Vive mientras la instancia este caliente.
const cache = new Map()

function isoConOffset(date) {
  // AFIP acepta ISO8601. Usamos UTC con sufijo Z.
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

function armarLoginTicketRequest(servicio) {
  const ahora = Date.now()
  const gen = new Date(ahora - 10 * 60 * 1000) // -10 min
  const exp = new Date(ahora + 10 * 60 * 1000) // +10 min
  const uniqueId = Math.floor(ahora / 1000)
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<loginTicketRequest version="1.0">' +
    '<header>' +
    `<uniqueId>${uniqueId}</uniqueId>` +
    `<generationTime>${isoConOffset(gen)}</generationTime>` +
    `<expirationTime>${isoConOffset(exp)}</expirationTime>` +
    '</header>' +
    `<service>${servicio}</service>` +
    '</loginTicketRequest>'
  )
}

// Firma CMS (PKCS#7) del XML, devuelve base64 (DER).
function firmarCMS(xml, certPem, keyPem) {
  const p7 = forge.pkcs7.createSignedData()
  p7.content = forge.util.createBuffer(xml, 'utf8')
  const cert = forge.pki.certificateFromPem(certPem)
  const key = forge.pki.privateKeyFromPem(keyPem)
  p7.addCertificate(cert)
  p7.addSigner({
    key,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date() },
    ],
  })
  p7.sign()
  const der = forge.asn1.toDer(p7.toAsn1()).getBytes()
  return forge.util.encode64(der)
}

async function llamarLoginCms(cms, modo) {
  const url = ENDPOINTS[modo] || ENDPOINTS.homologacion
  const soap =
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
    'xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">' +
    '<soapenv:Header/><soapenv:Body>' +
    `<wsaa:loginCms><wsaa:in0>${cms}</wsaa:in0></wsaa:loginCms>` +
    '</soapenv:Body></soapenv:Envelope>'

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '' },
    body: soap,
  })
  const texto = await res.text()
  if (!res.ok) {
    throw new Error(`WSAA HTTP ${res.status}: ${texto.slice(0, 500)}`)
  }
  return texto
}

function extraerLoginTicketResponse(soapResp) {
  // El loginCmsReturn viene como XML escapado dentro del SOAP.
  const parser = new XMLParser({ ignoreAttributes: true, removeNSPrefix: true })
  const obj = parser.parse(soapResp)
  // Buscamos loginCmsReturn en cualquier nivel (Body > loginCmsResponse > loginCmsReturn).
  const ret = buscarClave(obj, 'loginCmsReturn')
  if (!ret) {
    const fault = buscarClave(obj, 'faultstring')
    throw new Error(`WSAA sin loginCmsReturn. ${fault || ''} ${soapResp.slice(0, 400)}`)
  }
  const inner = parser.parse(ret)
  const cred = buscarClave(inner, 'credentials')
  const token = cred?.token
  const sign = cred?.sign
  if (!token || !sign) throw new Error('WSAA: no se pudo leer token/sign.')
  const exp = buscarClave(inner, 'expirationTime')
  return { token, sign, expira: exp ? new Date(exp).getTime() : Date.now() + 11 * 3600 * 1000 }
}

function buscarClave(obj, clave) {
  if (obj == null || typeof obj !== 'object') return null
  if (clave in obj) return obj[clave]
  for (const k of Object.keys(obj)) {
    const r = buscarClave(obj[k], clave)
    if (r != null) return r
  }
  return null
}

// Devuelve { token, sign } cacheado o nuevo.
async function getToken({ servicio = 'wsfe', modo = 'homologacion', certPem, keyPem }) {
  const key = `${servicio}:${modo}`
  const cached = cache.get(key)
  // Margen de 10 min antes del vencimiento real.
  if (cached && cached.expira - 10 * 60 * 1000 > Date.now()) {
    return { token: cached.token, sign: cached.sign }
  }
  const ltr = armarLoginTicketRequest(servicio)
  const cms = firmarCMS(ltr, certPem, keyPem)
  const resp = await llamarLoginCms(cms, modo)
  const { token, sign, expira } = extraerLoginTicketResponse(resp)
  cache.set(key, { token, sign, expira })
  return { token, sign }
}

module.exports = { getToken }
