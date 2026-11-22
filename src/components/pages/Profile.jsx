import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const { driver, session, signOut } = useAuth()

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <Row label="Full Name" value={driver?.full_name} />
        <Row label="Phone" value={driver?.phone_number} />
        <Row label="Email" value={session?.user?.email} />
        <Row label="Vehicle Type" value={driver?.vehicle_type} />
        <Row label="Plate Number" value={driver?.vehicle_plate_number} />
        <Row label="License Number" value={driver?.license_number} />
        <Row label="Verification" value={driver?.verification_status} />
      </div>

      <button
        onClick={signOut}
        className="w-full rounded-xl bg-red-50 py-3 font-semibold text-red-600 hover:bg-red-100"
      >
        Log Out
      </button>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium">{value ?? '—'}</span>
    </div>
  )
}
