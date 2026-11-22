import { useEffect, useState, createContext, useContext } from 'react'
import { driverSupabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDriver = async (userId) => {
    const { data } = await driverSupabase
      .from('drivers')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setDriver(data ?? null)
  }

  useEffect(() => {
    driverSupabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchDriver(session.user.id)
      setLoading(false)
    })

    const { data: sub } = driverSupabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) fetchDriver(session.user.id)
      else setDriver(null)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await driverSupabase.auth.signOut()
    setDriver(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        driver,
        loading,
        signOut,
        refreshDriver: () => session?.user && fetchDriver(session.user.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
