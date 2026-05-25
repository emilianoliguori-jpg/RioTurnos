// Migración one-shot: backfillea la subcolección `slots` para todos los
// turnos existentes en todos los negocios.
//
// Cuándo correr: una sola vez, después de aplicar las reglas con la nueva
// regla de `slots`, ANTES de deployar el front-end nuevo (sino los flujos
// públicos verían "slots vacíos" → falsa disponibilidad).
//
// Cómo correr:
//   1. Reglas ya aplicadas.
//   2. npm run dev (local) — apunta al mismo Firestore de prod via .env.
//   3. Login como admin en /panel/login.
//   4. Ir a http://localhost:5174/__migrar-slots
//   5. Apretar "Correr backfill". Esperar resultado.
//
// Es idempotente: si lo corrés dos veces, el segundo run reescribe los
// mismos slots con los mismos valores. No duplica.
//
// La ruta /__migrar-slots SOLO existe en builds de desarrollo
// (import.meta.env.DEV). En producción no existe el bundle de esta página.

import { useState } from 'react'
import { collection, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getTodosLosNegocios } from '../services/negocios'
import { docRefSlot, turnoASlot } from '../services/slots'

export default function MigracionSlots() {
  const [estado, setEstado] = useState('idle') // idle | corriendo | ok | error
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [log, setLog] = useState([])

  function loguear(linea) {
    setLog((prev) => [...prev, linea])
  }

  async function correr() {
    setEstado('corriendo')
    setResultado(null)
    setError(null)
    setLog([])

    try {
      const negocios = await getTodosLosNegocios()
      loguear(`Encontrados ${negocios.length} negocios.`)

      let totalTurnos = 0
      let totalSlotsEscritos = 0

      for (const n of negocios) {
        const turnosSnap = await getDocs(collection(db, 'negocios', n.id, 'turnos'))
        if (turnosSnap.empty) {
          loguear(`  /${n.id}: sin turnos, salteo`)
          continue
        }
        loguear(`  /${n.id}: ${turnosSnap.size} turnos → escribiendo slots…`)

        // Batch por negocio. Firestore permite hasta 500 ops por batch; si
        // alguno tuviera más, dividir. Para 3 pilotos no se llega.
        const batch = writeBatch(db)
        for (const turnoDoc of turnosSnap.docs) {
          const turno = turnoDoc.data()
          const slotRef = docRefSlot(n.id, turnoDoc.id)
          batch.set(slotRef, turnoASlot(turno))
          totalTurnos++
          totalSlotsEscritos++
        }
        await batch.commit()
      }

      setResultado({ negocios: negocios.length, totalTurnos, totalSlotsEscritos })
      setEstado('ok')
      loguear(`Listo. ${totalSlotsEscritos} slots escritos en ${negocios.length} negocios.`)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError(err.message || String(err))
      setEstado('error')
    }
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-copper text-xs uppercase tracking-widest">
          Dev only — Migración
        </p>
        <h1 className="font-serif text-3xl text-ink font-light mt-2">
          Backfill de slots
        </h1>
        <p className="font-sans text-ink/60 text-sm mt-3">
          Crea un doc en <code>slots</code> por cada turno existente, con los
          campos mínimos para disponibilidad pública. Idempotente: podés
          correrlo más de una vez.
        </p>

        <button
          type="button"
          onClick={correr}
          disabled={estado === 'corriendo'}
          className="mt-6 rounded-full bg-teal text-paper px-6 py-3 font-sans text-sm font-medium disabled:opacity-50"
        >
          {estado === 'corriendo' ? 'Corriendo…' : 'Correr backfill'}
        </button>

        {log.length > 0 && (
          <pre className="mt-6 rounded-2xl border border-ink/10 bg-white p-4 font-sans text-xs text-ink/70 whitespace-pre-wrap leading-relaxed">
            {log.join('\n')}
          </pre>
        )}

        {estado === 'ok' && resultado && (
          <div className="mt-6 rounded-2xl border border-teal/40 bg-teal/5 p-5">
            <p className="font-sans text-teal font-medium">¡Listo!</p>
            <p className="font-sans text-ink/70 text-sm mt-1">
              Negocios procesados: {resultado.negocios}<br />
              Turnos leídos: {resultado.totalTurnos}<br />
              Slots escritos: {resultado.totalSlotsEscritos}
            </p>
          </div>
        )}

        {estado === 'error' && (
          <div className="mt-6 rounded-2xl border border-copper bg-copper/5 p-5">
            <p className="font-sans text-copper font-medium">Falló</p>
            <p className="font-sans text-ink/70 text-sm mt-1 break-all">{error}</p>
          </div>
        )}
      </div>
    </main>
  )
}
