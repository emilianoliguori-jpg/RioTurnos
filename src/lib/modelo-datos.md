# Modelo de datos — Río Turnos (Firestore)

Modelo abstracto **recurso + servicio**. Sirve para cualquier rubro
(peluquería, consultorio, tattoo, kinesiología, etc.) sin tocar el código:
solo cambia el `rubro` del negocio y los diccionarios de `src/lib/rubros.js`
adaptan los textos.

## Estructura general

```
negocios/{negocioId}
  ├── (campos del negocio)
  ├── servicios/{servicioId}
  ├── profesionales/{profesionalId}
  └── turnos/{turnoId}
```

Cada negocio (tenant) vive en un documento de la colección `negocios`. Todas
sus entidades (servicios, profesionales, turnos) son subcolecciones suyas, lo
que garantiza aislamiento natural entre tenants — un negocio nunca lee datos
de otro.

---

## Colección `negocios`

Documento = un negocio.

| Campo            | Tipo     | Ejemplo                    | Descripción |
|------------------|----------|----------------------------|-------------|
| nombre           | string   | "Estudio Bilardo"          | Nombre comercial mostrado al cliente |
| slug             | string   | "estudio-bilardo"          | Identificador URL (`/estudio-bilardo`). Único, lowercase, sin espacios |
| rubro            | string   | "peluqueria"               | Key de `RUBROS` en `src/lib/rubros.js` |
| direccion        | string   | "Mitre 1234, Rosario"      | Mostrada al cliente en la confirmación |
| telefono         | string   | "+5493411234567"           | Contacto (formato internacional para WhatsApp) |
| colorAcento      | string   | "#0B6E6E"                  | Hex del color de marca del negocio. Aplica a botones y destacados del flujo |
| logoUrl          | string   | "https://..."              | URL del logo (opcional) |
| aliasPago        | string   | "estudio.bilardo.mp"       | Alias bancario / MP para que el cliente transfiera. Requerido si `cobro.activado = true`. |
| cobro            | map      | ver abajo                  | Configuración del cobro al reservar (manual por transferencia) |
| textos           | map      | `{ bienvenida: "..." }`    | Textos personalizables del negocio. Cualquier texto que no esté acá cae al default del rubro |
| horariosAtencion | map      | ver abajo                  | Horario por día de la semana |
| creadoEn         | timestamp| serverTimestamp()          | Fecha de alta del negocio |

### `horariosAtencion` (map)

Una entrada por día. Key = `lunes`, `martes`, ..., `domingo`.
Valor = `{ abierto: boolean, franjas: [{ horaInicio: "HH:MM", horaFin: "HH:MM" }] }`.

Múltiples franjas por día permiten **horario partido** (mañana + tarde con
descanso al mediodía). Si `abierto = false`, `franjas` se ignora.

```json
{
  "lunes":   { "abierto": true,  "franjas": [{ "horaInicio": "09:00", "horaFin": "13:00" },
                                              { "horaInicio": "16:00", "horaFin": "20:00" }] },
  "martes":  { "abierto": true,  "franjas": [{ "horaInicio": "09:00", "horaFin": "19:00" }] },
  "domingo": { "abierto": false, "franjas": [] }
}
```

> El código (`src/lib/horarios.js → normalizarDia`) acepta también el formato
> viejo `{ abre, cierra, cerrado }` y lo migra al vuelo, para que negocios
> pre-existentes sigan funcionando hasta que su dueño guarde los horarios
> desde el panel.

### `cobro` (map)

| Campo            | Tipo    | Ejemplo  | Descripción |
|------------------|---------|----------|-------------|
| activado         | boolean | `true`   | Si el negocio cobra al reservar |
| tipoCobro        | string  | "sena"   | `"sena"` (parcial fija) o `"total"` (el precio del servicio) |
| montoSena        | number  | `5000`   | En pesos. Sólo se usa si `tipoCobro === "sena"` |
| pagoObligatorio  | boolean | `true`   | Si es `false`, el cliente puede elegir "pagar en el local" y reservar sin transferir |

Si `activado = false`, el resto de los campos se ignoran y el flujo público
de reserva no pide pago (se crea el turno como `"confirmado"`).

---

## Subcolección `negocios/{id}/servicios`

| Campo            | Tipo    | Ejemplo       | Descripción |
|------------------|---------|---------------|-------------|
| nombre           | string  | "Corte mujer" | Mostrado al cliente |
| duracionMinutos  | number  | 60            | Cuánto bloquea la agenda |
| precio           | number  | 12000         | En pesos (ARS) |
| activo           | boolean | true          | Si está disponible para reservar |

---

## Subcolección `negocios/{id}/profesionales`

Representa el "recurso" que presta el servicio. Generalmente una persona,
pero podría ser una sala/box en otros rubros.

| Campo  | Tipo    | Ejemplo     |
|--------|---------|-------------|
| nombre | string  | "Lucía"     |
| activo | boolean | true        |

---

## Subcolección `negocios/{id}/turnos`

| Campo          | Tipo      | Ejemplo                                   |
|----------------|-----------|-------------------------------------------|
| servicioId            | string    | "abc123" (id del doc en `/servicios`)     |
| servicioNombre        | string    | "Corte mujer" (denormalizado para listar) |
| profesionalId         | string    | "xyz789"                                  |
| profesionalNombre     | string    | "Lucía"                                   |
| fecha                 | string    | "2026-05-30" (YYYY-MM-DD, local)          |
| hora                  | string    | "14:30" (HH:MM, hora local del negocio)   |
| duracionMinutos       | number    | 60 (copiada del servicio al crear)        |
| estado                | string    | ver "Estados del turno" abajo             |
| datosCliente          | map       | `{ nombre, whatsapp, email }`             |
| montoCobrado          | number    | 5000 — sólo si el cliente debía pagar por transferencia |
| tipoCobroAplicado     | string    | `"sena"` \| `"total"` — sólo junto a `montoCobrado` |
| pathComprobante       | string    | Path interno de Storage del comprobante subido por el cliente. La URL se obtiene on-demand desde el panel del dueño (las reglas de Storage no permiten que el cliente público lea de vuelta). |
| urlComprobante        | string    | (Sólo en registros viejos previos a la Etapa 6) URL directa del comprobante. Mantenido para compatibilidad de lectura. |
| fechaConfirmacionPago | timestamp | cuando el dueño confirma el pago desde el panel |
| creadoEn              | timestamp | serverTimestamp()                         |

### Estados del turno

| Estado            | Quién lo setea          | Bloquea el slot? | Descripción |
|-------------------|-------------------------|------------------|-------------|
| `confirmado`      | flujo público / panel    | Sí               | Reserva firme. Sin cobro pendiente. |
| `pendiente_pago`  | flujo público (transferencia) | **Sí**     | El cliente reservó, dice que transfirió, falta que el dueño verifique el comprobante. **Ocupa el horario igual** para que nadie más lo tome. |
| `atendido`        | panel (botón "Marcar atendido") | Sí       | El servicio ya se prestó. Cierra el ciclo. |
| `cancelado`       | flujo público / panel    | No               | Cancelado por el cliente o por el dueño (también se usa para "rechazar pago"). Libera el slot. |

**Por qué `fecha` y `hora` son strings** (en vez de un Timestamp): evita
problemas de zona horaria del navegador del cliente vs el negocio. La agenda
del negocio es una cuadrícula local: si el local abre a las 9, el turno de
las 9 es a las 9 del lugar, sin importar dónde esté el cliente.

---

## Reglas de seguridad (próxima etapa)

Por ahora todo es read/write abierto para poder seedear y probar. Cuando
sumemos Auth definimos reglas de Firestore para:
- Lectura pública de `negocios/*` y subcolecciones (necesario para el flujo
  de reserva sin login).
- Escritura de `turnos` permitida sin login (el cliente reserva sin cuenta),
  pero con validaciones de campos.
- Escritura del resto solo para el dueño del negocio (admin del tenant).
