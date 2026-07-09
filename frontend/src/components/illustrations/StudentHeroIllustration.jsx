export default function StudentHeroIllustration({ className = "w-full max-w-lg mx-auto" }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Soft Ambient Glow in Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/25 via-indigo-500/20 to-pink-500/15 dark:from-purple-600/35 dark:via-indigo-600/25 dark:to-transparent rounded-full blur-3xl transform -translate-y-2 scale-90 pointer-events-none" />

      {/* Circular backdrop shape & Character */}
      <div className="relative flex items-center justify-center w-full">
        {/* Soft Circular Backdrop */}
        <div className="absolute w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full bg-purple-100/70 dark:bg-purple-900/25 border border-purple-200/60 dark:border-purple-500/25 -z-10" />
        <div
          className="absolute w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] rounded-full border border-dashed border-purple-300/50 dark:border-purple-500/20 -z-10"
        />

        {/* The Exact User-Provided Student Hero Image */}
        <img
          src="/hero-student-transparent.png"
          alt="Student preparing resume on laptop"
          className="relative z-10 w-full max-w-[430px] h-auto object-contain drop-shadow-xl"
        />

        {/* Floating Badge 1: Ready to Apply */}
        <div
          className="absolute -top-2 right-2 sm:right-6 z-20 bg-white dark:bg-[#1A2130] border border-purple-200 dark:border-[#2A3345] px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-bounce"
          style={{ animationDuration: '4s' }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Ready to Apply</span>
        </div>

        {/* Floating Badge 2: Job Match */}
        <div
          className="absolute bottom-6 -left-2 sm:left-2 z-20 bg-white dark:bg-[#1A2130] border border-purple-200 dark:border-[#2A3345] px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-bounce"
          style={{ animationDuration: '5s', animationDelay: '1s' }}
        >
          <span className="text-base">🎯</span>
          <div className="text-left">
            <div className="text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">Job Match</div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">95% Match ✓</div>
          </div>
        </div>
      </div>
    </div>
  )
}
