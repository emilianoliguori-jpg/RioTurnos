// Paso de pago del flujo público (solo aparece si negocio.cobro.activado).
//
// Muestra:
//   - Monto a transferir (seña o total, según config)
//   - Alias del negocio + botón "Copiar"
//   - Link de WhatsApp con mensaje pre-armado para mandar el comprobante
//   - Placeholder de la subida de comprobante (se implementa en la Parte B)
//   - Botón "Ya transferí" (siempre)
//   - Si pagoObligatorio=false: botón extra "Pagar en el local"

import { useState } from 'react'
import StepHeader from './StepHeader'
import BotonAcento from '../BotonAcento'
import SubidorComprobante from '../comun/SubidorComprobante'
import { formatearPrecio } from '../../lib/formato'

export default function StepPago({
  negocio,
  servicio,
  horario,
  monto,
  tipoCobro,        // 'sena' | 'total'
  pagoObligatorio,
  colorAcento,
  enviando,
  onConfirmarTransferencia, // ({ urlComprobante }) => void
  onPagarEnLocal,
}) {
  const [aliasCopiado, setAliasCopiado] = useState(false)
  const [comprobante, setComprobante] = useState(null) // {path} | null
  const [estadoSubida, setEstadoSubida] = useState('idle') // idle | subiendo | listo | error
  const subiendo = estadoSubida === 'subiendo'

  async function copiarAlias() {
    try {
      await navigator.clipboard.writeText(negocio.aliasPago || '')
      setAliasCopiado(true)
      setTimeout(() => setAliasCopiado(false), 1800)
    } catch {
      // navegador sin clipboard API — el cliente lo copia a mano del campo visible.
    }
  }

  const tituloMonto = tipoCobro === 'total' ? 'Pagá tu turno' : 'Pagá la seña'
  const explicacionMonto =
    tipoCobro === 'total'
      ? 'El monto total del servicio.'
      : `Una seña fija para confirmar. El resto lo pagás en ${negocio.nombre}.`

  return (
    <section>
      <StepHeader titulo={tituloMonto} subtitulo={explicacionMonto} />

      {/* Monto */}
      <div
        className="rounded-2xl p-5 text-paper text-center"
        style={{ backgroundColor: colorAcento }}
      >
        <p className="font-sans text-paper/80 text-xs uppercase tracking-widest">
          {tipoCobro === 'total' ? 'A transferir (total)' : 'A transferir (seña)'}
        </p>
        <p className="font-serif text-4xl sm:text-5xl font-light mt-1">
          {formatearPrecio(monto)}
        </p>
      </div>

      {/* Alias */}
      <div className="mt-4 rounded-2xl border border-ink/10 bg-white p-5">
        <p className="font-sans text-ink/50 text-xs uppercase tracking-wider">
          Alias para transferir
        </p>
        <p className="font-serif text-2xl text-ink font-light mt-1 break-all">
          {negocio.aliasPago}
        </p>
        <button
          type="button"
          onClick={copiarAlias}
          className="mt-3 rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink hover:bg-ink/5 transition"
        >
          {aliasCopiado ? '¡Copiado!' : 'Copiar alias'}
        </button>
      </div>

      {/* Instrucción + WhatsApp */}
      <div className="mt-4 rounded-2xl border border-ink/10 bg-white p-5 space-y-3">
        <p className="font-sans text-ink text-sm">
          Transferí ese monto al alias y después mandanos el comprobante por WhatsApp.
        </p>
        {negocio.telefono && (
          <a
            href={construirLinkWhatsapp(negocio, servicio, horario, monto)}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:bg-ink/5 transition"
          >
            <IconoWhatsapp />
            Mandar comprobante por WhatsApp
          </a>
        )}

        {/* Subida del comprobante (opcional — también pueden mandarlo por WhatsApp) */}
        <div>
          <p className="font-sans text-ink/60 text-xs uppercase tracking-wider mb-2">
            O subí el comprobante acá (opcional)
          </p>
          <SubidorComprobante
            carpeta={`comprobantes-turnos/${negocio.slug}`}
            onSubido={setComprobante}
            onCambioEstado={setEstadoSubida}
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-6 space-y-3">
        <BotonAcento
          onClick={() =>
            onConfirmarTransferencia({ pathComprobante: comprobante?.path || null })
          }
          disabled={enviando || subiendo}
          colorAcento={colorAcento}
        >
          {subiendo
            ? 'Esperando que termine la subida…'
            : enviando
            ? 'Confirmando…'
            : 'Ya transferí, confirmar reserva'}
        </BotonAcento>

        {!pagoObligatorio && (
          <BotonAcento
            onClick={onPagarEnLocal}
            disabled={enviando || subiendo}
            colorAcento={colorAcento}
            variante="fantasma"
          >
            Pagar en el local
          </BotonAcento>
        )}
      </div>

      <p className="font-sans text-ink/50 text-xs mt-4 text-center">
        {pagoObligatorio
          ? 'Tu turno queda reservado mientras verificamos el pago.'
          : 'Elegí cómo querés pagar. Tu turno queda reservado en los dos casos.'}
      </p>
    </section>
  )
}

function construirLinkWhatsapp(negocio, servicio, horario, monto) {
  const numero = String(negocio.telefono || '').replace(/[^\d]/g, '')
  const mensaje =
    `Hola! Transferí ${formatearPrecio(monto)} al alias ${negocio.aliasPago} ` +
    `para mi turno de ${servicio.nombre} el ${horario.fecha} a las ${horario.hora}. ` +
    `Te paso el comprobante.`
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

function IconoWhatsapp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
    </svg>
  )
}
