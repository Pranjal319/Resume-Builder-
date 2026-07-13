import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Globe, 
  Link2,
  GraduationCap, 
  Code2, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Layers
} from 'lucide-react'
import { CAREER_FIELDS } from '../lib/fieldConfigs'

export default function ProfilePage() {
  const { user, profile, updateProfile, refreshProfile } = useAuth()

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    target_role: '',
    career_field: 'aiml',
    skills: '',
    education: '',
    portfolio_url: '',
    github_url: '',
    linkedin_url: '',
    headline: '',
  })

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        target_role: profile.target_role || '',
        career_field: profile.career_field || 'aiml',
        skills: profile.skills || '',
        education: profile.education || '',
        portfolio_url: profile.portfolio_url || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        headline: profile.headline || '',
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Calculate profile completeness
  const calculateCompleteness = () => {
    const fields = [
      { key: 'full_name', weight: 15, name: 'Full Name' },
      { key: 'location', weight: 10, name: 'Location' },
      { key: 'target_role', weight: 15, name: 'Target Role' },
      { key: 'career_field', weight: 10, name: 'Career Field' },
      { key: 'skills', weight: 15, name: 'Skills' },
      { key: 'education', weight: 10, name: 'Education' },
      { key: 'linkedin_url', weight: 10, name: 'LinkedIn' },
      { key: 'github_url', weight: 10, name: 'GitHub' },
      { key: 'portfolio_url', weight: 5, name: 'Portfolio' },
    ]

    let score = 0
    let firstMissing = null

    fields.forEach(f => {
      if (formData[f.key] && formData[f.key].trim() !== '') {
        score += f.weight
      } else if (!firstMissing) {
        firstMissing = f.name
      }
    })

    return {
      percentage: Math.min(score, 100),
      missingText: firstMissing ? `Add your ${firstMissing} to complete your profile.` : 'Your profile is completely filled out! 🎉'
    }
  }

  const { percentage, missingText } = calculateCompleteness()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProfile(formData)
      await refreshProfile()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Profile
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active Student
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Keep your background details updated so your resumes and job matches stay accurate.
          </p>
        </div>
      </div>

      {/* Profile Progress Indicator */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Profile Progress: <span className="text-purple-600 dark:text-purple-400 font-extrabold">{percentage}%</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {missingText}
            </div>
          </div>
          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-500/25">
            {percentage === 100 ? 'All Set 🌟' : `${100 - percentage}% Remaining`}
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div
            style={{ width: `${percentage}%` }}
            className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Personal Information */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Personal Information
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Contact details for recruiters to reach out to you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address <span className="text-slate-500 text-[10px]">(Account Email)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || profile?.email || ''}
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. New Delhi, India"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 2. Target Role & Education */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Career Field & Background
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Defines the role-specific suggestions CareerAI gives you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Career Field */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Career Field
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  name="career_field"
                  value={formData.career_field}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  {CAREER_FIELDS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.icon} {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Target Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="target_role"
                  value={formData.target_role}
                  onChange={handleChange}
                  placeholder="e.g. Junior ML Engineer, Web Developer"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Education */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Education
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech in Computer Science, 2022 - 2026"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Key Skills <span className="text-slate-500 text-[10px]">(Comma-separated)</span>
              </label>
              <div className="relative">
                <Code2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  name="skills"
                  rows={2}
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. Python, PyTorch, Pandas, Scikit-learn, SQL, Git"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>
            </div>

            {/* About You */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                About You
              </label>
              <textarea
                name="headline"
                rows={3}
                value={formData.headline}
                onChange={handleChange}
                placeholder="Final year student passionate about AI/ML. Looking for entry-level opportunities to build data-driven products."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>

          </div>
        </div>

        {/* 3. Links & Portfolios */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/70 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Links & Profiles
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Add your online presence so recruiters can verify your projects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                LinkedIn
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/username"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                GitHub
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="github.com/username"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Portfolio */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Portfolio / Website
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  placeholder="myportfolio.dev"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Action Button */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="text-slate-500">
            Changes saved here update your candidate profile.
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>

      </form>
    </div>
  )
}
