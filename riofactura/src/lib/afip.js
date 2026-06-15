// Catalogo de constantes del dominio AFIP usado por toda la app.
// Codigos oficiales de AFIP (WSFEv1) para que el dia que se enchufe el
// web service real, los valores ya coincidan sin migracion de datos.

// ── Condicion del EMISOR frente al IVA ──────────────────────────────
export const CONDICIONES_EMISOR = [
  { id: 'responsable_inscripto', label: 'Responsable Inscripto' },
  { id: 'monotributo', label: 'Monotributo (Responsable Monotributo)' },
  { id: 'exento', label: 'IVA Exento' },
]

// ── Condicion del RECEPTOR frente al IVA (codigos AFIP) ─────────────
export const CONDICIONES_RECEPTOR = [
  { id: 1, label: 'IVA Responsable Inscripto' },
  { id: 6, label: 'Responsable Monotributo' },
  { id: 4, label: 'IVA Sujeto Exento' },
  { id: 5, label: 'Consumidor Final' },
  { id: 13, label: 'Monotributista Social' },
  { id: 9, label: 'Cliente del Exterior' },
]

// ── Tipo de documento del receptor (codigos AFIP) ───────────────────
export const TIPOS_DOC = [
  { id: 80, label: 'CUIT', digitos: 11 },
  { id: 86, label: 'CUIL', digitos: 11 },
  { id: 96, label: 'DNI', digitos: 8 },
  { id: 99, label: 'Consumidor Final (sin identificar)', digitos: 0 },
]

// ── Alicuotas de IVA (codigos AFIP) ─────────────────────────────────
export const ALICUOTAS_IVA = [
  { id: 5, label: '21%', tasa: 0.21 },
  { id: 4, label: '10,5%', tasa: 0.105 },
  { id: 6, label: '27%', tasa: 0.27 },
  { id: 8, label: '5%', tasa: 0.05 },
  { id: 9, label: '2,5%', tasa: 0.025 },
  { id: 3, label: '0% (No gravado / Exento)', tasa: 0 },
]

export function tasaIva(codigo) {
  return ALICUOTAS_IVA.find((a) => a.id === codigo)?.tasa ?? 0
}

// ── Tipos de comprobante (codigos AFIP) ─────────────────────────────
// "letra" agrupa para la numeracion y "clase" define el signo en la
// cuenta corriente (factura/ND suman deuda, NC resta).
export const TIPOS_COMPROBANTE = [
  { id: 1, label: 'Factura A', letra: 'A', clase: 'factura' },
  { id: 6, label: 'Factura B', letra: 'B', clase: 'factura' },
  { id: 11, label: 'Factura C', letra: 'C', clase: 'factura' },
  { id: 2, label: 'Nota de Débito A', letra: 'A', clase: 'nota_debito' },
  { id: 7, label: 'Nota de Débito B', letra: 'B', clase: 'nota_debito' },
  { id: 12, label: 'Nota de Débito C', letra: 'C', clase: 'nota_debito' },
  { id: 3, label: 'Nota de Crédito A', letra: 'A', clase: 'nota_credito' },
  { id: 8, label: 'Nota de Crédito B', letra: 'B', clase: 'nota_credito' },
  { id: 13, label: 'Nota de Crédito C', letra: 'C', clase: 'nota_credito' },
]

export function tipoComprobante(id) {
  return TIPOS_COMPROBANTE.find((t) => t.id === id) || null
}

// Signo que el comprobante aplica a la cuenta corriente del cliente:
// factura/ND aumentan la deuda (+1), NC la disminuye (-1).
export function signoCtaCte(tipoId) {
  return tipoComprobante(tipoId)?.clase === 'nota_credito' ? -1 : 1
}

// ── Que letras puede emitir cada condicion de emisor ────────────────
// RI: A (a Resp. Inscripto) y B (al resto). Monotributo/Exento: solo C.
export function letrasHabilitadas(condicionEmisor) {
  if (condicionEmisor === 'responsable_inscripto') return ['A', 'B']
  return ['C']
}

// Dado emisor + condicion del receptor, sugiere la letra correcta.
export function letraSugerida(condicionEmisor, condicionReceptor) {
  if (condicionEmisor !== 'responsable_inscripto') return 'C'
  // Solo Responsable Inscripto (1) recibe factura A.
  return condicionReceptor === 1 ? 'A' : 'B'
}

// Filtra los tipos de comprobante segun la letra habilitada + clase.
export function tiposParaLetra(letra, clase = null) {
  return TIPOS_COMPROBANTE.filter(
    (t) => t.letra === letra && (clase ? t.clase === clase : true)
  )
}

export function etiquetaCondicionReceptor(id) {
  return CONDICIONES_RECEPTOR.find((c) => c.id === id)?.label || '—'
}

export function etiquetaTipoDoc(id) {
  return TIPOS_DOC.find((t) => t.id === id)?.label || '—'
}
