import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, HelpCircle, Activity } from 'lucide-react';
import { RiskCategory } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { useLanguage } from '../../context/LanguageContext';

interface RiskScoreProps {
  score: number | null;
  category: RiskCategory | null;
  confidence: number | null;
  status?: string;
  className?: string;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  category,
  confidence,
  status = 'completed',
  className = '',
}) => {
  const { t } = useLanguage();

  if (score === null || category === null) {
    return (
      <GlassCard className={`p-6 text-center border-dashed ${className}`}>
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.analysisResult.overallRisk}
          </h4>
          <p className="text-xs text-slate-500 font-mono">
            Awaiting backend forensic score
          </p>
        </div>
      </GlassCard>
    );
  }

  // Category styling
  const categoryConfig: Record<
    RiskCategory,
    {
      label: string;
      color: string;
      bgColor: string;
      borderColor: string;
      glowColor: string;
      icon: React.ReactNode;
    }
  > = {
    LOW: {
      label: 'Low Risk',
      color: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/30',
      glowColor: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    },
    MEDIUM: {
      label: 'Medium Risk',
      color: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-500/15',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
      icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
    },
    HIGH: {
      label: 'High Risk',
      color: 'text-orange-500 dark:text-orange-400',
      bgColor: 'bg-orange-500/15',
      borderColor: 'border-orange-500/30',
      glowColor: 'shadow-[0_0_30px_rgba(249,115,22,0.25)]',
      icon: <ShieldAlert className="w-6 h-6 text-orange-400" />,
    },
    CRITICAL: {
      label: 'Critical Tampering Detected',
      color: 'text-rose-500 dark:text-rose-400',
      bgColor: 'bg-rose-500/15',
      borderColor: 'border-rose-500/40',
      glowColor: 'shadow-[0_0_35px_rgba(244,63,94,0.35)]',
      icon: <ShieldX className="w-6 h-6 text-rose-400" />,
    },
    UNCERTAIN: {
      label: 'Uncertain / Low Resolution',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/15',
      borderColor: 'border-slate-500/30',
      glowColor: 'shadow-none',
      icon: <HelpCircle className="w-6 h-6 text-slate-400" />,
    },
  };

  const config = categoryConfig[category] || categoryConfig.UNCERTAIN;

  // SVG circular gauge math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <GlassCard className={`p-6 ${config.glowColor} ${className}`} glow>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Circular gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
            {/* Background circle track */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated risk score stroke */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              className={`transition-all duration-1000 ease-out ${
                category === 'LOW'
                  ? 'stroke-emerald-500'
                  : category === 'MEDIUM'
                  ? 'stroke-amber-500'
                  : 'stroke-rose-500'
              }`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Centered Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {score}
              <span className="text-sm font-normal text-slate-400">%</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Risk Index
            </span>
          </div>
        </div>

        {/* Right: Category details */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.bgColor} ${config.color} border ${config.borderColor}`}
            >
              {config.icon}
              {config.label}
            </span>

            {confidence !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Confidence: {confidence}%</span>
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.analysisResult.overallRisk}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
            {category === 'LOW'
              ? 'Document demonstrates high structural integrity. No significant tampering or visual manipulation detected.'
              : category === 'MEDIUM'
              ? 'Moderate variances detected in font typography, metadata timestamps, or compression artifacts.'
              : category === 'CRITICAL' || category === 'HIGH'
              ? 'Critical anomalies detected: high probability of digital image splicing, altered text fields, or modified identity credentials.'
              : 'Forensic evaluation indeterminate. Recommended to re-upload high-resolution scan.'}
          </p>
        </div>
      </div>
    </GlassCard>
  );
};
