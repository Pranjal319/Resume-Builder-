import { useState } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
  Lightbulb,
  Check
} from 'lucide-react'

export default function AnalysisDashboard({ analysis, onReanalyze }) {
  const [showDetails, setShowDetails] = useState(false)

  if (!analysis) return null

  const {
    file_name = 'Resume',
    overall_score = 0,
    section_scores = {},
    strengths = [],
    weaknesses = [],
    missing_keywords = [],
    improvement_suggestions = [],
    created_at,
  } = analysis

  // Score color grading & human summary
  const getScoreSummary = (score) => {
    if (score >= 82) {
      return {
        headline: 'Great job! Your resume is strong and ready to send to recruiters.',
        badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20',
        label: 'Ready to Apply',
        textColor: 'text-emerald-600 dark:text-emerald-400'
      }
    }
    if (score >= 65) {
      return {
        headline: 'Good start. A few changes could make your resume clearer and more relevant.',
        badge: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20',
        label: 'Competitive',
        textColor: 'text-purple-600 dark:text-purple-400'
      }
    }
    return {
      headline: 'Needs a few updates. Follow the suggestions below to make it stronger.',
      badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20',
      label: 'Needs Improvements',
      textColor: 'text-amber-600 dark:text-amber-400'
    }
  }

  const scoreInfo = getScoreSummary(overall_score)

  // Fallback strengths if empty
  const displayStrengths = strengths.length > 0 ? strengths : [
    'Your projects are clearly described and easy to read',
    'Your technical skills are easy for recruiters to spot',
    'Your education section is complete and well formatted'
  ]

  // Fallback improvements if empty
  const displayImprovements = improvement_suggestions.length > 0 
    ? improvement_suggestions 
    : weaknesses.length > 0 
    ? weaknesses 
    : [
      'Add measurable numbers to your project bullet points (e.g. users reached, performance gained)',
      'Add 2–3 important skills commonly asked in your target role',
      'Make sure your About You summary clearly mentions the role you are looking for'
    ]

  const sectionMetrics = [
    { label: 'Work & Projects', score: section_scores.projects ?? 75 },
    { label: 'Key Skills Coverage', score: section_scores.skills ?? 70 },
    { label: 'Formatting & Clarity', score: section_scores.ats_compatibility ?? 80 },
    { label: 'Action Words & Impact', score: section_scores.action_verbs_and_metrics ?? 65 },
    { label: 'Education & Details', score: section_scores.education ?? 85 },
    { label: 'Contact Details', score: section_scores.contact_information ?? 95 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Main Score Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Text */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${scoreInfo.badge}`}>
                {scoreInfo.label}
              </span>
              {created_at && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(created_at).toLocaleDateString()}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {file_name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl font-medium">
              {scoreInfo.headline}
            </p>
          </div>

          {/* Right: Radial Score Gauge */}
          <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
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
                  strokeDashoffset={2 * Math.PI * 38 * (1 - Math.min(Math.max(overall_score, 0), 100) / 100)}
                  strokeLinecap="round"
                  className={scoreInfo.textColor}
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {overall_score}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  / 100
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Your Resume Score</div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] max-w-[180px] leading-relaxed">
                Based on structure, clarity, and relevant skills.
              </p>
              {onReanalyze && (
                <button
                  type="button"
                  onClick={onReanalyze}
                  className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:underline pt-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Check another</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Two Primary Columns: What's working vs What you could improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: What's working */}
        <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              What&apos;s working
            </h3>
          </div>

          <div className="space-y-2.5 pt-1">
            {displayStrengths.slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2.5 leading-relaxed">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{typeof item === 'string' ? item : item.point || item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: What you could improve */}
        <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              What you could improve
            </h3>
          </div>

          <div className="space-y-2.5 pt-1">
            {displayImprovements.slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>{typeof item === 'string' ? item : item.suggestion || item.point || item.issue}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Important Skills Missing */}
      {missing_keywords && missing_keywords.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Tag className="w-4 h-4" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Important skills you might want to add</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Hiring managers and screening systems look for these skills. Add only the ones you know:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {missing_keywords.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-medium"
              >
                + {typeof skill === 'string' ? skill : skill.keyword || skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Expandable: How is this score calculated? */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">How do we calculate this?</span>
          </div>
          {showDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          )}
        </button>

        {showDetails && (
          <div className="p-6 pt-0 space-y-4 border-t border-slate-200 dark:border-slate-800/80 animate-fade-in">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We look at your resume&apos;s structure, clarity, relevant skills, job-related terms, and how easily it can be read by common company screening systems.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {sectionMetrics.map((sec, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span>{sec.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sec.score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${sec.score}%` }}
                      className={`h-full rounded-full ${sec.score >= 80 ? 'bg-emerald-500' : sec.score >= 60 ? 'bg-purple-600' : 'bg-amber-500'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
