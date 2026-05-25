// Input de texto con label editorial. Reutilizable en todos los formularios
// del panel para mantener una sola fuente de estilo.

export default function CampoTexto({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = false,
  error = null,
  hint = null,
  min,
  step,
}) {
  return (
    <label className="block">
      <span className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-copper ml-1">*</span>}
      </span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(type === 'number' ? e.target.value : e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        className={`w-full rounded-xl border bg-white px-4 py-3 font-sans text-ink placeholder:text-ink/40 focus:outline-none transition ${
          error
            ? 'border-copper focus:border-copper'
            : 'border-ink/15 focus:border-ink/40'
        }`}
      />
      {hint && !error && (
        <span className="block font-sans text-ink/50 text-xs mt-1">{hint}</span>
      )}
      {error && (
        <span className="block font-sans text-copper text-xs mt-1">{error}</span>
      )}
    </label>
  )
}
