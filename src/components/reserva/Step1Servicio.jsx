// Paso 1: elegir servicio.
// Layout horizontal compacto, tipo lista de opciones:
//   [01]  [icono]  Nombre + duración        Precio   ›
// El icono sale del catálogo central (lib/iconosServicio): cada servicio
// guarda el id (string) en Firestore y acá lo mapeamos al componente lucide.
// Servicios legacy sin campo `icono` reciben el default ('tag') automático
// via getIconoComponente — nunca rompe ni queda vacío.
// Tema oscuro: usa vars del sistema (--bg-hover, --border-strong, --text-*,
// --color-teal-light) para que todo lea coherente con el resto.

import StepHeader from './StepHeader'
import { formatearPrecio } from '../../lib/formato'
import { getIconoComponente } from '../../lib/iconosServicio'

export default function Step1Servicio({ pregunta, servicios, onElegir, colorAcento }) {
  return (
    <section>
      <div className="reveal-up"><StepHeader titulo={pregunta} /></div>

      <ul className="space-y-2">
        {servicios.map((s, i) => {
          const Icono = getIconoComponente(s.icono)
          return (
          <li key={s.id} className="reveal-up" style={{ animationDelay: `${0.18 + i * 0.07}s` }}>
            <button
              type="button"
              onClick={() => onElegir(s)}
              className="card-editorial group w-full text-left rounded-2xl t-surface border t-border px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)] transition-colors"
            >
              {/* 1. Número de orden — pequeño, sutil */}
              <span
                className="editorial-num t-faded text-base sm:text-lg opacity-50 min-w-[1.5rem] tabular-nums shrink-0"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* 2. Icono del servicio (24px dentro de hueco 40px, teal-light del logo) */}
              <span
                className="w-10 h-10 shrink-0 flex items-center justify-center"
                aria-hidden="true"
              >
                <Icono
                  size={24}
                  strokeWidth={1.75}
                  style={{ color: 'var(--color-teal-light)' }}
                />
              </span>

              {/* 3. Nombre (dato principal) + duración debajo */}
              <div className="flex-1 min-w-0">
                <p className="font-serif t-strong text-base sm:text-lg leading-tight lowercase first-letter:uppercase">
                  {s.nombre}
                </p>
                <p className="font-sans t-soft text-[10px] sm:text-xs mt-1 tracking-[0.18em] uppercase">
                  {s.duracionMinutos} min
                </p>
              </div>

              {/* 4. Precio — cobre claro, peso medio */}
              <p
                className="font-serif italic text-base sm:text-lg whitespace-nowrap font-medium tracking-tight shrink-0"
                style={{ color: 'var(--color-copper-light)' }}
              >
                {formatearPrecio(s.precio)}
              </p>

              {/* 5. Chevron — indica clickeable. Se ilumina y desliza un toque al hover. */}
              <span
                className="text-[var(--text-soft)] text-xl leading-none shrink-0 group-hover:text-[var(--text-strong)] group-hover:translate-x-0.5 transition-all duration-200"
                aria-hidden="true"
              >
                ›
              </span>
            </button>
          </li>
          )
        })}
      </ul>
    </section>
  )
}
