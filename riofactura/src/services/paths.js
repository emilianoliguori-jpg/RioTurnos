// Helpers de rutas de Firestore. Toda la data de la app vive bajo
// empresas/{uid}/** para aislar cada cuenta y no chocar con Rio Turnos.

import { collection, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export const empresaRef = (uid) => doc(db, 'empresas', uid)

export const colClientes = (uid) => collection(db, 'empresas', uid, 'clientes')
export const colProveedores = (uid) => collection(db, 'empresas', uid, 'proveedores')
export const colComprobantes = (uid) => collection(db, 'empresas', uid, 'comprobantes')
export const colCompras = (uid) => collection(db, 'empresas', uid, 'compras')
export const colCobros = (uid) => collection(db, 'empresas', uid, 'cobros')
export const colPagos = (uid) => collection(db, 'empresas', uid, 'pagos')
export const colContadores = (uid) => collection(db, 'empresas', uid, 'contadores')
