import { useState } from 'react'
import { Plus, Trash2, Briefcase, ChevronDown, ChevronUp, Calendar } from 'lucide-react'

export default function ExperienceForm({ data = [], onChange }) {
  const [expandedId, setExpandedId] = useState(data[0]?.id || null)

  const handleAdd = () => {
    const newEntry = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
    }
    onChange([...data, newEntry])
    setExpandedId(newEntry.id)
  }

  const handleRemove = (id) => {
    onChange(data.filter((item) => item.id !== id))
  }

  const handleUpdate = (id, field, value) => {
    onChange(
      data.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Experience</h3>
          <p className="text-xs text-slate-400 mt-0.5">Internships, part-time jobs, freelance work, or campus leadership.</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Experience</span>
        </button>
      </div>

      {data.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-medium text-slate-300">No work experience yet?</p>
          <p className="text-slate-500">That's completely fine for freshers and college students! Focus on your Projects, Skills, and Education.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((exp, index) => {
            const isExpanded = expandedId === exp.id
            return (
              <div
                key={exp.id}
                className="glass-card rounded-xl border border-slate-800 overflow-hidden transition-colors"
              >
                {/* Header / Collapse Bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {exp.position || exp.company
                          ? `${exp.position || 'Position'} at ${exp.company || 'Company'}`
                          : `Position #${index + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {exp.start_date || exp.end_date
                          ? `${exp.start_date} — ${exp.is_current ? 'Present' : exp.end_date}`
                          : 'Dates not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(exp.id)
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete experience entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Form Body */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Job Title / Position
                        </label>
                        <input
                          type="text"
                          value={exp.position || ''}
                          onChange={(e) => handleUpdate(exp.id, 'position', e.target.value)}
                          placeholder="e.g. Software Engineer Intern"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => handleUpdate(exp.id, 'company', e.target.value)}
                          placeholder="e.g. Google / Microsoft"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={(e) => handleUpdate(exp.id, 'location', e.target.value)}
                          placeholder="e.g. Seattle, WA (or Remote)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-medium text-slate-400">
                            Timeline
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.is_current || false}
                              onChange={(e) => handleUpdate(exp.id, 'is_current', e.target.checked)}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                            />
                            <span>Currently Working Here</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={exp.start_date || ''}
                            onChange={(e) => handleUpdate(exp.id, 'start_date', e.target.value)}
                            placeholder="Start (e.g. Jun 2024)"
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                          <input
                            type="text"
                            disabled={exp.is_current}
                            value={exp.is_current ? 'Present' : exp.end_date || ''}
                            onChange={(e) => handleUpdate(exp.id, 'end_date', e.target.value)}
                            placeholder="End (e.g. Aug 2024)"
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-slate-400">
                          Key Responsibilities & Measurable Impact (Bullet points)
                        </label>
                      </div>
                      <textarea
                        rows={4}
                        value={exp.description || ''}
                        onChange={(e) => handleUpdate(exp.id, 'description', e.target.value)}
                        placeholder="• Architected microservices with FastAPI reducing API response latency by 35%&#10;• Led cross-functional team of 4 engineers delivering MVP 2 weeks ahead of schedule&#10;• Implemented automated CI/CD pipeline using GitHub Actions"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                      />
                      <div className="text-[10px] text-slate-500 mt-1">
                        Start bullet points with strong action verbs (e.g. Engineered, Spearheaded, Accelerated, Reduced).
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
