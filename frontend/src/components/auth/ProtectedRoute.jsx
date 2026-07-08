import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Sparkles } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 animate-pulse flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        </div>
        <p className="mt-4 text-xs font-medium text-slate-400">
          Verifying security session...
        </p>
      </div>
    )
  }

  if (!user) {
    // Redirect unauthenticated user to login with original intended route
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
