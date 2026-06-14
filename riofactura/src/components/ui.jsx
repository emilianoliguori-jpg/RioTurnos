// Kit de UI minimalista y consistente para toda la app.
import { Loader2, X } from 'lucide-react'

export function Button({
  children,
  variante = 'primario',
  className = '',
  cargando = false,
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1'
  const variantes = {
    primario: 'bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand',
    accento: 'bg-accent text-white hover:opacity-90 focus-visible:ring-accent',
    secundario:
      'bg-white text-ink border border-[rgba(14,23,38,0.15)] hover:bg-[rgba(14,23,38,0.04)]',
    fantasma: 'text-ink/70 hover:bg-[rgba(14,23,38,0.06)] hover:text-ink',
    peligro: 'bg-danger text-white hover:opacity-90 focus-visible:ring-danger',
  }
  return (
    <button
      className={`${base} ${variantes[variante]} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export function Field({ label, children, hint, requerido }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink/75">
        {label} {requerido && <span className="text-danger">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/45">{hint}</span>}
    </label>
  )
}

const inputBase =
  'w-full rounded-lg border border-[rgba(14,23,38,0.15)] bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20'

export function Input({ className = '', ...props }) {
  return <input className={`${inputBase} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${inputBase} appearance-none ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${inputBase} ${className}`} {...props} />
}

export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-[rgba(14,23,38,0.08)] bg-white shadow-[0_1px_3px_rgba(14,23,38,0.06)] ${className}`}
    >
      {children}
    </div>
  )
}

export function Badge({ children, color = 'gris' }) {
  const colores = {
    gris: 'bg-[rgba(14,23,38,0.06)] text-ink/70',
    verde: 'bg-ok-soft text-ok',
    rojo: 'bg-danger-soft text-danger',
    ambar: 'bg-warn-soft text-warn',
    brand: 'bg-brand-soft text-brand-dark',
    accent: 'bg-accent-soft text-accent',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colores[color]}`}
    >
      {children}
    </span>
  )
}

export function Modal({ abierto, onClose, titulo, children, ancho = 'max-w-lg' }) {
  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
      <div className={`w-full ${ancho} rounded-2xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-[rgba(14,23,38,0.08)] px-5 py-4">
          <h3 className="font-serif text-lg font-semibold text-ink">{titulo}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink/50 hover:bg-[rgba(14,23,38,0.06)] hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Spinner({ texto = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink/50">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">{texto}</span>
    </div>
  )
}

export function VacioEstado({ icono: Icono, titulo, descripcion, accion }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(14,23,38,0.15)] py-16 text-center">
      {Icono && <Icono size={36} className="mb-3 text-ink/25" />}
      <p className="font-medium text-ink/80">{titulo}</p>
      {descripcion && (
        <p className="mt-1 max-w-sm text-sm text-ink/50">{descripcion}</p>
      )}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}

export function TituloPagina({ titulo, descripcion, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-ink/55">{descripcion}</p>}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  )
}
