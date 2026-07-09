import { Link } from 'react-router-dom'
import { Sparkles, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d16] py-12 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center shadow-md shadow-purple-600/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base">CareerAI</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              A career assistant for college students, freshers, and early-career job seekers. Build confident resumes, review your content, and prepare for your target roles.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300 mb-3">
              Tools
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/resumes" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Resume Builder</Link>
              </li>
              <li>
                <Link to="/analyzer" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Resume Checker</Link>
              </li>
              <li>
                <Link to="/matcher" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Job Matcher</Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Learning Plan</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300 mb-3">
              Our Promise
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <p>
                Honest guidance, clear feedback, and no invented claims. Your real achievements are what matter to recruiters.
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareerAI. Built for college students and freshers.</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Designed for clarity & simplicity</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
