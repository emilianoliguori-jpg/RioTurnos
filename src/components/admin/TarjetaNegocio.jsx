// Card de un negocio en el listado del admin.
// Muestra resumen + plan badge con color + tracking de pago mensual.
// El toggle de "pagado este mes" sólo aparece en planes con precio > 0.

import { getRubro } from '../../lib/rubros'
import { getPlan } from '../../lib/planes'
import { etiquetaFechaCorta, mesActualKey } from '../../lib/fechas'

export default function TarjetaNegocio({ negocio, onTogglePago }) {
  const rubro = getRubro(negocio.rubro)
  const plan = getPlan(negocio.plan)
  const estado = negocio.estado || 'activo'
  const emailDueno = negocio.emailDuenoAutorizado
  const fechaAlta = negocio.creadoEn?.toDate?.()

  const mesActual = mesActualKey()
  const requierePago = !!plan && plan.precio > 0
  const alDia = negocio.ultimoPagoMes === mesActual

  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="font-serif text-xl text-ink font-light truncate">
            {negocio.nombre}
          </h3>
          <a
            href={`/${negocio.slug}`}
            target="_blank"
            rel="noreferrer noopener"
            className="font-sans text-teal text-sm hover:underline"
          >
            /{negocio.slug}
          </a>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <BadgePlan plan={plan} />
          <BadgeEstado estado={estado} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Item etiqueta="Rubro" valor={rubro?.nombre || '—'} />
        <Item
          etiqueta="Alta"
          valor={fechaAlta ? etiquetaFechaCorta(fechaAlta) : '—'}
        />
        <Item
          etiqueta="Email dueño"
          valor={emailDueno || '—'}
          className="col-span-2 break-all"
        />
      </dl>

      {requierePago && (
        <div className="mt-4 pt-4 border-t border-ink/10 flex items-center justify-between gap-3 flex-wrap">
          <p className="font-sans text-sm">
            <span className="text-ink/50">Pago {mesActual}:</span>{' '}
            <span className={alDia ? 'text-teal font-medium' : 'text-copper font-medium'}>
              {alDia ? 'Al día' : 'Pendiente'}
            </span>
          </p>
          <button
            type="button"
            onClick={() => onTogglePago(negocio, !alDia)}
            className={`rounded-full px-3 py-1.5 font-sans text-xs transition ${
              alDia
                ? 'border border-ink/15 text-ink hover:bg-ink/5'
                : 'bg-teal text-paper hover:opacity-90'
            }`}
          >
            {alDia ? 'Desmarcar' : 'Marcar pagado'}
          </button>
        </div>
      )}
    </article>
  )
}

function Item({ etiqueta, valor, className = '' }) {
  return (
    <div className={className}>
      <dt className="font-sans text-ink/50 text-[10px] uppercase tracking-wider">
        {etiqueta}
      </dt>
      <dd className="font-sans text-ink mt-0.5">{valor}</dd>
    </div>
  )
}

// Mapeo planKey → colores del badge. Reutiliza la paleta ya configurada en
// @theme (teal, ink, copper, teal-dark) — no introduce colores nuevos.
const PLAN_STYLES = {
  fundador:    { bg: 'bg-teal/15',      fg: 'text-teal'      },
  inicial:     { bg: 'bg-ink/10',       fg: 'text-ink/70'    },
  profesional: { bg: 'bg-copper/15',    fg: 'text-copper'    },
  negocio:     { bg: 'bg-teal-dark/15', fg: 'text-teal-dark' },
}

function BadgePlan({ plan }) {
  if (!plan) return null
  const s = PLAN_STYLES[plan.key] || PLAN_STYLES.inicial
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-sans whitespace-nowrap ${s.bg} ${s.fg}`}>
      {plan.nombre}
    </span>
  )
}

function BadgeEstado({ estado }) {
  const config = {
    activo:  { label: 'Activo',  bg: 'bg-teal/15',   fg: 'text-teal'   },
    pausado: { label: 'Pausado', bg: 'bg-copper/15', fg: 'text-copper' },
  }
  const c = config[estado] || config.activo
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-sans whitespace-nowrap ${c.bg} ${c.fg}`}>
      {c.label}
    </span>
  )
}
