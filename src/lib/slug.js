// Helpers de validación / saneamiento de slugs.
// Usados por el admin (alta manual) y la página pública de solicitud de alta.

export const SLUG_MIN = 3
export const SLUG_MAX = 50

// Patrón: empieza y termina con [a-z0-9], en el medio se permiten - también.
// No permite empezar ni terminar con guión (queda más prolijo en la URL).
export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

// Limpia en tiempo real lo que tipea el usuario: lowercase + sólo caracteres
// válidos. No fuerza el largo — eso lo valida la otra función.
export function limpiarSlug(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9-]/g, '')
}

// True si el slug cumple con el formato (NO chequea unicidad en Firestore).
export function slugFormatoValido(s) {
  if (!s) return false
  if (s.length < SLUG_MIN || s.length > SLUG_MAX) return false
  return SLUG_REGEX.test(s)
}
