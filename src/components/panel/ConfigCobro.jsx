// Sub-bloque de Configuración: cobro de reservas por transferencia manual.
// Recibe los datos desde el form padre y delega los cambios.
// El alias vive a nivel raíz del negocio (no dentro de `cobro`) por
// compatibilidad — pero lo agrupamos visualmente acá porque está ligado al
// flujo de cobro.

import CampoTexto from './CampoTexto'

export default function ConfigCobro({
  cobro,            // { activado, tipoCobro, montoSena, pagoObligatorio }
  aliasPago,
  onCambiarCobro,   // (parciales) => void
  onCambiarAlias,   // (string) => void
  errorAlias,       // string | null
}) {
  function set(campo, valor) {
    onCambiarCobro({ [campo]: valor })
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 space-y-5">
      <div>
        <h3 className="font-serif text-xl text-ink font-light">Cobro de reservas</h3>
        <p className="font-sans text-ink/50 text-xs mt-1">
          Si lo activás, el cliente paga por transferencia al reservar.
        </p>
      </div>

      {/* Toggle activado */}
      <Toggle
        label="Cobrar al reservar"
        valor={cobro.activado}
        onCambiar={(v) => set('activado', v)}
      />

      {cobro.activado && (
        <div className="space-y-5 pt-2 border-t border-ink/10">
          {/* Tipo de cobro */}
          <fieldset>
            <legend className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-2">
              Qué cobrás
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <Opcion
                seleccionada={cobro.tipoCobro === 'sena'}
                onClick={() => set('tipoCobro', 'sena')}
                titulo="Seña"
                bajada="Un monto fijo"
              />
              <Opcion
                seleccionada={cobro.tipoCobro === 'total'}
                onClick={() => set('tipoCobro', 'total')}
                titulo="Total"
                bajada="El precio del servicio"
              />
            </div>
          </fieldset>

          {/* Monto seña (solo si aplica) */}
          {cobro.tipoCobro === 'sena' && (
            <CampoTexto
              label="Monto de la seña (ARS)"
              type="number"
              min={0}
              step={500}
              value={cobro.montoSena ?? 0}
              onChange={(v) => set('montoSena', Number(v))}
              hint="Mismo valor para todos los servicios. Para señas variables, usá tipo Total."
            />
          )}

          {/* Pago obligatorio */}
          <fieldset>
            <legend className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-2">
              Modalidad
            </legend>
            <div className="grid grid-cols-1 gap-2">
              <Opcion
                seleccionada={cobro.pagoObligatorio === true}
                onClick={() => set('pagoObligatorio', true)}
                titulo="Pago obligatorio"
                bajada="El cliente no puede reservar sin transferir primero."
                alineadoIzq
              />
              <Opcion
                seleccionada={cobro.pagoObligatorio === false}
                onClick={() => set('pagoObligatorio', false)}
                titulo="Opcional"
                bajada="El cliente elige: pagar ahora por transferencia, o pagar en el local."
                alineadoIzq
              />
            </div>
          </fieldset>

          {/* Alias (vive a nivel raíz del negocio, pero se muestra acá) */}
          <CampoTexto
            label="Alias de pago"
            value={aliasPago}
            onChange={onCambiarAlias}
            placeholder="tu.alias.mp"
            required
            error={errorAlias}
            hint="El que ven los clientes al transferir. Tiene que estar cargado para activar el cobro."
          />
        </div>
      )}
    </section>
  )
}

function Toggle({ label, valor, onCambiar }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <span
        role="switch"
        aria-checked={valor}
        onClick={() => onCambiar(!valor)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            onCambiar(!valor)
          }
        }}
        tabIndex={0}
        className={`relative w-11 h-6 rounded-full transition ${
          valor ? 'bg-teal' : 'bg-ink/20'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-paper transition-transform ${
            valor ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
      <span className="font-sans text-sm text-ink">{label}</span>
    </label>
  )
}

function Opcion({ seleccionada, onClick, titulo, bajada, alineadoIzq = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={seleccionada}
      className={`rounded-2xl border px-4 py-3 transition ${
        alineadoIzq ? 'text-left' : 'text-center'
      } ${
        seleccionada
          ? 'border-teal bg-teal/5'
          : 'border-ink/15 bg-white hover:border-ink/30'
      }`}
    >
      <p className="font-sans font-medium text-ink text-sm">{titulo}</p>
      {bajada && <p className="font-sans text-ink/50 text-xs mt-0.5">{bajada}</p>}
    </button>
  )
}
