import { useState } from 'react'
import ATSFriendlyTemplate from './ATSFriendlyTemplate'
import ModernProfessionalTemplate from './ModernProfessionalTemplate'
import { ZoomIn, ZoomOut, RotateCcw, LayoutTemplate, Sparkles, Check, Download, Loader2 } from 'lucide-react'

export default function ResumePreview({
  content,
  templateId = 'ats-friendly',
  onTemplateChange,
  onDownloadPdf,
  downloadingPdf = false,
}) {
  const [zoom, setZoom] = useState(0.85)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.2))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5))
  const handleResetZoom = () => setZoom(0.85)

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
      
      {/* Top Toolbar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Template Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onTemplateChange?.('ats-friendly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              templateId === 'ats-friendly'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {templateId === 'ats-friendly' && <Check className="w-3 h-3" />}
            <span>Clean & Recruiter-Ready</span>
          </button>

          <button
            type="button"
            onClick={() => onTemplateChange?.('modern-professional')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              templateId === 'modern-professional'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {templateId === 'modern-professional' && <Check className="w-3 h-3" />}
            <span>Modern Executive</span>
          </button>
        </div>

        {/* Right Tools: Zoom Controls & Download Button */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-slate-400">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] font-mono px-2 text-slate-300 min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Quick PDF export trigger */}
          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={downloadingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Download PDF"
            >
              {downloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <Download className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>PDF</span>
            </button>
          )}
        </div>

      </div>

      {/* Sheet Preview Canvas */}
      <div className="flex-grow overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/90 custom-scrollbar">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full flex justify-center"
        >
          {templateId === 'modern-professional' ? (
            <ModernProfessionalTemplate content={content} />
          ) : (
            <ATSFriendlyTemplate content={content} />
          )}
        </div>
      </div>

    </div>
  )
}
