# Poner RioFactura online — guía paso a paso

Son ~5 minutos. Al final tenés un link (ej. `https://tu-proyecto.web.app`)
para abrir la app desde cualquier dispositivo y empezar a facturar.

RioFactura se despliega de forma **independiente** de Río Turnos: tiene su
propio `firebase.json` y `.firebaserc` dentro de esta carpeta, así que un
deploy de RioFactura nunca pisa el de Río Turnos.

---

## 1. Crear (o elegir) un proyecto de Firebase

1. Entrá a https://console.firebase.google.com y creá un proyecto
   (o reusá el de Río Turnos si querés que compartan cuenta).
2. En **Compilación → Authentication → Sign-in method**, activá:
   - **Correo electrónico/contraseña**
   - **Google** (opcional, para el botón "Continuar con Google")
3. En **Compilación → Firestore Database**, creá la base (modo producción).

## 2. Conseguir las credenciales web

1. En **Configuración del proyecto (⚙) → Tus apps → Web (</>)**, registrá una
   app web. Firebase te muestra un objeto `firebaseConfig` con 6 valores.
2. En esta carpeta, copiá `.env.example` a `.env` y completá esos valores:

   ```bash
   cd riofactura
   cp .env.example .env
   # editar .env con los valores de firebaseConfig
   ```

## 3. Apuntar el deploy a tu proyecto

Editá `riofactura/.firebaserc` y reemplazá `TU_PROYECTO_FIREBASE` por el
**ID** de tu proyecto (figura en la consola de Firebase).

## 4. Subir las reglas de seguridad de Firestore

Las reglas de la colección `empresas/**` (aislamiento por usuario) ya están en
`../firestore.rules`. Desplegalas una vez:

```bash
cd ..                 # raíz del repo
firebase deploy --only firestore:rules --project TU_PROYECTO_FIREBASE
cd riofactura
```

> Si RioFactura comparte proyecto con Río Turnos, esto ya incluye ambas apps.
> Si usás un proyecto separado, igual corré este comando para ese proyecto.

## 5. Deploy 🚀

```bash
npm install -g firebase-tools   # una sola vez
firebase login                  # una sola vez
npm run deploy                  # compila + sube a Hosting
```

Al terminar, la consola te muestra la **Hosting URL**. Esa es tu app.

---

## Notas

- **CAE / factura legal:** la app arranca en modo `simulado` (CAE de prueba).
  Para emitir facturas legales hay que conectar el web service de AFIP
  (WSAA + WSFEv1) — ver `README.md`, sección "Adaptador de CAE".
- **Varios sitios en un mismo proyecto:** si querés Río Turnos y RioFactura en
  el mismo proyecto Firebase pero en URLs distintas, creá un segundo *site* en
  Hosting (`firebase hosting:sites:create riofactura`) y agregá
  `"site": "riofactura"` dentro de `hosting` en este `firebase.json`.
