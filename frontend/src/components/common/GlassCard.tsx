import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  borderAccent?: 'cyan' | 'blue' | 'violet' | 'amber' | 'emerald' | 'rose' | 'none';
  interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className = '',
      glow = false,
      borderAccent = 'none',
      interactive = false,
      ...props
    },
    ref
  ) => {
    const accentClasses: Record<string, string> = {
      cyan: 'border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.12)]',
      blue: 'border-blue-500/30 hover:border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.12)]',
      violet: 'border-violet-500/30 hover:border-violet-400/60 shadow-[0_0_20px_rgba(139,92,246,0.12)]',
      amber: 'border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.12)]',
      emerald: 'border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.12)]',
      rose: 'border-rose-500/30 hover:border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.12)]',
      none: 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700',
    };

    return (
      <div
        ref={ref}
        className={`
          relative rounded-xl transition-all duration-200 backdrop-blur-md
          bg-white/80 dark:bg-slate-900/75
          border ${accentClasses[borderAccent] || accentClasses.none}
          ${glow ? 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_0_30px_rgba(6,182,212,0.15)]' : 'shadow-sm dark:shadow-md'}
          ${interactive ? 'hover:-translate-y-0.5 cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
