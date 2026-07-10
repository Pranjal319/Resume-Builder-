import { Plus, Trash2, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function EducationForm({ data = [], onChange }) {
  const [expandedId, setExpandedId] = useState(data[0]?.id || null)

  const handleAdd = () => {
    const newEntry = {
      id: `edu-${Date.now()}`,
      school: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      gpa: '',
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
          <h3 className="text-sm font-bold text-white tracking-tight">Education</h3>
          <p className="text-xs text-slate-400 mt-0.5">Your college or school, degree, field of study, graduation year, and GPA.</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education</span>
        </button>
      </div>

      {data.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
          No education entries added. Click &ldquo;Add Education&rdquo; above.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((edu, index) => {
            const isExpanded = expandedId === edu.id
            return (
              <div
                key={edu.id}
                className="glass-card rounded-xl border border-slate-800 overflow-hidden transition-colors"
              >
                {/* Header / Collapse Bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : edu.id)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {edu.degree || edu.school ? `${edu.degree || 'Degree'} - ${edu.school || 'School'}` : `Education Entry #${index + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {edu.start_date || edu.end_date ? `${edu.start_date} — ${edu.end_date}` : 'Dates not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(edu.id)
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete education entry"
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

                {/* Body Form */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          School / University
                        </label>
                        <input
                          type="text"
                          value={edu.school || ''}
                          onChange={(e) => handleUpdate(edu.id, 'school', e.target.value)}
                          placeholder="e.g. Stanford University"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Degree
                        </label>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => handleUpdate(edu.id, 'degree', e.target.value)}
                          placeholder="e.g. Bachelor of Science"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Field of Study / Major
                        </label>
                        <input
                          type="text"
                          value={edu.field_of_study || ''}
                          onChange={(e) => handleUpdate(edu.id, 'field_of_study', e.target.value)}
                          placeholder="e.g. Computer Science"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          GPA / Honors (Optional)
                        </label>
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => handleUpdate(edu.id, 'gpa', e.target.value)}
                          placeholder="e.g. 3.9 / 4.0 (Magna Cum Laude)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Start Year / Date
                        </label>
                        <input
                          type="text"
                          value={edu.start_date || ''}
                          onChange={(e) => handleUpdate(edu.id, 'start_date', e.target.value)}
                          placeholder="e.g. 2021"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          End Year / Expected
                        </label>
                        <input
                          type="text"
                          value={edu.end_date || ''}
                          onChange={(e) => handleUpdate(edu.id, 'end_date', e.target.value)}
                          placeholder="e.g. 2025"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Relevant Coursework & Honors
                      </label>
                      <textarea
                        rows={2}
                        value={edu.description || ''}
                        onChange={(e) => handleUpdate(edu.id, 'description', e.target.value)}
                        placeholder="Relevant coursework: Data Structures, Operating Systems, Machine Learning..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
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
