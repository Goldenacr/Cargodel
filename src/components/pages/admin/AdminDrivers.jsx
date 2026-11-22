import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { driverSupabase } from '../../lib/supabase'
import StatusBadge from '../../components/admin/StatusBadge'

const FILTERS = ['All', 'Pending', 'Verified', 'Rejected', 'Suspended']

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([])
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    driverSupabase.from('drivers').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setDrivers(data ?? []); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      if (filter === 'Suspended' && !d.is_suspended) return false
      if (filter !== 'All' && filter !== 'Suspended' && d.verification_status !== filter) return false
      if (query) {
        const q = query.toLowerCase()
        return d.full_name?.toLowerCase().includes(q)
          || d.phone_number?.includes(q)
          || d.vehicle_plate_number?.toLowerCase().includes(q)
      }
      return true
    })
  }, [drivers, filter, query])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Drivers</h1>
        <p className="text-sm text-slate-500">Review, verify, and manage driver accounts.</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, or plate…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:border-amber-500 focus:outline-none" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 text-sm font-medium rounded-full border ${
              filter === f ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {loading && <p className="p-6 text-center text-sm text-slate-400">Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">No drivers match your filters.</p>
        )}
        {filtered.map((d) => (
          <Link key={d.id} to={`/admin/drivers/${d.id}`} className="flex items-center gap-3 p-4 hover:bg-slate-50">
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center">
              {d.full_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate">{d.full_name}</p>
              <p className="text-xs text-slate-500 truncate">
                {d.vehicle_type} · {d.vehicle_plate_number ?? '—'} · {d.phone_number}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {d.is_online && !d.is_suspended && (
                <span className="hidden md:inline text-xs text-green-600 font-medium">● Online</span>
              )}
              <StatusBadge status={d.verification_status} suspended={d.is_suspended} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
