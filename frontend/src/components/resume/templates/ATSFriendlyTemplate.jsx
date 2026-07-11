export default function ATSFriendlyTemplate({ content = {} }) {
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
    <div className="bg-white text-black p-8 sm:p-12 font-serif text-[13px] leading-relaxed shadow-lg max-w-[850px] mx-auto min-h-[1100px] border border-gray-200 print:shadow-none print:border-none print:p-0">
      {/* Header / Contact Information */}
      <header className="text-center pb-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-black">
          {personal_info.full_name || 'YOUR NAME'}
        </h1>
        {(personal_info.headline || content.target_role) && (
          <div className="text-[13px] font-semibold text-gray-800 mt-0.5">
            {personal_info.headline || content.target_role}
          </div>
        )}

        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-gray-700 mt-2 font-sans">
          {personal_info.location && <span>{personal_info.location}</span>}
          {personal_info.phone && (
            <>
              <span>•</span>
              <span>{personal_info.phone}</span>
            </>
          )}
          {personal_info.email && (
            <>
              <span>•</span>
              <span>{personal_info.email}</span>
            </>
          )}
          {personal_info.website && (
            <>
              <span>•</span>
              <span>{personal_info.website.replace(/^https?:\/\//, '')}</span>
            </>
          )}
          {social_links.map((link, idx) => (
            link.url && (
              <span key={idx} className="flex items-center gap-1">
                <span>•</span>
                <span>{link.username || link.platform}</span>
              </span>
            )
          ))}
        </div>
      </header>

      {/* Professional Summary */}
      {summary && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-400 pb-0.5 mb-2">
            Professional Summary
          </h2>
          <p className="text-gray-900 text-justify font-sans text-xs leading-normal">
            {summary}
          </p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-400 pb-0.5 mb-2">
            Technical Skills
          </h2>
          <div className="text-xs font-sans text-gray-900 space-y-1">
            {Object.entries(
              skills.reduce((acc, s) => {
                const cat = s.category || 'Competencies'
                if (!acc[cat]) acc[cat] = []
                acc[cat].push(s.name)
                return acc
              }, {})
            ).map(([category, names]) => (
              <div key={category} className="flex flex-wrap">
                <span className="font-bold mr-2 text-black">{category}:</span>
                <span className="text-gray-800">{names.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-400 pb-0.5 mb-2">
            Work Experience
          </h2>
          <div className="space-y-4 font-sans text-xs">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-black">
                  <span>{exp.position} — <span className="font-semibold text-gray-800">{exp.company}</span></span>
                  <span className="text-[11px] font-medium text-gray-700 whitespace-nowrap">
                    {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                  </span>
                </div>
                {exp.location && (
                  <div className="text-[11px] italic text-gray-600 mb-1">{exp.location}</div>
                )}
                {exp.description && (
                  <div className="mt-1 text-gray-800 whitespace-pre-line leading-relaxed pl-2 border-l border-gray-200">
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Projects */}
      {projects.length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-400 pb-0.5 mb-2">
            Projects
          </h2>
          <div className="space-y-3.5 font-sans text-xs">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <div className="font-bold text-black">
                    {proj.title}
                    {proj.role && <span className="font-normal text-gray-700"> | {proj.role}</span>}
                  </div>
                  {(proj.start_date || proj.end_date) && (
                    <span className="text-[11px] text-gray-700">
                      {proj.start_date} – {proj.end_date}
                    </span>
                  )}
                </div>
                {proj.tech_stack && (
                  <div className="text-[11px] font-semibold text-gray-700 italic mb-1">
                    Tech: {proj.tech_stack}
                  </div>
                )}
                {proj.description && (
                  <div className="mt-0.5 text-gray-800 whitespace-pre-line leading-relaxed pl-2 border-l border-gray-200">
                    {proj.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && education.some(edu => edu.school?.trim() || edu.degree?.trim()) && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-400 pb-0.5 mb-2">
            Education
          </h2>
          <div className="space-y-3 font-sans text-xs">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline font-bold text-black">
                  <span>{edu.school}</span>
                  <span className="text-[11px] font-medium text-gray-700">
                    {edu.start_date} – {edu.end_date}
                  </span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>
                    {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                  </span>
                  {edu.gpa && <span className="font-semibold text-gray-700">GPA: {edu.gpa}</span>}
                </div>
                {edu.description && (
                  <p className="text-[11px] text-gray-700 mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Achievements */}
      {(certifications.length > 0 || achievements.length > 0) && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-400 pb-0.5 mb-2">
            Certifications & Honors
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs font-sans text-gray-800">
            {certifications.map((cert) => (
              <li key={cert.id}>
                <span className="font-bold text-black">{cert.name}</span> — {cert.issuer} ({cert.issue_date})
              </li>
            ))}
            {achievements.map((ach) => (
              <li key={ach.id}>
                <span className="font-bold text-black">{ach.title}</span> ({ach.date}): {ach.description}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
