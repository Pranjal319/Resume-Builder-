import React from 'react'

export function RadialGauge({ value = 0, size = 100, strokeWidth = 8, label = '', sublabel = '' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (circumference * Math.min(100, Math.max(0, value))) / 100

  const getColor = (val) => {
    if (val >= 80) return 'text-emerald-400'
    if (val >= 65) return 'text-indigo-400'
    if (val >= 50) return 'text-amber-400'
    return 'text-rose-400'
  }

  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800/80"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${getColor(value)} transition-all duration-700 ease-out`}
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
          {value}%
        </span>
        {label && (
          <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5 tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

export function MetricBar({ label, value = 0, max = 100, color = 'indigo' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-400',
    emerald: 'from-emerald-500 to-emerald-400',
    purple: 'from-purple-500 to-purple-400',
    amber: 'from-amber-500 to-amber-400',
  }[color] || 'from-indigo-500 to-indigo-400'

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex justify-between items-center text-slate-300">
        <span className="font-medium text-[11px] truncate max-w-[200px]">{label}</span>
        <span className="font-bold text-white text-[11px] font-mono">{value} / {max}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden">
        <div
          style={{ width: `${percent}%` }}
          className={`h-full bg-gradient-to-r ${colorClasses} rounded-full transition-all duration-500`}
        />
      </div>
    </div>
  )
}
