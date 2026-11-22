export default function OrderCard({ order, active = false, onAccept, onComplete }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-slate-400">Order #{order.order_id?.slice(0, 8)}</p>
          <h3 className="font-semibold text-slate-800">{order.customer_name}</h3>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          active ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {active ? 'Processing' : 'Pending'}
        </span>
      </div>
      <p className="text-sm text-slate-600">
        <span className="font-medium">Pickup:</span> {order.pickup_location ?? '—'}
      </p>
      <p className="text-sm text-slate-600">
        <span className="font-medium">Deliver to:</span> {order.delivery_address}
      </p>
      <div className="flex justify-between items-center pt-2">
        <p className="text-sm font-semibold text-slate-800">
          ₦{Number(order.total_amount ?? 0).toLocaleString()}
        </p>
        {!active && onAccept && (
          <button
            onClick={onAccept}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Accept Delivery
          </button>
        )}
        {active && onComplete && (
          <button
            onClick={onComplete}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  )
}
