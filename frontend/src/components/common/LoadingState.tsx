import React, { useState, useEffect } from 'react';
import { Shield, ScanLine, Cpu, Search, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  message?: string;
  submessage?: string;
  steps?: string[];
  currentStepIndex?: number;
}

const DEFAULT_STEPS = [
  'Extracting Document Container & EXIF Metadata',
  'Executing Error Level Analysis (ELA) on Bitmaps',
  'Neural OCR Glyph & Alignment Cross-Verification',
  'Multi-spectral Tampering Anomaly Scoring',
  'Synthesizing Forensic Confidence Dossier',
];

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  subtitle,
  message,
  submessage,
  steps = DEFAULT_STEPS,
  currentStepIndex,
}) => {
  const displayTitle = message || title || 'Forensic Neural Pipeline Active';
  const displaySubtitle =
    submessage ||
    subtitle ||
    'Scanning document layers for visual, text, and metadata tampering...';
  const [internalStep, setInternalStep] = useState(0);

  useEffect(() => {
    if (currentStepIndex !== undefined) {
      setInternalStep(currentStepIndex);
      return;
    }
    const interval = setInterval(() => {
      setInternalStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [currentStepIndex, steps.length]);

  return (
    <GlassCard className="p-8 md:p-12 max-w-xl mx-auto my-8 border-cyan-500/40 relative overflow-hidden" glow>
      {/* Radar scanning background line */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="flex flex-col items-center text-center">
        {/* Radar Graphic */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          {/* Outer radar circle */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-25" />
          <div className="absolute inset-2 rounded-full border border-cyan-500/40 border-dashed animate-spin duration-1000" />
          <div className="absolute inset-6 rounded-full border border-cyan-400/60" />
          
          {/* Radar sweep beam */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-transparent animate-radar-sweep pointer-events-none" />

          {/* Center core */}
          <div className="relative z-10 w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            <ScanLine className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          {displayTitle}
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
          {displaySubtitle}
        </p>

        {/* Dynamic pipeline steps */}
        <div className="w-full space-y-2.5 text-left bg-slate-100/70 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          {steps.map((step, idx) => {
            const isCompleted = idx < internalStep;
            const isCurrent = idx === internalStep;
            return (
              <div
                key={step}
                className={`flex items-center gap-3 text-xs font-mono transition-colors duration-300 ${
                  isCurrent
                    ? 'text-cyan-500 dark:text-cyan-400 font-semibold'
                    : isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 shrink-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-4 h-4 shrink-0 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px]">
                    {idx + 1}
                  </div>
                )}
                <span className="truncate">{step}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <Search className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
          <span>Awaiting verified forensic stream from FastAPI backend</span>
        </div>
      </div>
    </GlassCard>
  );
};
