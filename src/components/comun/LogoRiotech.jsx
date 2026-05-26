// Logo horizontal de Río Tech (ícono de ondas + wordmark "Río Tech ·
// Soluciones Digitales").
//
// JERARQUÍA DE MARCA — usar este componente SOLO en superficies que ve el
// dueño del negocio o el admin. Nunca en la pantalla pública de reserva ni
// en el email al cliente final (ellos ven el negocio + "powered by Río
// Turnos", no la marca del estudio).
//
// Tamaños sugeridos:
//   - alto={28-32}  header del panel / admin
//   - alto={36-48}  hero o página de planes
//   - alto={20-24}  footer compacto

import logoUrl from '../../assets/logo-riotech-horizontal.png'

export default function LogoRiotech({
  alto = 32,
  alt = 'Río Tech',
  className = '',
}) {
  return (
    <img
      src={logoUrl}
      alt={alt}
      // height fijo + width auto preserva el aspect ratio horizontal.
      style={{ height: `${alto}px`, width: 'auto' }}
      className={`inline-block ${className}`}
    />
  )
}
