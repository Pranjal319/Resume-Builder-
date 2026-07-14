import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { getInitialResumeData } from '../lib/initialResumeData'
import { CAREER_FIELDS, getFieldConfig } from '../lib/fieldConfigs'
import { 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Calendar, 
  LayoutTemplate, 
  AlertCircle,
  Sparkles,
  Search,
  Download,
  Loader2,
  CheckCircle2,
  Briefcase,
  Compass
} from 'lucide-react'

export default function ResumesPage() {
  const { user, profile, session } = useAuth()
  const navigate = useNavigate()

  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModalId, setDeleteModalId] = useState(null)
  const [creatingResume, setCreatingResume] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Field-aware creation state
  const [selectedField, setSelectedField] = useState('AI / Machine Learning')
  const [customField, setCustomField] = useState('')
  const [targetRole, setTargetRole] = useState('Machine Learning Engineer')

  // Fetch all resumes for the user
  const fetchResumes = async () => {
    if (!user) return
    setLoading(true)

    try {
      let results = []
      const validUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)
        ? user.id
        : '6bdd8dc9-2641-40ff-818a-ae147086d973'

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', validUserId)
            .order('updated_at', { ascending: false })

          if (!error && data) {
            results = [...data]
          }
        } catch (e) {
          console.warn('Supabase fetch resumes notice:', e)
        }
      }

      // Check local resumes storage
      const local = JSON.parse(localStorage.getItem('careerai_local_resumes') || '[]')
      for (const item of local) {
        if (!results.some((r) => r.id === item.id)) {
          results.push(item)
        }
      }

      setResumes(results)
    } catch (err) {
      console.error('Failed to load resumes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [user, session])

  // Direct PDF download from card
  const handleQuickDownload = async (resume) => {
    setDownloadingId(resume.id)
    try {
      const response = await fetch('/api/resumes/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          title: resume.title,
          template_id: resume.template_id || 'ats-friendly',
          content: resume.content,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${resume.title.replace(/\s+/g, '_')}_Resume.pdf`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) filename = match[1]
      }

      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Could not download PDF: ${err.message}`)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleFieldSelect = (fieldLabel) => {
    setSelectedField(fieldLabel)
    const cfg = getFieldConfig(fieldLabel)
    const firstRole = cfg?.roles?.[0] || 'Specialist'
    setTargetRole(firstRole)
    setNewTitle(`${firstRole} Resume`)
  }

  const handleRoleSelect = (roleName) => {
    setTargetRole(roleName)
    setNewTitle(`${roleName} Resume`)
  }

  // Create new resume
  const handleCreateResume = async (e) => {
    e.preventDefault()

    const effectiveField = selectedField === 'Other' && customField.trim() 
      ? customField.trim() 
      : selectedField
    const effectiveRole = targetRole.trim() || 'Specialist'
    const finalTitle = newTitle.trim() || `${effectiveRole} Resume`

    setCreatingResume(true)
    const initialContent = getInitialResumeData(user, profile, effectiveField, effectiveRole)

    try {
      const validUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)
        ? user.id
        : '6bdd8dc9-2641-40ff-818a-ae147086d973'

      let createdData = null

      if (isSupabaseConfigured) {
        try {
          // Upsert profile first so foreign key constraint is satisfied
          await supabase.from('profiles').upsert({
            id: validUserId,
            email: user.email || 'candidate@gmail.com',
            full_name: profile?.full_name || user.user_metadata?.full_name || 'Candidate',
            target_role: effectiveRole,
          })

          const { data, error } = await supabase
            .from('resumes')
            .insert([
              {
                user_id: validUserId,
                title: finalTitle,
                template_id: 'ats-friendly',
                content: initialContent,
              },
            ])
            .select()
            .single()

          if (!error && data) {
            createdData = data
          } else if (error) {
            console.warn('Supabase resume insert error, saving locally:', error.message)
          }
        } catch (sbErr) {
          console.warn('Supabase insert notice:', sbErr)
        }
      }

      if (!createdData) {
        const localId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'res-' + Date.now()
        createdData = {
          id: localId,
          user_id: validUserId,
          title: finalTitle,
          template_id: 'ats-friendly',
          content: initialContent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        const local = JSON.parse(localStorage.getItem('careerai_local_resumes') || '[]')
        local.unshift(createdData)
        localStorage.setItem('careerai_local_resumes', JSON.stringify(local))
      }

      setShowCreateModal(false)
      setNewTitle('')
      navigate(`/resumes/${createdData.id}`)
    } catch (err) {
      alert(`Error creating resume: ${err.message}`)
    } finally {
      setCreatingResume(false)
    }
  }

  // Duplicate resume
  const handleDuplicate = async (resume) => {
    try {
      const duplicateTitle = `${resume.title} (Copy)`
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('resumes')
          .insert([
            {
              user_id: user.id,
              title: duplicateTitle,
              template_id: resume.template_id || 'ats-friendly',
              content: resume.content,
            },
          ])
          .select()
          .single()

        if (error) throw error
        fetchResumes()
      } else {
        await fetch('/api/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            title: duplicateTitle,
            template_id: resume.template_id || 'ats-friendly',
            content: resume.content,
          }),
        })
        fetchResumes()
      }
    } catch (err) {
      alert(`Failed to duplicate resume: ${err.message}`)
    }
  }

  // Delete resume
  const handleDelete = async (idToDelete) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('resumes')
          .delete()
          .eq('id', idToDelete)

        if (error) throw error
      } else {
        await fetch(`/api/resumes/${idToDelete}`, {
          method: 'DELETE',
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        })
      }

      setResumes((prev) => prev.filter((r) => r.id !== idToDelete))
      setDeleteModalId(null)
    } catch (err) {
      alert(`Failed to delete resume: ${err.message}`)
    }
  }

  const filteredResumes = resumes.filter((r) =>
    r.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Resumes
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Create, manage, and tailor targeted resumes for different job applications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Resume</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resumes by title..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Total Resumes: <span className="font-bold text-slate-900 dark:text-white">{resumes.length}</span>
        </div>
      </div>

      {/* Resume Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading your resumes...</p>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="mt-10 p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-600/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No resumes found</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {searchTerm ? 'No resumes match your search criteria.' : "You haven't created any resumes yet. Start building your first resume step by step."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Resume</span>
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => (
            <div
              key={resume.id}
              className="p-6 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-200 group flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111827] text-slate-700 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#2A3345]">
                    {resume.template_id === 'modern-professional' ? 'Modern' : 'ATS-Friendly'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                  {resume.title || 'Untitled Resume'}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] mt-1 line-clamp-2">
                  {resume.content?.personal_info?.headline || 'Target Career Resume'}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8] mt-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Updated {new Date(resume.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#2A3345] flex items-center justify-between gap-2">
                <Link
                  to={`/resumes/${resume.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Open Builder</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDownload(resume)}
                    disabled={downloadingId === resume.id}
                    className="p-2 text-slate-500 dark:text-[#94A3B8] hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-600/15 rounded-xl transition-colors"
                    title="Download PDF"
                  >
                    {downloadingId === resume.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(resume)}
                    className="p-2 text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#222B3D] rounded-xl transition-colors"
                    title="Duplicate Resume"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteModalId(resume.id)}
                    className="p-2 text-slate-500 dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 rounded-xl transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Resume Modal - Field-Aware Onboarding */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] shadow-2xl space-y-5 my-8">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Create a Targeted Resume</h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1">
                We&apos;ll adapt your projects, questions, and skills specifically to your target field.
              </p>
            </div>

            <form onSubmit={handleCreateResume} className="space-y-5">
              
              {/* Question 1: Career Field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-800 dark:text-[#CBD5E1]">
                  1. What kind of role are you preparing your resume for?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CAREER_FIELDS.map((f) => {
                    const isSelected = selectedField === f.label
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleFieldSelect(f.label)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-purple-600/15 border-purple-600 text-purple-700 dark:text-purple-300 font-bold ring-1 ring-purple-600'
                            : 'bg-slate-50 dark:bg-[#111827] border-slate-200 dark:border-[#2A3345] text-slate-700 dark:text-[#CBD5E1] hover:border-purple-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="font-semibold line-clamp-1">{f.label}</div>
                      </button>
                    )
                  })}
                </div>

                {selectedField === 'Other / Custom Field' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      value={customField}
                      onChange={(e) => setCustomField(e.target.value)}
                      placeholder="e.g. Game Development, Blockchain, Biotech"
                      className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Question 2: Target Role */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-800 dark:text-[#CBD5E1]">
                  2. What job or role are you targeting?
                </label>
                
                {/* Suggested role chips */}
                <div className="flex flex-wrap gap-1.5">
                  {getFieldConfig(selectedField)?.roles?.map((r) => {
                    const isSelected = targetRole === r
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSelect(r)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white font-semibold shadow-xs'
                            : 'bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:border-purple-300'
                        }`}
                      >
                        {r}
                      </button>
                    )
                  })}
                </div>

                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => {
                    setTargetRole(e.target.value)
                    setNewTitle(`${e.target.value} Resume`)
                  }}
                  placeholder="e.g. Machine Learning Engineer"
                  className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Question 3: Resume Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800 dark:text-[#CBD5E1]">
                  3. Resume Title (for your workspace)
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Machine Learning Engineer Resume"
                  className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#2A3345]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingResume || !targetRole.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-md shadow-purple-600/25"
                >
                  {creatingResume ? 'Creating...' : 'Create & Open Builder →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Delete this resume?</h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1">
                This action cannot be undone. All sections and content in this resume will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-[#CBD5E1] bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#2A3345]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteModalId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
