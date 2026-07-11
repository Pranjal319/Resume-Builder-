import { Plus, Trash2, Globe, Code2, Link2, Share2 } from 'lucide-react'

export default function SocialLinksForm({ data = [], onChange }) {
  const platforms = ['LinkedIn', 'GitHub', 'Portfolio', 'Twitter / X', 'LeetCode', 'Kaggle', 'Medium']

  const handleAdd = () => {
    const newEntry = {
      id: `soc-${Date.now()}`,
      platform: 'LinkedIn',
      url: '',
      username: '',
    }
    onChange([...data, newEntry])
  }

  const handleRemove = (id) => {
    onChange(data.filter((item) => item.id !== id))
  }

  const handleUpdate = (id, field, value) => {
    onChange(
      data.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'github':
      case 'leetcode':
        return <Code2 className="w-3.5 h-3.5 text-amber-400" />
      case 'linkedin':
      case 'twitter / x':
        return <Share2 className="w-3.5 h-3.5 text-blue-400" />
      default:
        return <Globe className="w-3.5 h-3.5 text-indigo-400" />
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Links</h3>
          <p className="text-xs text-slate-400 mt-0.5">Add links to your GitHub, LinkedIn, portfolio website, or LeetCode profile.</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Link</span>
        </button>
      </div>

      {data.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
          No social links added. Click &ldquo;Add Link&rdquo; above.
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.map((item) => (
            <div
              key={item.id}
              className="glass-card p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="flex items-center gap-2 sm:w-40">
                {getPlatformIcon(item.platform)}
                <select
                  value={item.platform}
                  onChange={(e) => handleUpdate(item.id, 'platform', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-grow">
                <input
                  type="url"
                  value={item.url || ''}
                  onChange={(e) => handleUpdate(item.id, 'url', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:w-36">
                <input
                  type="text"
                  value={item.username || ''}
                  onChange={(e) => handleUpdate(item.id, 'username', e.target.value)}
                  placeholder="Display text (e.g. in/user)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors self-end sm:self-center"
                title="Delete link"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
