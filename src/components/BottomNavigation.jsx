import { Link, useLocation } from 'react-router-dom'
import { Home, Package, User } from 'lucide-react'

export default function BottomNavigation() {
  const { pathname } = useLocation()
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/orders', label: 'My Deliveries', icon: Package },
    { to: '/profile', label: 'Profile', icon: User },
  ]
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex md:hidden z-50">
      {items.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className={`flex-1 flex flex-col items-center py-2 text-xs ${
            pathname === to ? 'text-amber-600' : 'text-slate-400'
          }`}
        >
          <Icon size={20} />
          {label}
        </Link>
      ))}
    </nav>
  )
}
