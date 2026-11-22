import { useEffect, useState } from 'react'
import { driverSupabase } from '../lib/supabase'

export function useAdmin() {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAdmin = async (userId) => {
    const { data } = await driverSupabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    setIsAdmin(!!data)
  }

  useEffect(() => {
    driverSupabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) await checkAdmin(session.user.id)
      setLoading(false)
    })

    const { data: sub } = driverSupabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s)
      if (s?.user) await checkAdmin(s.user.id)
      else setIsAdmin(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return { session, isAdmin, loading }
}
