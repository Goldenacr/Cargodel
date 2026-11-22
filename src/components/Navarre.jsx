import { Link, useNavigate } from 'react-router-dom'
import { Bell, LogOut, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { driver, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center">
            A
          </div>
          <span className="font-bold text-slate-800">Agribridge</span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-slate-800" aria-label="Notifications">
            <Bell size={20} />
          </button>
          <div className="relative group">
            <button className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 font-semibold flex items-center justify-center">
              {driver?.full_name?.[0]?.toUpperCase() ?? <User size={16} />}
            </button>
            <div className="absolute right-0 mt-1 w-40 hidden group-hover:block bg-white rounded-xl border border-slate-200 shadow-sm py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
