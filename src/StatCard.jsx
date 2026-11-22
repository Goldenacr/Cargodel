export default function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-800 mt-1">{value}</p>
    </div>
  )
}
