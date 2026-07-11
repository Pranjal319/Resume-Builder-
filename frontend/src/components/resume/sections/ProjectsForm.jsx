import { useState } from 'react'
import { Plus, Trash2, FolderGit2, ChevronDown, ChevronUp, ExternalLink, Code2, Sparkles, Check } from 'lucide-react'
import { getFieldConfig } from '../../../lib/fieldConfigs'

export default function ProjectsForm({ data = [], onChange, careerField = 'AI / Machine Learning' }) {
  const [expandedId, setExpandedId] = useState(data[0]?.id || null)
  const fieldConfig = getFieldConfig(careerField)
  const schema = fieldConfig.projectSchema

  const handleAdd = () => {
    const newEntry = {
      id: `proj-${Date.now()}`,
      title: '',
      role: '',
      tech_stack: '',
      link: '',
      github: '',
      start_date: '',
      end_date: '',
      // Field-specific fields
      dataset_or_context: '',
      model_or_architecture: '',
      result_achieved: '',
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

  // Format user's actual entered fields into clean resume bullet points
  const handleFormatBulletPoints = (proj) => {
    const bullets = []

    // Bullet 1: Core purpose & tech
    if (proj.title) {
      if (proj.tech_stack) {
        bullets.push(`• Developed ${proj.title} utilizing ${proj.tech_stack}.`)
      } else {
        bullets.push(`• Developed and implemented ${proj.title}.`)
      }
    }

    // Bullet 2: Model / Architecture / Dataset
    if (proj.model_or_architecture || proj.dataset_or_context) {
      if (proj.model_or_architecture && proj.dataset_or_context) {
        bullets.push(`• Applied ${proj.model_or_architecture} leveraging ${proj.dataset_or_context}.`)
      } else if (proj.model_or_architecture) {
        bullets.push(`• Implemented ${proj.model_or_architecture} to ensure reliable system execution.`)
      } else {
        bullets.push(`• Processed and structured ${proj.dataset_or_context}.`)
      }
    }

    // Bullet 3: Result / Outcome
    if (proj.result_achieved) {
      bullets.push(`• Achieved key milestone: ${proj.result_achieved}.`)
    }

    // Fallback if user only provided basic description
    if (bullets.length === 0) {
      bullets.push(`• Built ${proj.title || 'project'} focusing on clean implementation and measurable outcomes.`)
    }

    handleUpdate(proj.id, 'description', bullets.join('\n'))
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              {fieldConfig.label} Projects
            </h3>
            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {data.length} projects
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Recruiters in {fieldConfig.label} want to see what you built, what data or tools you used, and what you achieved.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {data.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500 space-y-2">
          <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-300">No projects added yet.</p>
          <p>Click &ldquo;Add Project&rdquo; above to showcase your academic, course, or personal projects.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((proj, index) => {
            const isExpanded = expandedId === proj.id
            return (
              <div
                key={proj.id}
                className="glass-card rounded-xl border border-slate-800 overflow-hidden transition-colors"
              >
                {/* Header / Collapse Bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : proj.id)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {proj.title || `Project #${index + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {proj.tech_stack || 'Add technologies & tools'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(proj.id)
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete project"
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
                  <div className="p-4 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                    
                    {/* Project Title & Tech Stack */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Project Name / Title
                        </label>
                        <input
                          type="text"
                          value={proj.title || ''}
                          onChange={(e) => handleUpdate(proj.id, 'title', e.target.value)}
                          placeholder="e.g. House Price Prediction / E-Commerce Store"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Technologies & Libraries Used
                        </label>
                        <input
                          type="text"
                          value={proj.tech_stack || ''}
                          onChange={(e) => handleUpdate(proj.id, 'tech_stack', e.target.value)}
                          placeholder="e.g. Python, Scikit-learn, Pandas (or React, Node.js)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Field-Specific Question 1: Dataset / Features / Context */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        {schema.datasetLabel}
                      </label>
                      <input
                        type="text"
                        value={proj.dataset_or_context || ''}
                        onChange={(e) => handleUpdate(proj.id, 'dataset_or_context', e.target.value)}
                        placeholder={schema.datasetPlaceholder}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Field-Specific Question 2: Model / Algorithm / Architecture */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        {schema.algorithmLabel}
                      </label>
                      <input
                        type="text"
                        value={proj.model_or_architecture || ''}
                        onChange={(e) => handleUpdate(proj.id, 'model_or_architecture', e.target.value)}
                        placeholder={schema.algorithmPlaceholder}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Field-Specific Question 3: Result / Outcome */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        {schema.resultLabel}
                      </label>
                      <input
                        type="text"
                        value={proj.result_achieved || ''}
                        onChange={(e) => handleUpdate(proj.id, 'result_achieved', e.target.value)}
                        placeholder={schema.resultPlaceholder}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          {schema.demoLabel}
                        </label>
                        <input
                          type="url"
                          value={proj.github || ''}
                          onChange={(e) => handleUpdate(proj.id, 'github', e.target.value)}
                          placeholder="https://github.com/yourname/project"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Live Demo / Documentation Link (Optional)
                        </label>
                        <input
                          type="url"
                          value={proj.link || ''}
                          onChange={(e) => handleUpdate(proj.id, 'link', e.target.value)}
                          placeholder="https://myproject.demo.app"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Formatted Resume Bullet Points */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-300">
                          Resume Bullet Points (Appears on your Resume)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleFormatBulletPoints(proj)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Format Details into Bullet Points</span>
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        value={proj.description || ''}
                        onChange={(e) => handleUpdate(proj.id, 'description', e.target.value)}
                        placeholder="• Developed a machine learning model to predict prices using Python and Scikit-learn&#10;• Preprocessed housing dataset and engineered informative features&#10;• Achieved 92% R² accuracy on test validation"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                      />
                      <p className="text-[10px] text-slate-500">
                        Tip: Fill in your dataset, model, and result above, then click &ldquo;Format Details into Bullet Points&rdquo; to auto-generate clean bullets. You can also edit them directly.
                      </p>
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
