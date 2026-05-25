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
| telefono         | string   | "+5493411234567"           | Contacto |
| colorAcento      | string   | "#0B6E6E"                  | Hex del color de marca del negocio. Aplica a botones y destacados del flujo |
| logoUrl          | string   | "https://..."              | URL del logo (opcional) |
| aliasPago        | string   | "estudio.bilardo.mp"       | Alias para pagos (se usa en otra etapa) |
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
| servicioId     | string    | "abc123" (id del doc en `/servicios`)     |
| servicioNombre | string    | "Corte mujer" (denormalizado para listar) |
| profesionalId  | string    | "xyz789"                                  |
| profesionalNombre | string | "Lucía"                                   |
| fecha          | string    | "2026-05-30" (YYYY-MM-DD, local)          |
| hora           | string    | "14:30" (HH:MM, hora local del negocio)   |
| duracionMinutos| number    | 60 (copiada del servicio al crear)        |
| estado         | string    | "pendiente" \| "confirmado" \| "cancelado"|
| datosCliente   | map       | `{ nombre, whatsapp, email }`             |
| creadoEn       | timestamp | serverTimestamp()                         |

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
