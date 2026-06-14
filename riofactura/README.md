# RioFactura

App **independiente** de administración y facturación electrónica AFIP:
emisión de comprobantes (Factura A/B/C, Notas de Crédito y Débito), clientes
y cuenta corriente, proveedores, compras, cobros y pagos, y reportes (Libro
IVA Ventas/Compras).

Vive en el mismo repositorio que Río Turnos pero **no comparte build ni
datos**: tiene su propio `package.json`, su propio Vite y escribe en
colecciones de Firestore separadas (`empresas/**`), aisladas de Río Turnos
(`negocios/**`).

## Stack

- React 19 + Vite 8
- React Router 7
- Firebase (Auth + Firestore)
- Tailwind CSS 4
- lucide-react (íconos)

## Puesta en marcha

```bash
cd riofactura
npm install
cp .env.example .env   # completar credenciales de Firebase
npm run dev
```

Podés reutilizar el **mismo proyecto Firebase** que Río Turnos (las reglas de
`empresas/**` ya están en `../firestore.rules`) o crear uno propio.

## Modelo de datos (Firestore)

```
empresas/{uid}                         ← perfil fiscal del emisor (1 por usuario)
  ├── clientes/{id}
  ├── proveedores/{id}
  ├── comprobantes/{id}                ← ventas emitidas (con CAE)
  ├── compras/{id}                     ← facturas recibidas de proveedores
  ├── cobros/{id}                      ← entradas de dinero (clientes)
  ├── pagos/{id}                       ← salidas de dinero (proveedores)
  └── contadores/{ptoVenta-tipo}       ← numeración correlativa por tipo
```

Cada usuario logueado administra **una** empresa (id del documento = su `uid`).
Las reglas de seguridad garantizan que nadie acceda a la empresa de otro.

## Facturación AFIP — adaptador de CAE

El CAE (Código de Autorización Electrónico) es lo que convierte un comprobante
en factura **legal**. Lo otorga AFIP vía el web service **WSFEv1**, previa
autenticación en **WSAA** firmando con el certificado digital X.509 de la
empresa. Eso es un proceso de **backend** (firma PKCS#7 + SOAP) que necesita el
certificado y CUIT del contribuyente.

Por eso la integración está **desacoplada** en un único archivo:
`src/services/cae.js`.

- **Hoy (modo `simulado`):** cada comprobante recibe un CAE de prueba, para que
  toda la administración (numeración, IVA, cuenta corriente, PDF, Libro IVA)
  funcione de punta a punta. Los comprobantes se marcan claramente como **no
  válidos como factura**.
- **AFIP real (ya incluido):** el conector WSAA + WSFEv1 está en `functions/`
  (Cloud Function `solicitarCae`). Para activarlo se configura el certificado,
  CUIT y modo, y se setea `VITE_AFIP_MODO=homologacion|produccion`. Pasos
  completos en `DEPLOY.md` (sección "Conectar AFIP real").

El modo se controla con la variable `VITE_AFIP_MODO`
(`simulado` | `homologacion` | `produccion`).

## Funcionalidades

- **Mi empresa:** datos fiscales del emisor (razón social, CUIT, condición IVA,
  punto de venta, domicilio, IIBB).
- **Facturar:** emisión con cálculo de IVA en vivo. La letra (A/B/C) se sugiere
  automáticamente según la condición del emisor y del receptor. Numeración
  correlativa y atómica por punto de venta + tipo. PDF imprimible.
- **Comprobantes:** listado, búsqueda y vista/PDF con formato AFIP.
- **Clientes:** ABM + cuenta corriente (debe/haber/saldo).
- **Proveedores:** ABM + cuenta corriente.
- **Compras:** registro de facturas recibidas (alimenta Libro IVA Compras).
- **Cobros y pagos:** movimientos que cancelan cuentas corrientes.
- **Reportes:** Libro IVA Ventas y Compras por período, imprimibles.
