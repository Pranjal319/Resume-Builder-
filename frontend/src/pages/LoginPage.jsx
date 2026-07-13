import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sparkles, ArrowRight, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(location.state?.email ? 'Account created! Enter your password to sign in.' : null)
  const [loading, setLoading] = useState(false)

  const { signIn, isConfigured } = useAuth()
  const navigate = useNavigate()

  // Determine redirect destination if user was navigated here by ProtectedRoute
  const destination = location.state?.from?.pathname || '/dashboard'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2 shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back to CareerAI
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to access your resumes, recruiter review scores, and career roadmaps.
          </p>
        </div>


        {/* Configuration Notice if Supabase not configured */}
        {!isConfigured && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Supabase Production Auth</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              To enable multi-user cloud authentication, populate <code className="bg-slate-900 text-amber-300 px-1 py-0.5 rounded">frontend/.env</code>:
            </p>
            <div className="bg-slate-900/90 p-2.5 rounded text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
              VITE_SUPABASE_URL=https://your-project.supabase.co<br />
              VITE_SUPABASE_ANON_KEY=your-anon-key
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-indigo-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
