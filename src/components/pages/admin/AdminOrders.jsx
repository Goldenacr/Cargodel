import { useEffect, useState } from 'react'
import { driverSupabase } from '../../lib/supabase'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    driverSupabase.from('order_feed').select('*')
      .order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => setOrders(data ?? []))

    const channel = driverSupabase
      .channel('admin-order-feed')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_feed' },
        (payload) => setOrders((prev) => [payload.new, ...prev])
      )
      .subscribe()

    return () => { driverSupabase.removeChannel(channel) }
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Order Feed</h1>
        <p className="text-sm text-slate-500">
          Recent orders relayed from the Agribridge store. Full order lifecycle is managed in the existing Agribridge Admin.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {orders.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">No orders in the feed yet.</p>
        )}
        {orders.map((o) => (
          <div key={o.id} className="p-4 flex justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400">#{o.order_id?.slice(0, 8)}</p>
              <p className="font-medium text-slate-800">{o.customer_name}</p>
              <p className="text-xs text-slate-500">{o.delivery_address}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">
                ₦{Number(o.total_amount ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                Fee: ₦{Number(o.delivery_fare ?? 0).toLocaleString()}
              </p>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {o.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
