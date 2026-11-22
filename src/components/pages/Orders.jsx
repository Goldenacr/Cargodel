import { useEffect, useState } from 'react'
import { driverSupabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import OrderCard from '../components/OrderCard'

export default function Orders() {
  const { driver } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!driver) return
    // Query assigned orders from the feed (order_feed rows you accepted are
    // removed; but for delivery history we call the stats/orders edge function).
    // Simple MVP: show active deliveries from local state via Dashboard.
    // Full history can be fetched via a `get-my-orders` edge function later.
    setLoading(false)
  }, [driver])

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">My Deliveries</h1>
      <p className="text-sm text-slate-500">
        Your active and completed deliveries will appear here.
      </p>
      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {orders.length === 0 && !loading && (
        <p className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-400">
          No deliveries yet.
        </p>
      )}
    </div>
  )
}
