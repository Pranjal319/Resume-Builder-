import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { 
  Sparkles, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  FileText,
  LayoutDashboard,
  SearchCheck,
  Briefcase,
  Compass
} from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navLinkClasses = (path) => {
    const active = isActive(path)
    return `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active
        ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/25 font-semibold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border border-transparent'
    }`
  }

  const mobileLinkClasses = (path) => {
    const active = isActive(path)
    return `block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
      active
        ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/15 font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
    }`
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#090d16]/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-purple-600 dark:bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              CareerAI
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
              Career Assistant for Students
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link to="/" className={navLinkClasses('/')}>
            Home
          </Link>

          {user && (
            <>
              <Link to="/dashboard" className={navLinkClasses('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/resumes" className={navLinkClasses('/resumes')}>
                Resume Builder
              </Link>
              <Link to="/analyzer" className={navLinkClasses('/analyzer')}>
                Resume Checker
              </Link>
              <Link to="/matcher" className={navLinkClasses('/matcher')}>
                Job Matcher
              </Link>
              <Link to="/roadmap" className={navLinkClasses('/roadmap')}>
                Learning Plan
              </Link>
              <Link to="/profile" className={navLinkClasses('/profile')}>
                My Profile
              </Link>
            </>
          )}
        </nav>

        {/* Right Section: Theme Switcher & Auth */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle light/dark theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-600/40 flex items-center justify-center text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate font-medium">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs shadow-purple-600/20 transition-all hover:scale-[1.02]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 space-y-1.5 text-xs shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileLinkClasses('/')}
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClasses('/dashboard')}
              >
                Dashboard
              </Link>
              <Link
                to="/resumes"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClasses('/resumes')}
              >
                Resume Builder
              </Link>
              <Link
                to="/analyzer"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClasses('/analyzer')}
              >
                Resume Checker
              </Link>
              <Link
                to="/matcher"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClasses('/matcher')}
              >
                Job Matcher
              </Link>
              <Link
                to="/roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClasses('/roadmap')}
              >
                Learning Plan
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClasses('/profile')}
              >
                My Profile ({profile?.full_name || user.email?.split('@')[0]})
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 bg-purple-600 rounded-lg text-white font-semibold"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
