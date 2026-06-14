// Servicio: datos de la empresa emisora (empresas/{uid}).
// Es el "perfil fiscal" del usuario: razon social, CUIT, condicion IVA,
// punto de venta, domicilio. Lo necesita la facturacion para la cabecera.

import { getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { empresaRef } from './paths'

export const EMPRESA_DEFAULT = {
  razonSocial: '',
  nombreFantasia: '',
  cuit: '',
  condicionIva: 'responsable_inscripto',
  puntoVenta: 1,
  domicilio: '',
  localidad: '',
  provincia: '',
  ingresosBrutos: '',
  inicioActividades: '',
  email: '',
  telefono: '',
}

export async function getEmpresa(uid) {
  const snap = await getDoc(empresaRef(uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function guardarEmpresa(uid, datos) {
  await setDoc(
    empresaRef(uid),
    { ...datos, actualizadoEn: serverTimestamp() },
    { merge: true }
  )
}
