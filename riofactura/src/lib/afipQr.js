// Genera la URL del código QR oficial de AFIP (RG 4892).
// El QR codifica un JSON con los datos del comprobante, en base64, colgado
// de la URL pública de verificación de AFIP.
// Ref: https://www.afip.gob.ar/fe/qr/especificaciones.asp

export function afipQrUrl({
  fecha, // "YYYY-MM-DD"
  cuit, // emisor
  ptoVenta,
  tipoCmp, // codigo AFIP del tipo de comprobante
  nroCmp,
  importe, // total
  cae,
  tipoDocRec,
  nroDocRec,
}) {
  const data = {
    ver: 1,
    fecha: String(fecha).slice(0, 10),
    cuit: Number(String(cuit).replace(/\D/g, '')),
    ptoVta: Number(ptoVenta),
    tipoCmp: Number(tipoCmp),
    nroCmp: Number(nroCmp),
    importe: Number(Number(importe).toFixed(2)),
    moneda: 'PES',
    ctz: 1,
    tipoCodAut: 'E', // E = CAE
    codAut: Number(cae),
  }
  const doc = nroDocRec ? Number(String(nroDocRec).replace(/\D/g, '')) : 0
  if (tipoDocRec && doc) {
    data.tipoDocRec = Number(tipoDocRec)
    data.nroDocRec = doc
  }
  const base64 = btoa(JSON.stringify(data))
  return `https://www.afip.gob.ar/fe/qr/?p=${base64}`
}
