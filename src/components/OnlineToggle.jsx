export default function OnlineToggle({ online, onToggle, disabled }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${
        online ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-green-500' : 'bg-slate-400'}`} />
      {online ? 'Online' : 'Offline'}
    </button>
  )
}
