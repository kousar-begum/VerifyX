import React from 'react';
import { ShieldAlert, FileQuestion, ArrowRight } from 'lucide-react';
import { GlowButton } from './GlowButton';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  badgeText?: string;
  type?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  badgeText,
  type,
  className = '',
}) => {
  const effectiveAction = actionLabel || actionText;
  return (
    <GlassCard className={`p-8 md:p-12 text-center max-w-xl mx-auto my-6 border-dashed ${className}`}>
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          {icon || <FileQuestion className="w-8 h-8" />}
        </div>

        {badgeText && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-3">
            <ShieldAlert className="w-3 h-3 text-amber-500" />
            {badgeText}
          </span>
        )}

        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          {description}
        </p>

        {effectiveAction && onAction && (
          <GlowButton
            variant="primary"
            onClick={onAction}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {effectiveAction}
          </GlowButton>
        )}
      </div>
    </GlassCard>
  );
};
