import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  BookOpen,
  Code2,
  Calendar,
  Check,
  RefreshCw,
  Plus,
  Target,
  ChevronDown
} from 'lucide-react'

export default function RoadmapPage() {
  const { user, profile, session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeRoadmap, setActiveRoadmap] = useState(null)
  const [userRoadmaps, setUserRoadmaps] = useState([])
  const [userResumes, setUserResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')

  // Generator inputs
  const [targetRole, setTargetRole] = useState(profile?.target_role || 'Full Stack Developer')
  const [durationDays, setDurationDays] = useState(30)

  // Load initial roadmap & resumes
  useEffect(() => {
    if (!user) return

    async function loadData() {
      setLoading(true)
      try {
        const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}

        // Fetch builder resumes
        const resR = await fetch('/api/resumes', { headers })
        if (resR.ok) {
          const rData = await resR.json()
          setUserResumes(rData)
          if (rData.length > 0) setSelectedResumeId(rData[0].id)
        }

        // Fetch active roadmap
        const resActive = await fetch('/api/roadmap/active', { headers })
        if (resActive.ok) {
          const dataActive = await resActive.json()
          if (dataActive) setActiveRoadmap(dataActive)
        }

        // Fetch all user roadmaps
        const resAll = await fetch('/api/roadmap', { headers })
        if (resAll.ok) {
          const allData = await resAll.json()
          setUserRoadmaps(allData)
          if (!activeRoadmap && allData.length > 0) {
            setActiveRoadmap(allData[0])
          }
        }
      } catch (err) {
        console.error('Error loading roadmap data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, session])

  // Handle roadmap generation
  const handleGenerateRoadmap = async (e) => {
    e.preventDefault()
    setGenerating(true)

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
      }

      const payload = {
        target_role: targetRole,
        duration_days: durationDays,
        resume_id: selectedResumeId || null,
      }

      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to generate plan')
      }

      const newRoadmap = await res.json()

      // Also persist to Supabase if configured
      if (isSupabaseConfigured && user) {
        await supabase.from('learning_roadmaps').insert([{
          user_id: user.id,
          target_role: newRoadmap.target_role,
          duration_days: newRoadmap.duration_days,
          current_skills: newRoadmap.current_skills,
          required_skills: newRoadmap.required_skills,
          missing_skills: newRoadmap.missing_skills,
          learning_order: newRoadmap.learning_order,
          milestones: newRoadmap.milestones,
          progress_percentage: newRoadmap.progress_percentage || 0,
          is_active: true
        }])
      }

      setActiveRoadmap(newRoadmap)
      setUserRoadmaps(prev => [newRoadmap, ...prev])
    } catch (err) {
      console.error(err)
      alert(err.message || 'Error generating plan')
    } finally {
      setGenerating(false)
    }
  }

  // Toggle milestone completion
  const handleToggleMilestone = async (milestoneId) => {
    if (!activeRoadmap) return

    const updatedMilestones = activeRoadmap.milestones.map((m) => {
      if (m.id === milestoneId) {
        return { ...m, completed: !m.completed }
      }
      return m
    })

    const completedCount = updatedMilestones.filter((m) => m.completed).length
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100)

    const updatedRoadmap = {
      ...activeRoadmap,
      milestones: updatedMilestones,
      progress_percentage: newProgress,
      completed_milestones: completedCount
    }

    setActiveRoadmap(updatedRoadmap)

    // Sync to backend
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
      }
      await fetch(`/api/roadmap/${activeRoadmap.id}/milestone/${milestoneId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ completed: !activeRoadmap.milestones.find(m => m.id === milestoneId)?.completed })
      })
    } catch (err) {
      console.warn('Backend milestone sync skipped:', err)
    }
  }

  // Student-friendly skill explanations
  const getSkillExplanation = (skillName) => {
    const lower = (typeof skillName === 'string' ? skillName : skillName?.name || '').toLowerCase()
    if (lower.includes('docker')) {
      return {
        why: 'Used to run applications easily in containers.',
        importance: 'High',
        usedIn: 'Most backend and cloud engineering jobs.'
      }
    }
    if (lower.includes('type') || lower.includes('ts')) {
      return {
        why: 'Catches bugs early and makes JavaScript code easier to maintain.',
        importance: 'High',
        usedIn: 'Modern frontend and full-stack web applications.'
      }
    }
    if (lower.includes('react') || lower.includes('vue') || lower.includes('next')) {
      return {
        why: 'Builds interactive, fast web user interfaces.',
        importance: 'High',
        usedIn: 'Frontend and full-stack developer roles.'
      }
    }
    if (lower.includes('sql') || lower.includes('postgres') || lower.includes('db')) {
      return {
        why: 'Stores, manages, and queries application data.',
        importance: 'High',
        usedIn: 'Every software team working with data.'
      }
    }
    if (lower.includes('git')) {
      return {
        why: 'Tracks your code changes and lets you collaborate with other developers.',
        importance: 'Essential',
        usedIn: 'Every software company in the world.'
      }
    }
    if (lower.includes('ci') || lower.includes('test')) {
      return {
        why: 'Tests and ships code automatically to avoid broken releases.',
        importance: 'Medium',
        usedIn: 'Teams practicing continuous deployment.'
      }
    }
    return {
      why: 'Key requirement for your target role.',
      importance: 'High',
      usedIn: 'Relevant software engineering teams.'
    }
  }

  const standardRoles = [
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Software Engineer',
    'Data Analyst',
    'Mobile Developer'
  ]

  // Default skills if none generated yet
  const defaultKnown = ['React', 'JavaScript', 'HTML/CSS', 'Git', 'Problem Solving']
  const defaultToLearn = [
    { name: 'Docker', priority: 'High' },
    { name: 'TypeScript', priority: 'High' },
    { name: 'REST APIs & Databases', priority: 'High' },
    { name: 'Testing & CI/CD', priority: 'Medium' }
  ]

  const knownSkills = (activeRoadmap?.current_skills && activeRoadmap.current_skills.length > 0)
    ? activeRoadmap.current_skills
    : defaultKnown

  const missingSkills = (activeRoadmap?.missing_skills && activeRoadmap.missing_skills.length > 0)
    ? activeRoadmap.missing_skills
    : defaultToLearn

  // Default milestones for 30 days if empty
  const defaultMilestones = [
    {
      id: 'w1',
      timeframe: 'Week 1',
      title: 'Basics & Foundations',
      description: 'Strengthen core fundamentals, version control, and set up your project workspace.',
      skills_covered: ['Git basics', 'Project setup', 'Code structure'],
      project_deliverable: 'Set up a clean GitHub repository with README and initial project structure.',
      completed: true
    },
    {
      id: 'w2',
      timeframe: 'Week 2',
      title: 'Core Skills & APIs',
      description: 'Build core application logic, integrate REST APIs, and handle error states gracefully.',
      skills_covered: ['REST APIs', 'Async programming', 'State management'],
      project_deliverable: 'Connect your frontend to an API and display live data dynamically.',
      completed: false
    },
    {
      id: 'w3',
      timeframe: 'Week 3',
      title: 'Build a Complete Project',
      description: 'Create a full end-to-end web application with authentication and database storage.',
      skills_covered: ['Full-stack integration', 'Database queries', 'Responsive design'],
      project_deliverable: 'Deploy your working project online (e.g. Vercel, Render, or Netlify).',
      completed: false
    },
    {
      id: 'w4',
      timeframe: 'Week 4',
      title: 'Portfolio & Interview Prep',
      description: 'Add your project to your resume with impact bullet points and practice core questions.',
      skills_covered: ['Resume bullet points', 'Interview practice', 'Project demo'],
      project_deliverable: 'Record a 2-minute demo or write a clean summary for recruiters.',
      completed: false
    }
  ]

  const displayMilestones = (activeRoadmap?.milestones && activeRoadmap.milestones.length > 0)
    ? activeRoadmap.milestones
    : defaultMilestones

  const completedCount = displayMilestones.filter(m => m.completed).length
  const progressPercent = Math.round((completedCount / displayMilestones.length) * 100)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Your Learning Plan
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            A simple plan based on the role you&apos;re working toward.
          </p>
        </div>

        {/* Saved Plans Selector */}
        {userRoadmaps.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Plans:</span>
            <select
              value={activeRoadmap?.id || ''}
              onChange={(e) => {
                const found = userRoadmaps.find((r) => r.id === e.target.value)
                if (found) setActiveRoadmap(found)
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
            >
              {userRoadmaps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.target_role} ({r.duration_days} Days)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Target Role & Timeframe Form */}
      <form onSubmit={handleGenerateRoadmap} className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Customize Your Learning Target
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Pick a role and how much time you want to spend
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Target Role Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Target Role
            </label>
            <input
              type="text"
              list="roles-list"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
            />
            <datalist id="roles-list">
              {standardRoles.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>

          {/* Duration Selector Tabs */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Plan Duration
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              {[30, 60, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDurationDays(days)}
                  className={`py-1 rounded-lg font-semibold transition-all ${
                    durationDays === days
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Resume Import */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Match Against My Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Profile Skills</option>
              {userResumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={generating || !targetRole.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Compass className="w-4 h-4" />
            )}
            <span>{generating ? 'Creating Plan...' : 'Generate Learning Plan'}</span>
          </button>
        </div>
      </form>

      {/* SECTION 1: Skills You Can Learn Next (Already Know vs Learn Next) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            1. Skills Overview
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            What you already bring to the table vs what to focus on next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Already Know */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Skills you already have
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                {knownSkills.length} Verified
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {knownSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{typeof s === 'string' ? s : s.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Learn Next */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Skills to learn next
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                {missingSkills.length} Recommended
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {missingSkills.slice(0, 4).map((skill, idx) => {
                const sName = typeof skill === 'string' ? skill : skill.name
                const info = getSkillExplanation(sName)
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{sName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                        {info.importance} Priority
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Why: </span>{info.why}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      <span className="text-slate-400 dark:text-slate-500 font-medium">Used in: </span>{info.usedIn}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: Your Learning Plan (Week by Week Checklist) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            2. Your {activeRoadmap?.duration_days || durationDays}-Day Learning Plan
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            A simple weekly checklist. Check off items as you build skills and finish projects.
          </p>
        </div>

        {/* Progress Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {activeRoadmap?.target_role || targetRole} Plan Progress
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {completedCount} of {displayMilestones.length} milestones completed
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Milestones Week by Week */}
        <div className="space-y-4">
          {displayMilestones.map((milestone, idx) => (
            <div
              key={milestone.id || idx}
              className={`glass-panel p-6 rounded-2xl border transition-all ${
                milestone.completed
                  ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700 bg-white dark:bg-[#111827]/70'
              }`}
            >
              <div className="flex items-start gap-4">
                
                {/* Interactive Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleMilestone(milestone.id)}
                  className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-colors border ${
                    milestone.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-purple-500 text-transparent'
                  }`}
                  title={milestone.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  <Check className="w-4 h-4" />
                </button>

                {/* Content */}
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                      {milestone.timeframe || `Week ${idx + 1}`}
                    </span>
                    <h3 className={`text-base font-bold ${milestone.completed ? 'text-slate-400 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                      {milestone.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {milestone.description}
                  </p>

                  {/* Skills tags */}
                  {milestone.skills_covered && milestone.skills_covered.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {milestone.skills_covered.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Project Task Box */}
                  {milestone.project_deliverable && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 mt-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-[11px]">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Weekly Project Goal:</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 pl-5 text-[11px] leading-relaxed">
                        {milestone.project_deliverable}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}
