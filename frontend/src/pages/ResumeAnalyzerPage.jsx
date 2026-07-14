import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import AnalysisDashboard from '../components/analysis/AnalysisDashboard'
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ChevronRight,
  ShieldCheck,
  SearchCheck,
  ArrowUpRight,
  Layers,
  RefreshCw,
  Loader2
} from 'lucide-react'

export default function ResumeAnalyzerPage() {
  const { user, session } = useAuth()
  const fileInputRef = useRef(null)

  const [dragActive, setDragActive] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [pipelineStep, setPipelineStep] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [userResumes, setUserResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Load history and builder resumes
  useEffect(() => {
    if (!user) return

    async function loadData() {
      setLoadingHistory(true)
      try {
        // Load past analyses
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('resume_analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (!error && data) setHistory(data)

          const { data: resumesData } = await supabase
            .from('resumes')
            .select('id, title, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

          if (resumesData) setUserResumes(resumesData)
        } else {
          // Fetch from FastAPI backend
          const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
          const res = await fetch('/api/analysis', { headers })
          if (res.ok) {
            const data = await res.json()
            setHistory(data)
          }

          const resResumes = await fetch('/api/resumes', { headers })
          if (resResumes.ok) {
            const rData = await resResumes.json()
            setUserResumes(rData)
          }
        }
      } catch (err) {
        console.error('Failed to load analyzer data:', err)
      } finally {
        setLoadingHistory(false)
      }
    }

    loadData()
  }, [user, session])

  // File drag handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  // Upload file pipeline
  const handleFileUpload = async (file) => {
    if (!file) return
    const validExtensions = ['.pdf', '.docx']
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!hasValidExt) {
      setErrorMessage('Please upload a PDF (.pdf) or Word document (.docx).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10 MB limit.')
      return
    }

    setErrorMessage('')
    setAnalyzing(true)
    setPipelineStep('Uploading file...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      setPipelineStep('Reading your resume...')
      
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}

      // Slight step delay for realistic feedback
      setTimeout(() => {
        setPipelineStep('Checking skills, formatting, and readability...')
      }, 700)

      const response = await fetch('/api/analysis/upload', {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Analysis failed')
      }

      setPipelineStep('Preparing your feedback...')
      const result = await response.json()

      // Also persist to Supabase if configured
      if (isSupabaseConfigured && user) {
        await supabase.from('resume_analyses').insert([{
          user_id: user.id,
          file_name: result.file_name,
          overall_score: result.overall_score,
          section_scores: result.section_scores,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          missing_keywords: result.missing_keywords,
          ats_issues: result.ats_issues,
          improvement_suggestions: result.improvement_suggestions,
          recommended_changes: result.recommended_changes,
          extracted_text: result.extracted_text_preview,
        }])
      }

      setAnalysisResult(result)
      setHistory((prev) => [result, ...prev])
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'Error occurred during analysis.')
    } finally {
      setAnalyzing(false)
      setPipelineStep('')
    }
  }

  // Analyze saved builder resume
  const handleAnalyzeSavedResume = async () => {
    if (!selectedResumeId) return
    setErrorMessage('')
    setAnalyzing(true)
    setPipelineStep('Fetching builder resume data...')

    try {
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      const response = await fetch(`/api/analysis/resume/${selectedResumeId}`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Analysis failed')
      }

      const result = await response.json()
      setAnalysisResult(result)
      setHistory((prev) => [result, ...prev])
    } catch (err) {
      setErrorMessage(err.message || 'Error analyzing saved resume.')
    } finally {
      setAnalyzing(false)
      setPipelineStep('')
    }
  }

  // Delete analysis from history
  const handleDeleteHistory = async (idToDelete) => {
    try {
      if (isSupabaseConfigured) {
        await supabase.from('resume_analyses').delete().eq('id', idToDelete)
      } else {
        await fetch(`/api/analysis/${idToDelete}`, {
          method: 'DELETE',
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        })
      }
      setHistory((prev) => prev.filter((h) => h.id !== idToDelete))
      if (analysisResult?.id === idToDelete) {
        setAnalysisResult(null)
      }
    } catch (err) {
      alert(`Could not delete analysis: ${err.message}`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Check Your Resume
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 flex items-center gap-1">
              <SearchCheck className="w-3.5 h-3.5" /> Instant Review
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Get a second look before you send your resume to a recruiter.
          </p>
        </div>

        {analysisResult && (
          <button
            type="button"
            onClick={() => setAnalysisResult(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Another Resume</span>
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

      {/* Main Content Area */}
      {analyzing ? (
        <div className="py-24 text-center rounded-3xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] mt-8 space-y-6 shadow-md">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-full border-4 border-purple-600 border-t-transparent animate-spin flex items-center justify-center">
              <SearchCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              {pipelineStep || 'Reading your resume...'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] max-w-sm mx-auto mt-1">
              Checking structure, key skills, and readability for recruiters.
            </p>
          </div>
        </div>
      ) : analysisResult ? (
        /* Render Live Scorecard Dashboard */
        <div className="mt-8">
          <AnalysisDashboard
            analysis={analysisResult}
            onReanalyze={() => setAnalysisResult(null)}
          />
        </div>
      ) : (
        /* Upload & Selection View */
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Upload & Select Area (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Drag & Drop File Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 sm:p-14 text-center rounded-3xl border-2 border-dashed transition-all cursor-pointer select-none ${
                dragActive
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 scale-[1.01]'
                  : 'border-slate-300 dark:border-[#2A3345] hover:border-purple-400 dark:hover:border-purple-500/50 bg-white dark:bg-[#1A2130] hover:bg-slate-50 dark:hover:bg-[#222B3D] shadow-sm'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  if (e.target.value) handleFileUpload(e.target.files[0])
                }}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-600/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400 mb-4 shadow-md shadow-purple-600/10">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Upload your resume file
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1 max-w-md mx-auto">
                Drag and drop your resume here, or <span className="text-purple-600 dark:text-purple-400 font-semibold underline">browse files</span> from your computer.
              </p>

              <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">
                <span>PDF or Word DOCX</span>
                <span>•</span>
                <span>Up to 10 MB</span>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-grow border-t border-slate-200 dark:border-[#2A3345]" />
              <span className="text-xs uppercase font-semibold text-slate-400 dark:text-[#94A3B8]">OR</span>
              <div className="flex-grow border-t border-slate-200 dark:border-[#2A3345]" />
            </div>

            {/* Select from Saved Resumes */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  Check a resume from your Resume Builder
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-0.5">
                  Select any resume you created in CareerAI to review its score and feedback.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="flex-grow bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select a saved resume...</option>
                  {userResumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} (Updated {new Date(r.updated_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAnalyzeSavedResume}
                  disabled={!selectedResumeId}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
                >
                  <SearchCheck className="w-3.5 h-3.5" />
                  <span>Check This Resume</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Past Analyses History Drawer (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                    Review History
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono">
                  {history.length} reviews
                </span>
              </div>

              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
                  Loading past reviews...
                </div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-[#94A3B8] border border-dashed border-slate-200 dark:border-[#2A3345] rounded-xl p-4">
                  No previous reviews. Upload a resume to get started.
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setAnalysisResult(item)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-slate-100 dark:hover:bg-[#222B3D] transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="space-y-1 truncate pr-2">
                        <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                          {item.file_name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          item.overall_score >= 80
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : item.overall_score >= 60
                            ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        }`}>
                          {item.overall_score}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteHistory(item.id)
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                          title="Delete scan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ATS Quick Tips Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ATS Parsing Rules</span>
              </div>
              <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside leading-relaxed">
                <li>Avoid multi-column tables and text boxes.</li>
                <li>Use standard headings: Work Experience, Education, Skills.</li>
                <li>Incorporate measurable percentages and numbers.</li>
                <li>Keep contact information in the body, not page headers.</li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
