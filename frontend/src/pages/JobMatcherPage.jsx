import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import JobMatchResultCard from '../components/matcher/JobMatchResultCard'
import {
  Briefcase,
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Plus,
  Compass
} from 'lucide-react'

export default function JobMatcherPage() {
  const { user, session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  // Input states
  const [userResumes, setUserResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [customResumeText, setCustomResumeText] = useState('')
  const [resumeMode, setResumeMode] = useState('saved') // 'saved' | 'paste'

  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  const [savedJobs, setSavedJobs] = useState([])
  const [pastMatches, setPastMatches] = useState([])

  // Load initial data
  useEffect(() => {
    if (!user) return

    async function loadMatcherData() {
      setLoading(true)
      try {
        const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}

        // 1. Fetch user's builder resumes
        if (isSupabaseConfigured) {
          const { data: rData } = await supabase
            .from('resumes')
            .select('id, title, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

          if (rData && rData.length > 0) {
            setUserResumes(rData)
            setSelectedResumeId(rData[0].id)
          }

          const { data: mData } = await supabase
            .from('job_matches')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (mData) setPastMatches(mData)
        } else {
          // FastAPI backend fetch
          const resR = await fetch('/api/resumes', { headers })
          if (resR.ok) {
            const data = await resR.json()
            setUserResumes(data)
            if (data.length > 0) setSelectedResumeId(data[0].id)
          }

          const resM = await fetch('/api/matcher/matches', { headers })
          if (resM.ok) {
            const dataM = await resM.json()
            setPastMatches(dataM)
          }

          const resJ = await fetch('/api/matcher/jobs', { headers })
          if (resJ.ok) {
            const dataJ = await resJ.json()
            setSavedJobs(dataJ)
          }
        }
      } catch (err) {
        console.error('Error loading job matcher data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMatcherData()
  }, [user, session])

  // Sample quick load for testing
  const handleLoadSampleJD = () => {
    setJobTitle('Full-Stack Software Engineer')
    setCompanyName('ScaleFlow AI')
    setJobDescription(
`We are seeking a Full-Stack Engineer to build real-time reactive applications and high-throughput data ingestion pipelines.

Minimum Requirements:
• 3+ years of professional software engineering experience.
• Core expertise with React, TypeScript, and modern state management.
• Strong backend experience in Python (FastAPI or Django) or Node.js.
• Proficient with relational databases (PostgreSQL or MySQL) and SQL query optimization.
• Familiarity with Git, unit testing, and REST APIs.

Preferred Qualifications:
• Hands-on experience with Docker containerization and Kubernetes.
• Familiarity with AWS (EC2, S3, Lambda) or GCP cloud infrastructure.
• Experience with Redis caching and asynchronous messaging architectures.`
    )
  }

  // Run match handler
  const handleRunMatch = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (resumeMode === 'saved' && !selectedResumeId) {
      setErrorMessage('Please select a resume from your builder.')
      return
    }
    if (resumeMode === 'paste' && !customResumeText.trim()) {
      setErrorMessage('Please paste your resume text.')
      return
    }
    if (!jobDescription.trim()) {
      setErrorMessage('Please provide the job description text.')
      return
    }

    setMatching(true)

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
      }

      const payload = {
        resume_id: resumeMode === 'saved' ? selectedResumeId : null,
        resume_text: resumeMode === 'paste' ? customResumeText : null,
        job_title: jobTitle.trim() || 'Target Role',
        company_name: companyName.trim() || 'Target Company',
        job_description: jobDescription.trim(),
      }

      const response = await fetch('/api/matcher/match', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Job matching failed.')
      }

      const result = await response.json()

      // Also persist to Supabase if configured
      if (isSupabaseConfigured && user) {
        await supabase.from('job_matches').insert([{
          user_id: user.id,
          resume_id: payload.resume_id,
          job_title: result.job_title,
          company_name: result.company_name,
          resume_title: result.resume_title,
          match_score: result.match_score,
          matching_skills: result.matching_skills,
          missing_skills: result.missing_skills,
          required_skills: result.required_skills,
          preferred_skills: result.preferred_skills,
          dimension_scores: result.dimension_scores,
          suitability: result.suitability,
          explanation: result.explanation,
          recommended_changes: result.recommended_changes,
        }])
      }

      setMatchResult(result)
      setPastMatches((prev) => [result, ...prev])
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'Error evaluating job match.')
    } finally {
      setMatching(false)
    }
  }

  // Delete match from history
  const handleDeleteMatch = async (idToDelete) => {
    try {
      if (isSupabaseConfigured) {
        await supabase.from('job_matches').delete().eq('id', idToDelete)
      } else {
        await fetch(`/api/matcher/matches/${idToDelete}`, {
          method: 'DELETE',
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        })
      }
      setPastMatches((prev) => prev.filter((m) => m.id !== idToDelete))
      if (matchResult?.id === idToDelete) setMatchResult(null)
    } catch (err) {
      alert(`Could not delete match: ${err.message}`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Check Your Job Match
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Instant Check
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Paste a job description and see how well it fits your current resume.
          </p>
        </div>

        {matchResult && (
          <button
            type="button"
            onClick={() => setMatchResult(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Another Job</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs text-rose-600 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Workspace */}
      {matching ? (
        <div className="py-24 text-center glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 mt-8 space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-full border-4 border-purple-600 border-t-transparent animate-spin flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Checking your job match...
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Checking required skills, experience, and how well you fit this role.
            </p>
          </div>
        </div>
      ) : matchResult ? (
        /* Render Match Scorecard Result */
        <div className="mt-8">
          <JobMatchResultCard
            result={matchResult}
            onReset={() => setMatchResult(null)}
          />
        </div>
      ) : (
        /* Form & History Layout */
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form Editor (8 cols) */}
          <form onSubmit={handleRunMatch} className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Select or Paste Resume */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">1</span>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                    Select Your Resume
                  </h3>
                </div>

                <div className="bg-slate-100 dark:bg-[#111827] p-1 rounded-xl border border-slate-200 dark:border-[#2A3345] flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setResumeMode('saved')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      resumeMode === 'saved' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-[#94A3B8]'
                    }`}
                  >
                    From Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeMode('paste')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      resumeMode === 'paste' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-[#94A3B8]'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {resumeMode === 'saved' ? (
                userResumes.length === 0 ? (
                  <div className="p-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-[#2A3345] text-xs text-slate-500 dark:text-[#94A3B8] space-y-2">
                    <p>No resumes created in the builder yet.</p>
                    <Link to="/resumes" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline block">
                      + Create a resume in Resume Builder
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 dark:text-[#CBD5E1]">
                      Choose resume to compare
                    </label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                    >
                      {userResumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} (Updated {new Date(r.updated_at).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-[#CBD5E1] mb-1">
                    Paste Resume Content
                  </label>
                  <textarea
                    rows={4}
                    value={customResumeText}
                    onChange={(e) => setCustomResumeText(e.target.value)}
                    placeholder="Paste your resume experience, skills, education, and projects here..."
                    className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] rounded-xl p-3 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Target Job Description */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">2</span>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                    Target Job Description
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSampleJD}
                  className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Load Sample Job
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-[#CBD5E1] mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Junior Python Developer"
                    className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-[#CBD5E1] mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1] mb-1">
                  Job Description
                </label>
                <textarea
                  rows={8}
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] rounded-xl p-3.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={matching || !jobDescription.trim()}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Briefcase className="w-4 h-4" />
                <span>Check My Match</span>
              </button>
            </div>

          </form>

          {/* Right History & Past Scans (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                    Recent Matches
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono">
                  {pastMatches.length} matches
                </span>
              </div>

              {pastMatches.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-[#94A3B8] border border-dashed border-slate-200 dark:border-[#2A3345] rounded-xl p-4">
                  No previous match reports. Compare your first job description on the left.
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                  {pastMatches.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setMatchResult(m)}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900 transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                          {m.job_title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {m.company_name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          m.match_score >= 80
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : m.match_score >= 65
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {m.match_score}%
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteMatch(m.id)
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Delete match"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Matcher Explainer Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <Compass className="w-4 h-4 text-purple-400" />
                <span>How Matching Works</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Our algorithm combines <b>vector semantic embeddings</b> (contextual topic overlap) with <b>skill extraction</b>, <b>experience thresholds</b>, and <b>education prerequisites</b> to evaluate actual hiring likelihood.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
