import { useEffect, useState } from 'react'
import { Building2, Check } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getEmpresa, guardarEmpresa, EMPRESA_DEFAULT } from '../services/empresa'
import { CONDICIONES_EMISOR } from '../lib/afip'
import { cuitValido } from '../lib/formato'
import { modoCAE } from '../services/cae'
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  Spinner,
  TituloPagina,
  Badge,
} from '../components/ui'

export default function EmpresaPage() {
  const { usuario } = useAuth()
  const uid = usuario.uid
  const [datos, setDatos] = useState(EMPRESA_DEFAULT)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    getEmpresa(uid).then((e) => {
      if (e) setDatos({ ...EMPRESA_DEFAULT, ...e })
      setCargando(false)
    })
  }, [uid])

  function set(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }))
    setOk(false)
  }

  async function submit(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      await guardarEmpresa(uid, { ...datos, puntoVenta: Number(datos.puntoVenta) || 1 })
      setOk(true)
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <Spinner />

  const cuitMal = datos.cuit && !cuitValido(datos.cuit)

  return (
    <>
      <TituloPagina
        titulo="Mi empresa"
        descripcion="Datos fiscales del emisor. Se usan en la cabecera de cada comprobante."
      />

      <Card className="mb-4 flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
          <Building2 size={20} />
        </div>
        <div className="flex-1 text-sm text-ink/65">
          Modo de facturación AFIP:{' '}
          {modoCAE === 'simulado' ? (
            <Badge color="ambar">Simulado (CAE de prueba)</Badge>
          ) : (
            <Badge color="verde">{modoCAE}</Badge>
          )}
          <p className="mt-1 text-xs text-ink/45">
            En modo simulado los comprobantes obtienen un CAE de prueba para que
            puedas operar la administración completa. El CAE legal se habilita al
            conectar tu certificado AFIP.
          </p>
        </div>
      </Card>

      <form onSubmit={submit}>
        <Card className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Razón social" requerido>
              <Input
                value={datos.razonSocial}
                onChange={(e) => set('razonSocial', e.target.value)}
                required
              />
            </Field>
            <Field label="Nombre de fantasía">
              <Input
                value={datos.nombreFantasia}
                onChange={(e) => set('nombreFantasia', e.target.value)}
              />
            </Field>
            <Field label="CUIT" requerido hint={cuitMal ? '⚠ El CUIT no es válido' : '11 dígitos'}>
              <Input
                value={datos.cuit}
                onChange={(e) => set('cuit', e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                required
                className={cuitMal ? 'border-danger' : ''}
              />
            </Field>
            <Field label="Condición frente al IVA" requerido>
              <Select
                value={datos.condicionIva}
                onChange={(e) => set('condicionIva', e.target.value)}
              >
                {CONDICIONES_EMISOR.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Punto de venta" requerido hint="Número entero (ej. 1, 2, 3)">
              <Input
                type="number"
                min={1}
                value={datos.puntoVenta}
                onChange={(e) => set('puntoVenta', e.target.value)}
                required
              />
            </Field>
            <Field label="Ingresos Brutos">
              <Input
                value={datos.ingresosBrutos}
                onChange={(e) => set('ingresosBrutos', e.target.value)}
              />
            </Field>
            <Field label="Inicio de actividades">
              <Input
                type="date"
                value={datos.inicioActividades}
                onChange={(e) => set('inicioActividades', e.target.value)}
              />
            </Field>
            <Field label="Domicilio comercial">
              <Input
                value={datos.domicilio}
                onChange={(e) => set('domicilio', e.target.value)}
              />
            </Field>
            <Field label="Localidad">
              <Input
                value={datos.localidad}
                onChange={(e) => set('localidad', e.target.value)}
              />
            </Field>
            <Field label="Provincia">
              <Input
                value={datos.provincia}
                onChange={(e) => set('provincia', e.target.value)}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={datos.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </Field>
            <Field label="Teléfono">
              <Input
                value={datos.telefono}
                onChange={(e) => set('telefono', e.target.value)}
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 border-t border-[rgba(14,23,38,0.08)] pt-5">
            <Button type="submit" cargando={guardando}>Guardar datos</Button>
            {ok && (
              <span className="flex items-center gap-1 text-sm font-medium text-ok">
                <Check size={16} /> Guardado
              </span>
            )}
          </div>
        </Card>
      </form>
    </>
  )
}
