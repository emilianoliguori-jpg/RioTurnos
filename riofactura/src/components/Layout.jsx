// Layout principal: sidebar de navegacion + topbar + contenido.
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Truck,
  ShoppingCart,
  ArrowLeftRight,
  BarChart3,
  Building2,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio', end: true },
  { to: '/facturar', icon: FileText, label: 'Facturar' },
  { to: '/comprobantes', icon: Receipt, label: 'Comprobantes' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/proveedores', icon: Truck, label: 'Proveedores' },
  { to: '/compras', icon: ShoppingCart, label: 'Compras' },
  { to: '/movimientos', icon: ArrowLeftRight, label: 'Cobros y pagos' },
  { to: '/reportes', icon: BarChart3, label: 'Reportes' },
  { to: '/empresa', icon: Building2, label: 'Mi empresa' },
]

export default function Layout({ children }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)

  async function salir() {
    await logout()
    navigate('/login')
  }

  const linkClase = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-brand text-white'
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-dark">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
          <Receipt size={20} />
        </div>
        <div className="leading-tight">
          <p className="font-serif text-lg font-semibold text-white">RioFactura</p>
          <p className="text-[11px] text-white/50">Administración & AFIP</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={linkClase}
            onClick={() => setAbierto(false)}
          >
            <n.icon size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 px-3 py-3">
        <p className="truncate px-3 py-1 text-xs text-white/50">{usuario?.email}</p>
        <button
          onClick={salir}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>

      {/* Sidebar mobile (drawer) */}
      {abierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAbierto(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64">{sidebar}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-[rgba(14,23,38,0.08)] bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setAbierto((v) => !v)}
            className="rounded-lg p-2 text-ink/70 hover:bg-[rgba(14,23,38,0.06)]"
          >
            {abierto ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-serif text-lg font-semibold">RioFactura</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
