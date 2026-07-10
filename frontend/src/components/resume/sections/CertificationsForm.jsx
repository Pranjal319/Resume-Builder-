import { useState } from 'react'
import { Plus, Trash2, Award, ChevronDown, ChevronUp } from 'lucide-react'

export default function CertificationsForm({ data = [], onChange }) {
  const [expandedId, setExpandedId] = useState(data[0]?.id || null)

  const handleAdd = () => {
    const newEntry = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      issue_date: '',
      credential_url: '',
      credential_id: '',
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
          <h3 className="text-sm font-bold text-white tracking-tight">Certifications</h3>
          <p className="text-xs text-slate-400 mt-0.5">Online courses, certificates, or workshops (Coursera, Udemy, AWS, HackerRank, etc.).</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Certification</span>
        </button>
      </div>

      {data.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
          No certifications added yet. Click &ldquo;Add Certification&rdquo; above.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((cert, index) => {
            const isExpanded = expandedId === cert.id
            return (
              <div
                key={cert.id}
                className="glass-card rounded-xl border border-slate-800 overflow-hidden transition-colors"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : cert.id)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {cert.name || `Certification #${index + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {cert.issuer ? `${cert.issuer} • ${cert.issue_date || 'No date'}` : 'Issuer not set'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(cert.id)
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete certification"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Certification Name
                        </label>
                        <input
                          type="text"
                          value={cert.name || ''}
                          onChange={(e) => handleUpdate(cert.id, 'name', e.target.value)}
                          placeholder="e.g. AWS Certified Solutions Architect"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Issuing Organization
                        </label>
                        <input
                          type="text"
                          value={cert.issuer || ''}
                          onChange={(e) => handleUpdate(cert.id, 'issuer', e.target.value)}
                          placeholder="e.g. Amazon Web Services (AWS)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Issue Date / Year
                        </label>
                        <input
                          type="text"
                          value={cert.issue_date || ''}
                          onChange={(e) => handleUpdate(cert.id, 'issue_date', e.target.value)}
                          placeholder="e.g. Sep 2024"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Credential ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={cert.credential_id || ''}
                          onChange={(e) => handleUpdate(cert.id, 'credential_id', e.target.value)}
                          placeholder="e.g. ABC-123456"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Credential URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={cert.credential_url || ''}
                          onChange={(e) => handleUpdate(cert.id, 'credential_url', e.target.value)}
                          placeholder="https://credly.com/your-badge"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
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
