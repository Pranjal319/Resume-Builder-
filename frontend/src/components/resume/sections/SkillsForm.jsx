import { useState } from 'react'
import { Plus, X, Tag, Check, Sparkles } from 'lucide-react'
import { getFieldConfig } from '../../../lib/fieldConfigs'

export default function SkillsForm({ data = [], onChange, careerField = 'AI / Machine Learning', targetRole = '' }) {
  const fieldConfig = getFieldConfig(careerField)
  
  // Build category list dynamically from field config
  const fieldCategoryNames = fieldConfig.skillCategories?.map(c => c.name) || []
  const categories = [...fieldCategoryNames, 'Languages', 'Tools', 'Other']

  const [skillInput, setSkillInput] = useState('')
  const [categoryInput, setCategoryInput] = useState(categories[0] || 'Technical')

  const handleAdd = (nameToAdd = null, catToAdd = null) => {
    const finalName = (nameToAdd || skillInput).trim()
    const finalCat = catToAdd || categoryInput

    if (!finalName) return

    // Avoid duplicates
    if (data.some((s) => s.name.toLowerCase() === finalName.toLowerCase())) {
      setSkillInput('')
      return
    }

    const newSkill = {
      id: `sk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: finalName,
      category: finalCat,
    }

    onChange([...data, newSkill])
    setSkillInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleRemove = (id) => {
    onChange(data.filter((s) => s.id !== id))
  }

  // Flatten suggestions from field config
  const allFieldSuggestions = fieldConfig.skillCategories?.flatMap(cat => 
    cat.suggestions.map(s => ({ name: s, category: cat.name }))
  ) || []

  // Group user's actual skills by category
  const groupedSkills = data.reduce((acc, skill) => {
    const cat = skill.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {})

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">
            {fieldConfig.label} Skills
          </h3>
          <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            {data.length} skills added
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Add skills you actually know. Recruiters in {fieldConfig.label} look for these specific competencies.
        </p>
      </div>

      {/* Field-Specific Quick Suggestions */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Recommended for {targetRole || fieldConfig.label} (Click to add what you know):</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {allFieldSuggestions.map((item) => {
            const alreadyAdded = data.some(d => d.name.toLowerCase() === item.name.toLowerCase())
            return (
              <button
                key={item.name}
                type="button"
                disabled={alreadyAdded}
                onClick={() => handleAdd(item.name, item.category)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  alreadyAdded
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 opacity-70 cursor-default'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                {alreadyAdded ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3 text-indigo-400" />}
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Input Row */}
      <div className="glass-card p-3 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Add any additional ${fieldConfig.label} tool, library, or language...`}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleAdd()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* Added Skills Grouped By Category */}
      {data.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-300">No skills added yet.</p>
          <p>Click on the recommended skills above or type your own skills in the input box.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider">
            Your Selected Skills:
          </div>

          <div className="space-y-3">
            {Object.entries(groupedSkills).map(([cat, skills]) => (
              <div key={cat} className="glass-card p-3 rounded-xl border border-slate-800/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {cat}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs font-medium group transition-colors"
                    >
                      <span>{skill.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemove(skill.id)}
                        className="text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
