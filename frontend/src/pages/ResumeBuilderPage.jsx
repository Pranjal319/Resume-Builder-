import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { getInitialResumeData } from '../lib/initialResumeData'
import { useAutosave } from '../hooks/useAutosave'

// Forms
import PersonalInfoForm from '../components/resume/sections/PersonalInfoForm'
import SummaryForm from '../components/resume/sections/SummaryForm'
import ExperienceForm from '../components/resume/sections/ExperienceForm'
import EducationForm from '../components/resume/sections/EducationForm'
import SkillsForm from '../components/resume/sections/SkillsForm'
import ProjectsForm from '../components/resume/sections/ProjectsForm'
import CertificationsForm from '../components/resume/sections/CertificationsForm'
import AchievementsForm from '../components/resume/sections/AchievementsForm'
import SocialLinksForm from '../components/resume/sections/SocialLinksForm'

// Preview
import ResumePreview from '../components/resume/templates/ResumePreview'

// Icons
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit3,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Tag,
  FolderGit2,
  Award,
  Trophy,
  Share2,
  Sparkles,
  Download,
  Loader2,
} from 'lucide-react'

export default function ResumeBuilderPage() {
  const { id } = useParams()
  const { user, profile, session } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [title, setTitle] = useState('Untitled Resume')
  const [templateId, setTemplateId] = useState('ats-friendly')
  const [content, setContent] = useState(() => getInitialResumeData(user, profile))
  const [activeSection, setActiveSection] = useState('personal_info')
  const [mobileTab, setMobileTab] = useState('editor') // 'editor' | 'preview'

  // Load resume data
  useEffect(() => {
    async function loadResume() {
      if (!id || id === 'new') {
        setContent(getInitialResumeData(user, profile, 'AI / Machine Learning', profile?.target_role || 'Machine Learning Engineer'))
        setLoading(false)
        return
      }

      try {
        let loaded = null
        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabase
              .from('resumes')
              .select('*')
              .eq('id', id)
              .maybeSingle()

            if (!error && data) {
              loaded = data
            }
          } catch (e) {}
        }

        if (!loaded) {
          const local = JSON.parse(localStorage.getItem('careerai_local_resumes') || '[]')
          loaded = local.find((r) => r.id === id)
        }

        if (loaded) {
          setTitle(loaded.title || 'Untitled Resume')
          setTemplateId(loaded.template_id || 'ats-friendly')
          if (loaded.content && Object.keys(loaded.content).length > 0) {
            setContent(loaded.content)
          }
        }
      } catch (err) {
        console.error('Failed to load resume:', err)
      } finally {
        setLoading(false)
      }
    }

    loadResume()
  }, [id, user, profile, session])

  // Save handler called by autosave hook
  const handleSaveToDatabase = useCallback(
    async (currentResumePayload) => {
      const { currentTitle, currentTemplate, currentContent } = currentResumePayload
      if (!user) return

      const validUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)
        ? user.id
        : '6bdd8dc9-2641-40ff-818a-ae147086d973'

      const payload = {
        title: currentTitle,
        template_id: currentTemplate,
        content: currentContent,
        updated_at: new Date().toISOString(),
      }

      // Always save to local storage first for instant feedback and zero data loss
      try {
        const local = JSON.parse(localStorage.getItem('careerai_local_resumes') || '[]')
        const idx = local.findIndex((r) => r.id === id)
        if (idx >= 0) {
          local[idx] = { ...local[idx], ...payload }
        } else {
          local.unshift({ id, user_id: validUserId, ...payload })
        }
        localStorage.setItem('careerai_local_resumes', JSON.stringify(local))
      } catch (e) {}

      if (isSupabaseConfigured) {
        try {
          if (id && id !== 'new') {
            await supabase.from('resumes').update(payload).eq('id', id)
          } else {
            const { data } = await supabase
              .from('resumes')
              .insert([{ ...payload, user_id: validUserId }])
              .select()
              .single()

            if (data?.id) {
              navigate(`/resumes/${data.id}`, { replace: true })
            }
          }
        } catch (sbErr) {
          console.warn('Supabase save notice:', sbErr)
        }
      } else {
        const method = id && id !== 'new' ? 'PUT' : 'POST'
        const url = id && id !== 'new' ? `/api/resumes/${id}` : '/api/resumes'

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error('API save failed')
        const result = await res.json()
        if (id === 'new' && result?.id) {
          navigate(`/resumes/${result.id}`, { replace: true })
        }
      }
    },
    [id, user, session, navigate]
  )

  const autosavePayload = {
    currentTitle: title,
    currentTemplate: templateId,
    currentContent: content,
  }

  const { status, lastSaved, saveNow } = useAutosave(autosavePayload, handleSaveToDatabase, 1200)

  // PDF Export Handler
  const handleDownloadPDF = async () => {
    setDownloadingPdf(true)
    try {
      // Flush any pending unsaved changes first
      await saveNow()

      const response = await fetch('/api/resumes/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          title,
          template_id: templateId,
          content,
        }),
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        throw new Error(errJson.detail || 'Failed to generate PDF')
      }

      // Convert response stream to blob
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Extract filename from header or formulate clean default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${title.replace(/\s+/g, '_')}_Resume.pdf`
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
      console.error('PDF generation error:', err)
      alert(`Could not download PDF: ${err.message}`)
    } finally {
      setDownloadingPdf(false)
    }
  }

  const sections = [
    { id: 'summary', label: 'About You', icon: FileText },
    { id: 'personal_info', label: 'Contact Details', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap, count: content?.education?.length },
    { id: 'skills', label: 'Skills', icon: Tag, count: content?.skills?.length },
    { id: 'projects', label: 'Projects', icon: FolderGit2, count: content?.projects?.length },
    { id: 'experience', label: 'Experience', icon: Briefcase, count: content?.experience?.length },
    { id: 'certifications', label: 'Certifications', icon: Award, count: content?.certifications?.length },
    { id: 'achievements', label: 'Achievements', icon: Trophy, count: content?.achievements?.length },
    { id: 'social_links', label: 'Links', icon: Share2, count: content?.social_links?.length },
  ]

  const currentSectionIndex = sections.findIndex(s => s.id === activeSection)
  const prevSection = currentSectionIndex > 0 ? sections[currentSectionIndex - 1] : null
  const nextSection = currentSectionIndex < sections.length - 1 ? sections[currentSectionIndex + 1] : null

  const renderSectionForm = () => {
    switch (activeSection) {
      case 'personal_info':
        return (
          <PersonalInfoForm
            data={content.personal_info || {}}
            onChange={(val) => setContent((prev) => ({ ...prev, personal_info: val }))}
          />
        )
      case 'summary':
        return (
          <SummaryForm
            data={content.summary || ''}
            onChange={(val) => setContent((prev) => ({ ...prev, summary: val }))}
            careerField={content?.career_field || 'AI / Machine Learning'}
            targetRole={content?.target_role || content?.personal_info?.headline || 'Specialist'}
            skills={content?.skills || []}
            projects={content?.projects || []}
            experience={content?.experience || []}
          />
        )
      case 'experience':
        return (
          <ExperienceForm
            data={content.experience || []}
            onChange={(val) => setContent((prev) => ({ ...prev, experience: val }))}
          />
        )
      case 'education':
        return (
          <EducationForm
            data={content.education || []}
            onChange={(val) => setContent((prev) => ({ ...prev, education: val }))}
          />
        )
      case 'skills':
        return (
          <SkillsForm
            data={content.skills || []}
            onChange={(val) => setContent((prev) => ({ ...prev, skills: val }))}
            careerField={content?.career_field || 'AI / Machine Learning'}
            targetRole={content?.target_role || content?.personal_info?.headline || ''}
          />
        )
      case 'projects':
        return (
          <ProjectsForm
            data={content.projects || []}
            onChange={(val) => setContent((prev) => ({ ...prev, projects: val }))}
            careerField={content?.career_field || 'AI / Machine Learning'}
          />
        )
      case 'certifications':
        return (
          <CertificationsForm
            data={content.certifications || []}
            onChange={(val) => setContent((prev) => ({ ...prev, certifications: val }))}
          />
        )
      case 'achievements':
        return (
          <AchievementsForm
            data={content.achievements || []}
            onChange={(val) => setContent((prev) => ({ ...prev, achievements: val }))}
          />
        )
      case 'social_links':
        return (
          <SocialLinksForm
            data={content.social_links || []}
            onChange={(val) => setContent((prev) => ({ ...prev, social_links: val }))}
          />
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading resume workspace...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      
      {/* Top Action Bar */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Back & Title Editor */}
        <div className="flex items-center gap-3">
          <Link
            to="/resumes"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title="Back to all resumes"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resume Title"
              className="bg-transparent font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-purple-500 rounded-lg px-2 py-1 transition-colors"
            />
          </div>
        </div>

        {/* Right: Autosave Status, Manual Save & Download PDF */}
        <div className="flex items-center gap-3">
          
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setMobileTab('editor')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                mobileTab === 'editor' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                mobileTab === 'preview' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Live Preview
            </button>
          </div>

          {/* Autosave Pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            {status === 'saving' && (
              <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {status === 'saved' && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {lastSaved
                    ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                    : 'All changes saved'}
                </span>
              </span>
            )}
            {status === 'unsaved' && (
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes</span>
              </span>
            )}
            {status === 'error' && (
              <span className="flex items-center gap-1.5 text-rose-500">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Autosave failed</span>
              </span>
            )}
          </div>

          {/* Manual Save Button */}
          <button
            type="button"
            onClick={saveNow}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Resume</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>

      </div>

      {/* Main Split-Screen Workspace */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 max-w-full h-[calc(100vh-7.5rem)] overflow-hidden">
        
        {/* Left Form Editor Column (5 cols) */}
        <div
          className={`lg:col-span-6 xl:col-span-5 h-full flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 ${
            mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Section Navigation Tabs */}
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {sections.map((sec) => {
              const Icon = sec.icon
              const isSelected = activeSection === sec.id
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                  {typeof sec.count === 'number' && sec.count > 0 && (
                    <span
                      className={`text-[10px] px-1 rounded-full ${
                        isSelected ? 'bg-purple-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {sec.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Form Content Area */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 shadow-lg space-y-6">
              
              {/* Field & Role Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400">{content?.career_field || 'Target Field'}</span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{content?.target_role || content?.personal_info?.headline || 'Target Role'}</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Step {currentSectionIndex + 1} of {sections.length}: {sections[currentSectionIndex]?.label}
                </span>
              </div>

              {/* Active Section Form */}
              {renderSectionForm()}

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800/80">
                {prevSection ? (
                  <button
                    type="button"
                    onClick={() => setActiveSection(prevSection.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium transition-colors"
                  >
                    ← Previous: {prevSection.label}
                  </button>
                ) : <div />}

                {nextSection ? (
                  <button
                    type="button"
                    onClick={() => setActiveSection(nextSection.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
                  >
                    Next: {nextSection.label} →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={saveNow}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
                  >
                    Save & Finish Resume ✓
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right Live Preview Column (7 cols) */}
        <div
          className={`lg:col-span-6 xl:col-span-7 h-full flex flex-col bg-slate-100 dark:bg-slate-950/90 p-4 ${
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <ResumePreview
            content={content}
            templateId={templateId}
            onTemplateChange={setTemplateId}
            onDownloadPdf={handleDownloadPDF}
            downloadingPdf={downloadingPdf}
          />
        </div>

      </div>
    </div>
  )
}
