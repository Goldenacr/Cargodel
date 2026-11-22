import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { driverSupabase } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await driverSupabase.auth.signInWithPassword({ email, password })
    if (authError) { setLoading(false); return setError(authError.message) }

    const { data: admin } = await driverSupabase
      .from('admins').select('id').eq('id', data.user.id).maybeSingle()

    if (!admin) {
      await driverSupabase.auth.signOut()
      setLoading(false)
      return setError('This account is not authorized to access the admin panel.')
    }

    setLoading(false)
    navigate('/admin')
  }

  const unauthorizedParam = params.get('error') === 'unauthorized'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-amber-600">
          <ShieldCheck size={22} />
          <h1 className="text-xl font-bold text-slate-800">Agribridge Admin</h1>
        </div>
        <p className="text-sm text-slate-500">Authorized personnel only.</p>
        {unauthorizedParam && (
          <p className="text-sm bg-amber-50 text-amber-700 rounded-lg p-2">
            Your session expired or you are not an admin.
          </p>
        )}
        {error && <p className="text-sm bg-red-50 text-red-700 rounded-lg p-2">{error}</p>}
        <input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none" />
        <button disabled={loading}
          className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
