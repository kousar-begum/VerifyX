import React from 'react';
import { Server, Activity, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useBackendStatus } from '../../context/BackendStatusContext';
import { useLanguage } from '../../context/LanguageContext';

export const BackendBanner: React.FC = () => {
  const { isConnected, isChecking, apiBaseUrl, checkConnection, serverDiagnostics } = useBackendStatus();
  const { t } = useLanguage();

  return (
    <aside aria-label="Backend status" className="w-full bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-300 py-1.5 px-4 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 hidden sm:inline">{t.common.backendStatus}:</span>
          </span>

          {isConnected === true ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FastAPI Gateway Connected
              {serverDiagnostics?.latencyMs && (
                <span className="text-emerald-500/80 text-[10px]">({serverDiagnostics.latencyMs}ms)</span>
              )}
            </span>
          ) : isConnected === false ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Standalone Mode Active (In-Browser Forensic Engine)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
              <Activity className="w-3 h-3 animate-spin" />
              Detecting Engine...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px] hidden md:inline">
            100% Functional Without Server • Optional FastAPI ({apiBaseUrl})
          </span>
          <button
            onClick={() => checkConnection()}
            disabled={isChecking}
            title="Check FastAPI Backend Connection"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isChecking ? 'Checking...' : 'Check FastAPI'}</span>
          </button>
        </div>

      </div>
    </aside>
  );
};
