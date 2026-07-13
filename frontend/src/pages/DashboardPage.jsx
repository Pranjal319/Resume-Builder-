import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { RadialGauge, MetricBar } from '../components/dashboard/DashboardCharts'
import { 
  LayoutDashboard, 
  FileText, 
  SearchCheck, 
  Briefcase, 
  Compass, 
  Bot, 
  Settings, 
  TrendingUp, 
  UploadCloud, 
  Sparkles, 
  Lock, 
  Layers,
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Edit3,
  Plus,
  ArrowRight,
  Download,
  AlertCircle,
  XCircle,
  Tag,
  Check,
  X,
  Code2,
  Calendar,
  Zap
} from 'lucide-react'

export default function DashboardPage() {
  const { user, profile, session, signOut } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summaryData, setSummaryData] = useState(null)

  // Fetch unified dashboard analytics
  const fetchDashboardStats = async () => {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      const res = await fetch('/api/dashboard/summary', { headers })
      if (!res.ok) throw new Error('Failed to load dashboard summary')
      const data = await res.json()
      setSummaryData(data)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Could not connect to dashboard analytics service.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [user, session])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'resumes', label: 'My Resumes', icon: FileText, count: summaryData?.resume_count },
    { id: 'analyzer', label: 'Resume Review', icon: SearchCheck, score: summaryData?.latest_ats_analysis?.overall_score },
    { id: 'matcher', label: 'Job Matcher', icon: Briefcase, count: summaryData?.job_matches_count },
    { id: 'roadmap', label: 'Learning Plan', icon: Compass, progress: summaryData?.active_roadmap?.progress_percentage },
    { id: 'profile', label: 'My Profile', icon: User, percent: summaryData?.profile_completeness },
  ]

  const careerChecklist = [
    { title: "Complete your profile", desc: "Add your target role, contact info, and current skill set", done: Boolean(profile?.full_name), link: "/profile" },
    { title: "Build or customize your resume", desc: "Craft your resume sections with professional formatting", done: Boolean(summaryData?.resume_count > 0), link: "/resumes" },
    { title: "Check your resume score", desc: "Get an instant review and suggestions for improvement", done: Boolean(summaryData?.latest_ats_analysis), link: "/analyzer" },
    { title: "Compare against target jobs", desc: "Test keyword and skill alignment with job postings", done: Boolean(summaryData?.job_matches_count > 0), link: "/matcher" },
    { title: "Follow your learning plan", desc: "Master missing skills step-by-step", done: Boolean(summaryData?.active_roadmap), link: "/roadmap" },
  ]

  // Skeletons when loading
  if (loading && !summaryData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const {
    profile_completeness = 80,
    resume_strength_score = 0,
    resume_count = 0,
    recent_resumes = [],
    latest_ats_analysis = null,
    job_matches_count = 0,
    best_job_match = null,
    top_missing_skills = [],
    active_roadmap = null,
    interview_readiness_score = 65,
  } = summaryData || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Student'} 👋
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Account Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Target Role: <span className="text-indigo-400 font-semibold">{profile?.target_role || 'Software Engineer'}</span> • Logged in as <span className="text-slate-300 font-mono text-xs">{user?.email}</span>
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/resumes"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Resume</span>
          </Link>

          <Link
            to="/analyzer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
          >
            <SearchCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Check Score</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
            title="Sign out of platform"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchDashboardStats} className="text-rose-300 font-bold hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Navigation Sidebar (3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-2.5 rounded-2xl border border-slate-800 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isSelected = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {/* Dynamic Indicators */}
                  {typeof item.score === 'number' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono text-emerald-400 border border-slate-800">
                      {item.score}%
                    </span>
                  )}
                  {typeof item.progress === 'number' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono text-indigo-300 border border-slate-800">
                      {item.progress}%
                    </span>
                  )}
                  {typeof item.count === 'number' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono text-slate-300 border border-slate-800">
                      {item.count}
                    </span>
                  )}
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Profile Readiness Mini-Card */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Profile Completeness</span>
              <span className="text-xs font-bold text-white">{profile_completeness}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${profile_completeness}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <Link
              to="/profile"
              className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Edit candidate profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </aside>

        {/* Right Content Area (9 cols) */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW - STUDENT FOCUS */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Dedicated Recommended Next Step Card */}
              <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-purple-200 dark:border-purple-500/25 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                    Recommended Next Step
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {resume_count === 0
                      ? "You haven't created a resume yet."
                      : !latest_ats_analysis
                      ? "Your resume is ready for review."
                      : latest_ats_analysis.overall_score < 75
                      ? "A few changes could make your resume stronger."
                      : job_matches_count === 0
                      ? "Your resume is strong! Next, check how it fits a job."
                      : "Continue following your 30-day learning plan."}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {resume_count === 0
                      ? "Create your first resume and we'll help you build it step by step with relevant questions."
                      : !latest_ats_analysis
                      ? "Get an instant review score and see what recruiters are looking for in your target role."
                      : latest_ats_analysis.overall_score < 75
                      ? "Add your project results and measurable achievements before you start applying."
                      : job_matches_count === 0
                      ? "Paste a job description to see what you already have and what you may need."
                      : "Check off your weekly skills to prepare for upcoming internship and job interviews."}
                  </p>
                </div>
                
                <Link
                  to={
                    resume_count === 0
                      ? "/resumes"
                      : !latest_ats_analysis || latest_ats_analysis.overall_score < 75
                      ? "/analyzer"
                      : job_matches_count === 0
                      ? "/matcher"
                      : "/roadmap"
                  }
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shrink-0 shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
                >
                  {resume_count === 0
                    ? "Create Resume →"
                    : !latest_ats_analysis
                    ? "Check Score →"
                    : latest_ats_analysis.overall_score < 75
                    ? "Improve My Resume →"
                    : job_matches_count === 0
                    ? "Check a Job →"
                    : "View Plan →"}
                </Link>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. "Your Resume" Status Card */}
                <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Your Resume</span>
                      <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">
                        {resume_count > 0 ? `${resume_count} resume${resume_count > 1 ? 's' : ''} saved` : 'Ready to build'}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                      {latest_ats_analysis
                        ? `Your resume is ${latest_ats_analysis.overall_score}% ready`
                        : resume_count > 0
                        ? 'Resume created! Ready to check score'
                        : "You haven't created a resume yet"}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1.5 leading-relaxed">
                      {latest_ats_analysis
                        ? latest_ats_analysis.overall_score >= 80
                          ? 'Great job! Your resume looks strong and is ready to send to recruiters.'
                          : 'Good start. A few changes could make your resume clearer and more relevant.'
                        : 'Build a clean, professional resume step by step using your actual experience.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    {recent_resumes.length > 0 ? (
                      <>
                        <Link
                          to={`/resumes/${recent_resumes[0].id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Resume</span>
                        </Link>
                        <Link
                          to="/analyzer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#111827] hover:bg-slate-200 dark:hover:bg-[#222B3D] text-slate-700 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#2A3345] font-semibold text-xs transition-colors"
                        >
                          <SearchCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>Check Score</span>
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/resumes"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Your First Resume</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* 2. "Improve Your Resume" - Top 3 Things to make it stronger */}
                <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Improve Your Resume</span>
                      <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">Quick Suggestions</span>
                    </div>

                    <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                      3 things can make your resume stronger
                    </h3>

                    <ul className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-[#CBD5E1]">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">1</span>
                        <span>Add measurable results to your project descriptions (e.g. &ldquo;used by 50 students&rdquo; or &ldquo;boosted speed by 20%&rdquo;).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">2</span>
                        <span>Include 2–3 key skills mentioned in your target job role (like Docker or REST APIs).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">3</span>
                        <span>Keep your &ldquo;About You&rdquo; statement short, honest, and role-focused.</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    to="/analyzer"
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5 pt-2"
                  >
                    <span>View full review suggestions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

              {/* Question 3 & 4: Which jobs suit me? & What skills am I missing? */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 3. "Find Suitable Jobs" */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Find Suitable Jobs</span>
                      <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>

                    <h4 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                      See how well your resume matches a job
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                      {best_job_match
                        ? `Your resume is a ${best_job_match.match_score}% match for ${best_job_match.job_title} at ${best_job_match.company_name}.`
                        : 'Paste any job posting to see what skills you already have and what you might be missing before applying.'}
                    </p>

                    {best_job_match && (
                      <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/20 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">{best_job_match.job_title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-[#94A3B8]">{best_job_match.company_name}</div>
                        </div>
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2.5 py-1 rounded-lg">
                          {best_job_match.match_score}% Match 🎯
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/matcher"
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#111827] hover:bg-slate-200 dark:hover:bg-[#222B3D] text-slate-800 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#2A3345] text-xs font-semibold text-center transition-colors block"
                  >
                    Check a Job Match →
                  </Link>
                </div>

                {/* 4. "Skills to Learn" */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Skills to Learn</span>
                      <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <h4 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                      {top_missing_skills.length > 0
                        ? `You're missing ${top_missing_skills.length} skills for your target role`
                        : 'Skills for your target role'}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                      Learning these skills will make your application stand out for <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">{profile?.target_role || 'your target role'}</span>:
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {(top_missing_skills.length > 0 ? top_missing_skills : [
                        { name: 'Docker', priority: 'High' },
                        { name: 'TypeScript', priority: 'High' },
                        { name: 'REST APIs', priority: 'Medium' },
                        { name: 'SQL & Databases', priority: 'Medium' }
                      ]).slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
                        >
                          <span>{typeof skill === 'string' ? skill : skill.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    to="/roadmap"
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#111827] hover:bg-slate-200 dark:hover:bg-[#222B3D] text-slate-800 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#2A3345] text-xs font-semibold text-center transition-colors block"
                  >
                    See Your Learning Plan →
                  </Link>
                </div>

              </div>

              {/* Action Center */}
              <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] space-y-4 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                    What should I do next?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-0.5">
                    Pick any step below to move your job search forward:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  
                  {/* Step 1 */}
                  <Link
                    to="/resumes"
                    className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#222B3D] border border-slate-200 dark:border-[#2A3345] hover:border-purple-300 dark:hover:border-purple-500/40 transition-all group space-y-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                      📝
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      1. Build or Edit Resume
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                      Create a field-specific resume tailored to the exact role you want.
                    </p>
                  </Link>

                  {/* Step 2 */}
                  <Link
                    to="/matcher"
                    className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#222B3D] border border-slate-200 dark:border-[#2A3345] hover:border-blue-300 dark:hover:border-blue-500/40 transition-all group space-y-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                      🎯
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      2. Match with Real Jobs
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                      Compare your resume against any job posting to see how you stack up.
                    </p>
                  </Link>

                  {/* Step 3 */}
                  <Link
                    to="/roadmap"
                    className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#222B3D] border border-slate-200 dark:border-[#2A3345] hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all group space-y-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                      🚀
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                      3. Learn Missing Skills
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                      Follow a simple week-by-week checklist to learn the skills you need.
                    </p>
                  </Link>

                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: RESUMES SECTION */}
          {/* ========================================================================= */}
          {activeTab === 'resumes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">My Resumes</h3>
                  <p className="text-xs text-slate-400">Total Resumes: {resume_count}</p>
                </div>
                <Link
                  to="/resumes"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Resume</span>
                </Link>
              </div>

              {recent_resumes.length === 0 ? (
                <div className="p-12 text-center glass-panel rounded-2xl border border-dashed border-slate-800 space-y-3">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">No resumes found in your workspace.</p>
                  <Link to="/resumes" className="inline-block text-xs font-bold text-indigo-400 hover:underline">
                    + Build your first targeted resume
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recent_resumes.map((r) => (
                    <div key={r.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 capitalize">
                          <span>{r.template_id?.replace('-', ' ')}</span>
                          <span>Updated {new Date(r.updated_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-base font-bold text-white line-clamp-1">{r.title}</h4>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                        <Link
                          to={`/resumes/${r.id}`}
                          className="inline-flex items-center gap-1 text-indigo-400 hover:underline font-semibold"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Open Builder</span>
                        </Link>
                        <Link
                          to={`/resumes/${r.id}`}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Export PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: RESUME ANALYSIS SECTION */}
          {/* ========================================================================= */}
          {activeTab === 'analyzer' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Resume Score & Review</h3>
                  <p className="text-xs text-slate-400">Recruiter readability, keyword matching, and section feedback</p>
                </div>
                <Link
                  to="/analyzer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                >
                  <SearchCheck className="w-3.5 h-3.5" />
                  <span>Check Another Resume</span>
                </Link>
              </div>

              {!latest_ats_analysis ? (
                <div className="p-12 text-center glass-panel rounded-2xl border border-dashed border-slate-800 space-y-3">
                  <SearchCheck className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">No resume reviews completed yet.</p>
                  <Link to="/analyzer" className="inline-block text-xs font-bold text-indigo-400 hover:underline">
                    Upload a PDF or Word resume to get an instant review
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Latest Scorecard Highlight */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Latest Review</span>
                      <h4 className="text-xl font-bold text-white">{latest_ats_analysis.file_name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Found {latest_ats_analysis.strengths_count} strong highlights and {latest_ats_analysis.ats_issues_count} suggestions for improvement.
                      </p>
                    </div>
                    <RadialGauge value={latest_ats_analysis.overall_score} size={84} strokeWidth={7} label="Score" />
                  </div>

                  {/* Dimension Progress Bars */}
                  {latest_ats_analysis.section_scores && Object.keys(latest_ats_analysis.section_scores).length > 0 && (
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Scoring Breakdown</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(latest_ats_analysis.section_scores).map(([k, v]) => (
                          <MetricBar
                            key={k}
                            label={k.replace(/_/g, ' ').toUpperCase()}
                            value={v}
                            color={v >= 80 ? 'emerald' : v >= 60 ? 'indigo' : 'amber'}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    to="/analyzer"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold text-center transition-colors block"
                  >
                    View Complete Review & Suggestions →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: JOB MATCHING SECTION */}
          {/* ========================================================================= */}
          {activeTab === 'matcher' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Job Matching Analytics</h3>
                  <p className="text-xs text-slate-400">Total Scans: {job_matches_count}</p>
                </div>
                <Link
                  to="/matcher"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Compare Job</span>
                </Link>
              </div>

              {!best_job_match ? (
                <div className="p-12 text-center glass-panel rounded-2xl border border-dashed border-slate-800 space-y-3">
                  <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">No job matches run yet.</p>
                  <Link to="/matcher" className="inline-block text-xs font-bold text-indigo-400 hover:underline">
                    Paste a job description to test compatibility
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Top Target Alignment</span>
                      <h4 className="text-xl font-bold text-white">{best_job_match.job_title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Company: <span className="text-white font-medium">{best_job_match.company_name}</span> • Rating: <span className="text-emerald-400 font-semibold">{best_job_match.suitability}</span>
                      </p>
                    </div>
                    <RadialGauge value={best_job_match.match_score} size={84} strokeWidth={7} label="Match" />
                  </div>

                  <Link
                    to="/matcher"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold text-center transition-colors block"
                  >
                    Open Job Matcher Workspace →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: LEARNING ROADMAP SECTION */}
          {/* ========================================================================= */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Learning Roadmap Progression</h3>
                  <p className="text-xs text-slate-400">Target Role: {active_roadmap?.target_role || profile?.target_role}</p>
                </div>
                <Link
                  to="/roadmap"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Curriculum</span>
                </Link>
              </div>

              {!active_roadmap ? (
                <div className="p-12 text-center glass-panel rounded-2xl border border-dashed border-slate-800 space-y-3">
                  <Compass className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">No active roadmap generated.</p>
                  <Link to="/roadmap" className="inline-block text-xs font-bold text-indigo-400 hover:underline">
                    Generate your personalized 30/60/90-day curriculum
                  </Link>
                </div>
              ) : (
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{active_roadmap.target_role} ({active_roadmap.duration_days} Days)</h4>
                      <p className="text-xs text-slate-400">
                        Completed {active_roadmap.completed_milestones} of {active_roadmap.total_milestones} phases
                      </p>
                    </div>
                    <span className="text-xl font-black text-emerald-400">{active_roadmap.progress_percentage}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${active_roadmap.progress_percentage}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                    />
                  </div>

                  {active_roadmap.next_milestone && (
                    <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Next Step: {active_roadmap.next_milestone.timeframe}</div>
                      <div className="font-semibold text-white">{active_roadmap.next_milestone.title}</div>
                      <div className="text-[11px] text-slate-400">{active_roadmap.next_milestone.project_deliverable}</div>
                    </div>
                  )}

                  <Link
                    to="/roadmap"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold text-center transition-colors block"
                  >
                    View Interactive Timeline & Checkpoints →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: INTERVIEW PREPARATION SECTION */}
          {/* ========================================================================= */}
          {activeTab === 'interview' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">AI Mock Interview Simulator</h3>
                <p className="text-xs text-slate-400">Role-specific technical and behavioral screening drills</p>
              </div>

              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 space-y-4">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Bot className="w-4 h-4" />
                  <span>Interview Readiness: {interview_readiness_score}%</span>
                </div>
                <h4 className="text-xl font-bold text-white">
                  Prepare for your {profile?.target_role || 'Software Engineering'} interviews
                </h4>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Practice simulated coding questions, system architecture challenges, and STAR-method behavioral scenarios tailored to your target role.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="font-bold text-white mb-0.5">System Design</div>
                    <div className="text-[11px] text-slate-400">Scalability, caching, APIs</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="font-bold text-white mb-0.5">Live Coding Drills</div>
                    <div className="text-[11px] text-slate-400">Data structures & algorithms</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="font-bold text-white mb-0.5">Behavioral STAR</div>
                    <div className="text-[11px] text-slate-400">Leadership, conflict, delivery</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => alert("AI Mock Interview Simulator is queued for Phase 8 development!")}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
                  >
                    Launch Interview Drill Simulator →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: PROFILE SECTION */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Candidate Profile Overview</h3>
                  <p className="text-xs text-slate-400">Personal information and job search preferences</p>
                </div>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Link>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Full Name</span>
                    <span className="text-white font-medium text-sm">{profile?.full_name || 'Candidate Name'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Email Address</span>
                    <span className="text-white font-medium">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Target Job Role</span>
                    <span className="text-indigo-400 font-bold">{profile?.target_role || 'Software Engineer'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Location</span>
                    <span className="text-slate-200">{profile?.location || 'Not set'}</span>
                  </div>
                </div>

                {profile?.headline && (
                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-1">Headline</span>
                    <p className="text-slate-300 italic">&ldquo;{profile.headline}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
