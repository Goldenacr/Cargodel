import { Navigate } from 'react-router-dom'
import { useAdmin } from '../../hooks/useAdmin'

export default function AdminProtectedRoute({ children }) {
  const { session, isAdmin, loading } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-sm">Verifying access…</div>
      </div>
    )
  }
  if (!session) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/admin/login?error=unauthorized" replace />
  return children
}
