import { Mail, Phone, MapPin, Globe, Award, Trophy, GraduationCap, Briefcase, FolderGit2 } from 'lucide-react'

export default function ModernProfessionalTemplate({ content = {} }) {
  const {
    personal_info = {},
    summary = '',
    education = [],
    skills = [],
    projects = [],
    experience = [],
    certifications = [],
    achievements = [],
    social_links = [],
  } = content

  return (
    <div className="bg-white text-slate-800 p-8 sm:p-12 font-sans text-[13px] leading-relaxed shadow-xl max-w-[850px] mx-auto min-h-[1100px] border border-slate-200 print:shadow-none print:border-none print:p-0">
      
      {/* Executive Header Banner */}
      <header className="border-b-2 border-indigo-600 pb-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              {personal_info.full_name || 'Your Name'}
            </h1>
            <div className="text-sm font-semibold text-indigo-600 mt-0.5 tracking-wide">
              {personal_info.headline || content.target_role || 'Target Role'}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 sm:text-right">
            {personal_info.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-indigo-500" />
                <span>{personal_info.email}</span>
              </div>
            )}
            {personal_info.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-indigo-500" />
                <span>{personal_info.phone}</span>
              </div>
            )}
            {personal_info.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-500" />
                <span>{personal_info.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Links bar */}
        {(personal_info.website || social_links.length > 0) && (
          <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-slate-100 text-xs text-slate-600">
            {personal_info.website && (
              <a href={personal_info.website} className="flex items-center gap-1 text-indigo-600 hover:underline">
                <Globe className="w-3 h-3" />
                <span>{personal_info.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            {social_links.map((link, idx) => (
              link.url && (
                <a key={idx} href={link.url} className="flex items-center gap-1 hover:text-indigo-600">
                  <span className="text-slate-400">•</span>
                  <span>{link.username || link.platform}</span>
                </a>
              )
            ))}
          </div>
        )}
      </header>

      {/* Professional Summary */}
      {summary && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 pb-1 border-b border-indigo-100 mb-2">
            <span>Executive Profile</span>
          </h2>
          <p className="text-slate-700 text-xs leading-relaxed">
            {summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 pb-1 border-b border-indigo-100 mb-3">
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>Work Experience</span>
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="relative pl-3 border-l-2 border-indigo-200">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-xs">{exp.position}</span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {exp.company} {exp.location && `• ${exp.location}`}
                </div>
                {exp.description && (
                  <div className="mt-1 text-slate-700 text-xs whitespace-pre-line leading-relaxed">
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 pb-1 border-b border-indigo-100 mb-3">
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Featured Projects</span>
          </h2>
          <div className="grid grid-cols-1 gap-3.5">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between items-baseline">
                  <div className="font-bold text-slate-900 text-xs">
                    {proj.title}
                    {proj.role && <span className="text-slate-500 font-normal"> ({proj.role})</span>}
                  </div>
                  {(proj.start_date || proj.end_date) && (
                    <span className="text-[10px] text-slate-500">
                      {proj.start_date} – {proj.end_date}
                    </span>
                  )}
                </div>
                {proj.tech_stack && (
                  <div className="text-[10px] font-semibold text-indigo-600 mt-0.5">
                    Stack: {proj.tech_stack}
                  </div>
                )}
                {proj.description && (
                  <div className="mt-1 text-slate-700 text-xs whitespace-pre-line leading-relaxed">
                    {proj.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Matrix */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 pb-1 border-b border-indigo-100 mb-2">
            <span>Core Competencies</span>
          </h2>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((s) => (
              <span
                key={s.id}
                className="text-[11px] font-medium bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200"
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 2-Column Grid for Education & Credentials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Education */}
        {education.length > 0 && education.some(edu => edu.school?.trim() || edu.degree?.trim()) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 pb-1 border-b border-indigo-100 mb-2.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Education</span>
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-slate-900 text-xs">{edu.school}</div>
                  <div className="text-slate-700 text-xs">
                    {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>{edu.start_date} – {edu.end_date}</span>
                    {edu.gpa && <span className="font-semibold text-slate-600">GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Achievements */}
        {(certifications.length > 0 || achievements.length > 0) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 pb-1 border-b border-indigo-100 mb-2.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Credentials & Honors</span>
            </h2>
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="text-xs">
                  <div className="font-bold text-slate-900">{cert.name}</div>
                  <div className="text-slate-600 text-[11px]">{cert.issuer} • {cert.issue_date}</div>
                </div>
              ))}
              {achievements.map((ach) => (
                <div key={ach.id} className="text-xs pt-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    <span>{ach.title}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{ach.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
