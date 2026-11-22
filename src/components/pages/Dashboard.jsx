import { useEffect, useRef, useState } from 'react'
import { driverSupabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import OnlineToggle from '../components/OnlineToggle'
import StatCard from '../components/StatCard'
import OrderCard from '../components/OrderCard'
import VerificationBanner from '../components/VerificationBanner'

export default function Dashboard() {
  const { driver, refreshDriver } = useAuth()
  const [availableOrders, setAvailableOrders] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [stats, setStats] = useState({ total: 0, todayEarnings: 0, completed: 0 })
  const channelRef = useRef(null)

  const isEligible = driver?.verification_status === 'Verified'
    && driver?.is_online === true
    && !driver?.is_suspended

  useEffect(() => {
    if (!isEligible) return
    driverSupabase
      .from('order_feed')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false })
      .then(({ data }) => setAvailableOrders(data ?? []))
  }, [isEligible])

  useEffect(() => {
    if (!isEligible) return
    if (channelRef.current) return

    const channel = driverSupabase
      .channel('driver-order-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_feed' },
        (payload) => {
          if (payload.new.status === 'Pending') {
            setAvailableOrders((prev) => {
              if (prev.some((o) => o.order_id === payload.new.order_id)) return prev
              return [payload.new, ...prev]
            })
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      driverSupabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [isEligible])

  const toggleOnline = async () => {
    const next = !driver.is_online
    const { error } = await driverSupabase
      .from('drivers')
      .update({ is_online: next })
      .eq('id', driver.id)
    if (!error) refreshDriver()
  }

  const handleAccept = async (order) => {
    const { data, error } = await driverSupabase.functions.invoke('accept-order', {
      body: { orderId: order.order_id },
    })
    if (error || !data?.ok) {
      alert(data?.error ?? error?.message ?? 'Could not accept order')
      return
    }
    setAvailableOrders((prev) => prev.filter((o) => o.id !== order.id))
    setActiveOrders((prev) => [data.order, ...prev])
  }

  const handleComplete = async (order) => {
    const { data, error } = await driverSupabase.functions.invoke('complete-order', {
      body: { orderId: order.order_id ?? order.id },
    })
    if (error || !data?.ok) {
      alert(data?.error ?? error?.message ?? 'Could not complete order')
      return
    }
    setActiveOrders((prev) => prev.filter((o) => o.id !== order.id))
    setStats((s) => ({
      ...s,
      total: s.total + 1,
      completed: s.completed + 1,
      todayEarnings: s.todayEarnings + Number(order.delivery_fare ?? 0),
    }))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
      <VerificationBanner driver={driver} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        {driver && (
          <OnlineToggle
            online={driver.is_online}
            onToggle={toggleOnline}
            disabled={driver.verification_status !== 'Verified' || driver.is_suspended}
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Deliveries" value={stats.total} />
        <StatCard label="Today's Earnings" value={`₦${stats.todayEarnings}`} />
        <StatCard label="Completed" value={stats.completed} />
      </div>

      {isEligible ? (
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Available Orders</h2>
          {availableOrders.length === 0 ? (
            <p className="text-sm text-slate-500 bg-white rounded-2xl border border-slate-200 p-6 text-center">
              No available orders right now. Stay online to receive new deliveries.
            </p>
          ) : (
            <div className="space-y-3">
              {availableOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAccept={() => handleAccept(order)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          You must be <strong>verified</strong> and <strong>online</strong> to see available orders.
        </div>
      )}

      {activeOrders.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Active Deliveries</h2>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                active
                onComplete={() => handleComplete(order)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
