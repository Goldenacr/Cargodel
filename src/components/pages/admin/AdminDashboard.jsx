import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CheckCircle2, Clock, XCircle, Ban, Wifi } from 'lucide-react'
import { driverSupabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    async function load() {
      const { data: drivers } = await driverSupabase
        .from('drivers').select('*').order('created_at', { ascending: false })
      const d = drivers ?? []
      setStats({
        total: d.length,
        pending: d.filter(x => x.verification_status === 'Pending').length,
        verified: d.filter(x => x.verification_status === 'Verified').length,
        rejected: d.filter(x => x.verification_status === 'Rejected').length,
        suspended: d.filter(x => x.is_suspended).length,
        online: d.filter(x => x.is_online && !x.is_suspended).length,
      })
      setRecent(d.slice(0, 6))
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Platform Overview</h1>
        <p className="text-sm text-slate-500">Monitor driver activity and approvals.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat icon={Users} label="Total Drivers" value={stats.total} tone="slate" />
          <Stat icon={Clock} label="Pending Review" value={stats.pending} tone="amber" />
          <Stat icon={CheckCircle2} label="Verified" value={stats.verified} tone="green" />
          <Stat icon={XCircle} label="Rejected" value={stats.rejected} tone="red" />
          <Stat icon={Ban} label="Suspended" value={stats.suspended} tone="orange" />
          <Stat icon={Wifi} label="Online Now" value={stats.online} tone="green" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-700">Latest Drivers</h2>
          <Link to="/admin/drivers" className="text-sm font-medium text-amber-600 hover:text-amber-700">View all</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recent.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No drivers yet.</p>}
          {recent.map((d) => (
            <Link key={d.id} to={`/admin/drivers/${d.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-800">{d.full_name}</p>
                <p className="text-xs text-slate-500">{d.vehicle_type} · {d.phone_number}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                d.is_suspended ? 'bg-orange-100 text-orange-700'
                : d.verification_status === 'Verified' ? 'bg-green-100 text-green-700'
                : d.verification_status === 'Rejected' ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
              }`}>
                {d.is_suspended ? 'Suspended' : d.verification_status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, tone }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className={`inline-flex p-2 rounded-xl ${tones[tone]}`}><Icon size={16} /></div>
      <p className="text-2xl font-bold text-slate-800 mt-2">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
              }
