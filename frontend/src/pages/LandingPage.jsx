import { Link } from 'react-router-dom'
import { 
  FileText, 
  SearchCheck, 
  Briefcase, 
  Compass, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  HelpCircle
} from 'lucide-react'
import StudentHeroIllustration from '../components/illustrations/StudentHeroIllustration'

export default function LandingPage() {
  const actions = [
    {
      title: "Build Your Resume",
      desc: "Create a clean, focused resume step by step tailored to your field.",
      icon: FileText,
      tag: "Field-Aware",
      link: "/resumes",
      btnText: "Create Resume"
    },
    {
      title: "Check Your Resume",
      desc: "Get practical suggestions on formatting, readability, and content.",
      icon: SearchCheck,
      tag: "Readability Score",
      link: "/analyzer",
      btnText: "Check Resume"
    },
    {
      title: "Check a Job",
      desc: "Paste any job posting and see what you already have and what you may need.",
      icon: Briefcase,
      tag: "Job Matcher",
      link: "/matcher",
      btnText: "Check Match"
    },
    {
      title: "Find Skills to Learn",
      desc: "See which skills could help you move closer to your target role.",
      icon: Compass,
      tag: "30-Day Plan",
      link: "/roadmap",
      btnText: "View Plan"
    }
  ]

  const howItWorks = [
    {
      number: "1",
      title: "Choose your target role",
      desc: "Pick your field (AIML, Web Dev, Data Analytics, Cybersecurity, etc.) so we know which questions matter."
    },
    {
      number: "2",
      title: "Fill in what you've actually done",
      desc: "Add your coursework, projects, tools, and experiences. No fake data or inflated claims."
    },
    {
      number: "3",
      title: "Review, compare, and download",
      desc: "See your readability score, compare against real job descriptions, and export a clean PDF."
    }
  ]

  return (
    <div className="space-y-24 py-8 sm:py-14">
      
      {/* Hero Section with Student Illustration */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Hero Content (7 cols on lg) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Subtle Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/25 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Student Career Assistant • Simple & Practical</span>
            </div>

            {/* Hero Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] leading-tight sm:leading-[1.15]">
              Build a resume you&apos;re{" "}
              <span className="text-purple-600 dark:text-purple-400">confident about.</span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-[#CBD5E1] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Create your resume, see what you can improve, and check how well it fits the jobs you&apos;re interested in.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <Link
                to="/resumes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Create My Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/analyzer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#1A2130] hover:bg-slate-50 dark:hover:bg-[#222B3D] text-slate-800 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#2A3345] font-semibold text-xs sm:text-sm shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                <SearchCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Check My Resume</span>
              </Link>
            </div>

            {/* Micro reassurance checklist */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 dark:text-[#94A3B8]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero fake boilerplate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Field-adapted skills</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>ATS friendly format</span>
              </div>
            </div>

          </div>

          {/* Right Hero Illustration (5 cols on lg) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <StudentHeroIllustration className="w-full max-w-md lg:max-w-none" />
          </div>

        </div>
      </section>

      {/* "What can you do today?" Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            What can you do today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8]">
            Four focused tools to help you get your resume and job applications ready.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {actions.map((act) => {
            const Icon = act.icon
            return (
              <div
                key={act.title}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] hover:shadow-lg transition-all group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-600/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-500/20">
                      {act.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                      {act.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1.5 leading-relaxed">
                      {act.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    to={act.link}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>{act.btnText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works for students */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-[#2A3345] bg-white dark:bg-[#1A2130] space-y-8">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              How CareerAI helps you
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8]">
              Straightforward guidance to make sure your resume tells your true story clearly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {howItWorks.map((step) => (
              <div key={step.number} className="space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                  {step.number}
                </div>
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Human Explanation: What is Resume Screening? */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-200 dark:border-[#2A3345] bg-purple-50/50 dark:bg-[#1A2130] flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Why do many resumes never reach a human recruiter?
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
              Most companies scan resumes first for specific skills, clear sections, and readable formatting. If a resume has confusing multi-column tables or misses key tools you know, it may get filtered out before an interview. <b>CareerAI</b> reviews your resume to ensure it is clean, easy to read, and accurately represents what you know.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Ready to review or build your resume?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] max-w-md mx-auto">
          Start for free. No credit card required. Built to help students land their first internships and jobs.
        </p>
        <div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
