import { useState } from 'react'
import { Sparkles, Check } from 'lucide-react'

export default function SummaryForm({ 
  data, 
  onChange, 
  careerField = 'AI / Machine Learning', 
  targetRole = 'Specialist',
  skills = [],
  projects = [],
  experience = []
}) {
  const [drafted, setDrafted] = useState(false)

  // Generate a truthful role-specific summary using ONLY what the user entered
  const handleGenerateRoleSummary = () => {
    const role = targetRole || careerField || 'Software Engineer'
    const topSkills = skills.slice(0, 4).map(s => s.name).join(', ')
    const topProject = projects[0]?.title

    let summaryText = ''

    if (topSkills && topProject) {
      summaryText = `Aspiring ${role} with practical experience in ${topSkills}. Built projects including ${topProject}, demonstrating hands-on technical problem-solving and structured implementation. Eager to contribute to high-impact teams in ${careerField}.`
    } else if (topSkills) {
      summaryText = `Motivated student pursuing opportunities as a ${role}, skilled in ${topSkills}. Passionate about building robust solutions and continuously expanding expertise in ${careerField}.`
    } else if (topProject) {
      summaryText = `Focused and dedicated candidate targeting ${role} roles. Demonstrated hands-on competence through projects such as ${topProject}, with an emphasis on clean architecture and practical outcomes.`
    } else {
      summaryText = `Dedicated student pursuing entry-level opportunities as a ${role}. Committed to applying solid academic foundations and modern best practices to deliver impactful results in ${careerField}.`
    }

    onChange(summaryText)
    setDrafted(true)
    setTimeout(() => setDrafted(false), 3000)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            About You ({targetRole || careerField})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Write 2–3 lines about yourself and what kind of {targetRole || careerField} job you&apos;re looking for.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateRoleSummary}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{drafted ? 'Summary Drafted ✓' : 'Draft Role Summary'}</span>
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Your Summary
        </label>
        <textarea
          rows={5}
          value={data || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`I am a final-year student targeting ${targetRole || 'entry-level'} roles in ${careerField}...`}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />
        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
          <span>Tip: Click &ldquo;Draft Role Summary&rdquo; to auto-generate from your actual skills and projects, or write your own.</span>
          <span>{data ? data.length : 0} characters</span>
        </div>
      </div>
    </div>
  )
}
