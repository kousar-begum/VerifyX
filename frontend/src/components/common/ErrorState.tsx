import React from 'react';
import { AlertTriangle, RefreshCw, ServerOff, ExternalLink } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlowButton } from './GlowButton';
import { useBackendStatus } from '../../context/BackendStatusContext';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isNetworkError?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Forensic Request Failed',
  message,
  onRetry,
  isNetworkError = false,
}) => {
  const { apiBaseUrl } = useBackendStatus();

  return (
    <GlassCard className="p-8 md:p-10 max-w-xl mx-auto my-6 border-rose-500/40" borderAccent="rose">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-500 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          {isNetworkError ? <ServerOff className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
        </div>

        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md">
          {message}
        </p>

        {isNetworkError && (
          <div className="w-full text-left bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 mb-5 space-y-1">
            <div className="text-cyan-400 font-semibold">Backend Integration Note:</div>
            <div>Configured URL: <span className="text-amber-400">{apiBaseUrl}</span></div>
            <div className="text-slate-400 text-[11px]">
              Make sure your FastAPI server is started (e.g. <code className="text-cyan-300">uvicorn main:app --reload --port 8000</code>).
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          {onRetry && (
            <GlowButton
              variant="primary"
              size="sm"
              onClick={onRetry}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Pipeline Request
            </GlowButton>
          )}
          <a
            href="#/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Check API Settings
          </a>
        </div>
      </div>
    </GlassCard>
  );
};
