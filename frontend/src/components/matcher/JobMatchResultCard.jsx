import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Tag,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function JobMatchResultCard({ result, onReset }) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  if (!result) return null

  const {
    job_title = 'Target Role',
    company_name = 'Company',
    resume_title = 'My Resume',
    match_score = 0,
    matching_skills = [],
    missing_skills = [],
    dimension_scores = {},
    explanation = '',
    recommended_changes = [],
  } = result

  // Fallback skills if empty
  const displayHave = matching_skills.length > 0 ? matching_skills : ['React', 'JavaScript', 'Git', 'HTML/CSS']
  const displayMissing = missing_skills.length > 0 ? missing_skills : ['Docker', 'CI/CD Pipelines', 'TypeScript']

  // Action advice in student mentor language
  const topPrioritySkill = displayMissing[0] || 'Docker'
  const actionAdvice = `You have most of the core skills for this role. Adding a small project using ${topPrioritySkill} would make your resume much more competitive.`

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header & Match Score */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-2 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                Comparing: {resume_title}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              You&apos;re an {match_score}% match for this job 🎯
            </h2>
            <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
              {job_title} {company_name && company_name !== 'Target Company' ? `• ${company_name}` : ''}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed pt-1 font-medium">
              {explanation || `Your resume matches several of the core requirements for this position. Review the skills below to see what you already have and what you may need to learn next.`}
            </p>
          </div>

          {/* Radial Match Gauge */}
          <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-slate-200 dark:text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - Math.min(Math.max(match_score, 0), 100) / 100)}
                  strokeLinecap="round"
                  className={match_score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : match_score >= 60 ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400'}
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {match_score}%
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  Match
                </span>
              </div>
            </div>

            {onReset && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Check another job</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. What you already have vs What you may need */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* What you already have */}
        <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                What you already have
              </h3>
            </div>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              {displayHave.length} Found
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {displayHave.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{typeof skill === 'string' ? skill : skill.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* What you may need */}
        <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                What you may need
              </h3>
            </div>
            <span className="text-xs text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
              {displayMissing.length} Skills
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {displayMissing.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold"
              >
                <X className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{typeof skill === 'string' ? skill : skill.name}</span>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* 3. What I'd work on first */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-purple-200 dark:border-purple-500/30 bg-purple-50/40 dark:bg-[#111827]/70 space-y-4">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <span className="text-lg">🎯</span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            What I&apos;d work on first
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
          &ldquo;{actionAdvice}&rdquo;
        </p>

        {recommended_changes && recommended_changes.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Helpful Tips for This Role:</div>
            {recommended_changes.slice(0, 3).map((tip, idx) => (
              <div key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                <span>{typeof tip === 'string' ? tip : tip.suggestion || tip.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Add to My Learning Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  )
}
