// Catálogo central de iconos elegibles por servicio.
//
// Diseño:
// - Set acotado y curado (no exponemos todo lucide-react) para que el dueño
//   elija rápido y los iconos rindan bien a tamaño chico (24px).
// - Cubre los rubros típicos de Río Turnos: estética/peluquería, salud,
//   talleres, profesionales/consultoría, fotografía, fitness, veterinaria,
//   educación. Si aparece un rubro nuevo y ninguno encaja, el dueño puede
//   usar el default ('tag') sin romper nada.
//
// Persistencia:
// - En Firestore guardamos sólo el id (string) del icono. Nunca el componente.
// - El id es estable y elegimos nombres kebab-case alineados con lucide para
//   evitar sorpresas si en el futuro reusamos el id como nombre de icono crudo.
//
// Compatibilidad hacia atrás:
// - Servicios existentes no tienen campo 'icono'. Quien renderice debe usar
//   getIconoComponente(servicio.icono) — el helper devuelve el default si el
//   id falta o no existe en el catálogo. Nunca tira error.

import {
  Tag,
  Scissors,
  Sparkles,
  Brush,
  Droplet,
  Stethoscope,
  HeartPulse,
  Wrench,
  Car,
  Scale,
  Briefcase,
  Camera,
  Dumbbell,
  GraduationCap,
  PawPrint,
} from 'lucide-react'

// Id del icono por defecto. Se usa para:
// - Servicios legacy sin campo 'icono'.
// - Servicios con un id que ya no existe en el catálogo (ej: lo sacamos
//   después de un rediseño).
// Elegido: 'tag' — neutro, sirve para cualquier rubro.
export const ICONO_DEFAULT_ID = 'tag'

// Lista ordenada de iconos disponibles. El orden manda en la grilla del panel.
// Empieza por el default + estética/peluquería (rubro más común al día de hoy),
// y baja a los rubros menos frecuentes.
export const ICONOS_SERVICIO = [
  // Genéricos
  { id: 'tag',            label: 'Genérico',     Icon: Tag },

  // Peluquería / estética
  { id: 'scissors',       label: 'Tijera',       Icon: Scissors },
  { id: 'sparkles',       label: 'Estética',     Icon: Sparkles },
  { id: 'brush',          label: 'Pincel',       Icon: Brush },
  { id: 'droplet',        label: 'Color / agua', Icon: Droplet },

  // Salud
  { id: 'stethoscope',    label: 'Consulta',     Icon: Stethoscope },
  { id: 'heart-pulse',    label: 'Kinesiología', Icon: HeartPulse },

  // Talleres / mecánica
  { id: 'wrench',         label: 'Reparación',   Icon: Wrench },
  { id: 'car',            label: 'Automotor',    Icon: Car },

  // Profesionales
  { id: 'scale',          label: 'Legal',        Icon: Scale },
  { id: 'briefcase',      label: 'Consultoría',  Icon: Briefcase },

  // Otros rubros
  { id: 'camera',         label: 'Fotografía',   Icon: Camera },
  { id: 'dumbbell',       label: 'Fitness',      Icon: Dumbbell },
  { id: 'graduation-cap', label: 'Clases',       Icon: GraduationCap },
  { id: 'paw-print',      label: 'Veterinaria',  Icon: PawPrint },
]

// Index id → entrada, construido una sola vez al cargar el módulo.
const PORID = Object.fromEntries(ICONOS_SERVICIO.map((it) => [it.id, it]))

// Devuelve el componente lucide para el id dado.
// Si el id es falsy o no existe en el catálogo, devuelve el default.
// Nunca lanza error.
export function getIconoComponente(id) {
  const entrada = (id && PORID[id]) || PORID[ICONO_DEFAULT_ID]
  return entrada.Icon
}

// Útil para el selector: indica si un id existe en el catálogo.
// Sirve para resaltar la selección actual aunque el dueño nunca haya tocado
// el campo (cae al default visualmente).
export function esIconoValido(id) {
  return Boolean(id && PORID[id])
}
