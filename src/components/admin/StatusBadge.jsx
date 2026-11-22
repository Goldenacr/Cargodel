export default function StatusBadge({ status, suspended }) {
  if (suspended) {
    return (
      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
        Suspended
      </span>
    )
  }
  const styles = {
    Verified: 'bg-green-100 text-green-700',
    Pending:  'bg-amber-100 text-amber-700',
    Rejected: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}
