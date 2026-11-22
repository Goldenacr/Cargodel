import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Package, LogOut, Menu, X } from 'lucide-react'
import { driverSupabase } from '../../lib/supabase'

export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const nav = [
    { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/drivers',  label: 'Drivers',   icon: Users },
    { to: '/admin/orders',   label: 'Order Feed', icon: Package },
  ]

  const handleLogout = async () => {
    await driverSupabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200">
        <div className="p-5 border-b border-slate-200">
          <p className="text-xs font-semibold text-amber-600 tracking-wide">AGRIBRIDGE</p>
          <h1 className="text-lg font-bold text-slate-800">Admin Console</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                pathname === to ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} /> Log Out
        </button>
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-slate-200 flex items-center justify-between px-4 h-14">
        <div>
          <p className="text-[10px] font-semibold text-amber-600">AGRIBRIDGE</p>
          <p className="text-sm font-bold text-slate-800">Admin</p>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 text-slate-600">
          <Menu size={20} />
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg p-4 space-y-1">
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-slate-800">Menu</p>
              <button onClick={() => setOpen(false)} className="p-1"><X size={20} /></button>
            </div>
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  pathname === to ? 'bg-amber-50 text-amber-700' : 'text-slate-600'
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600"
            >
              <LogOut size={18} /> Log Out
            </button>
          </aside>
        </div>
      )}

      <main className="flex-1 md:ml-0 pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
