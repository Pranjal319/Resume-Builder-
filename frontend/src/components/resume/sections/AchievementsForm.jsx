import { useState } from 'react'
import { Plus, Trash2, Trophy, ChevronDown, ChevronUp } from 'lucide-react'

export default function AchievementsForm({ data = [], onChange }) {
  const [expandedId, setExpandedId] = useState(data[0]?.id || null)

  const handleAdd = () => {
    const newEntry = {
      id: `ach-${Date.now()}`,
      title: '',
      date: '',
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
          <h3 className="text-sm font-bold text-white tracking-tight">Achievements</h3>
          <p className="text-xs text-slate-400 mt-0.5">Hackathons, coding contests, academic honors, or extracurricular recognitions.</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Achievement</span>
        </button>
      </div>

      {data.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
          No achievements added yet. Click &ldquo;Add Achievement&rdquo; above.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((ach, index) => {
            const isExpanded = expandedId === ach.id
            return (
              <div
                key={ach.id}
                className="glass-card rounded-xl border border-slate-800 overflow-hidden transition-colors"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : ach.id)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {ach.title || `Achievement #${index + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {ach.date || 'No date set'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(ach.id)
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete achievement"
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

                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Honor / Award Title
                        </label>
                        <input
                          type="text"
                          value={ach.title || ''}
                          onChange={(e) => handleUpdate(ach.id, 'title', e.target.value)}
                          placeholder="e.g. 1st Place - National Hackathon 2024"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Date / Year
                        </label>
                        <input
                          type="text"
                          value={ach.date || ''}
                          onChange={(e) => handleUpdate(ach.id, 'date', e.target.value)}
                          placeholder="e.g. Oct 2024"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Brief Context / Scope
                      </label>
                      <textarea
                        rows={2}
                        value={ach.description || ''}
                        onChange={(e) => handleUpdate(ach.id, 'description', e.target.value)}
                        placeholder="Built real-time collaboration tool under 36 hours competing against 85 university teams."
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
