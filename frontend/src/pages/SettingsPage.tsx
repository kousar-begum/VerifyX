import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Globe,
  Server,
  Zap,
  Bell,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Database,
  HardDrive,
  ShieldAlert,
  Key,
  Layers,
  FileCheck,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { GlowButton } from '../components/common/GlowButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, languageNames } from '../context/LanguageContext';
import { useBackendStatus } from '../context/BackendStatusContext';
import { SupportedLanguage } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKETS, testSupabaseConnection } from '../services/supabaseClient';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, reducedMotion, setReducedMotion } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const {
    isConnected,
    isChecking,
    apiBaseUrl,
    setApiBaseUrl,
    checkConnection,
    serverDiagnostics,
    supabaseStatus,
    checkSupabase,
  } = useBackendStatus();

  const [inputBaseUrl, setInputBaseUrl] = useState<string>(apiBaseUrl);
  const [showAnonKey, setShowAnonKey] = useState<boolean>(false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [highRiskPrompt, setHighRiskPrompt] = useState<boolean>(true);
  const [autoExportPdf, setAutoExportPdf] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState<boolean>(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{
    connected: boolean;
    message: string;
    latencyMs?: number;
    buckets?: string[];
  } | null>(null);

  const handleSaveSettings = () => {
    if (inputBaseUrl.trim() !== apiBaseUrl) {
      setApiBaseUrl(inputBaseUrl.trim());
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    try {
      const result = await testSupabaseConnection();
      setSupabaseTestResult(result);
      await checkSupabase();
    } finally {
      setIsTestingSupabase(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            SYSTEM PREFERENCES
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
          {t.settings.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure AI forensic engine parameters, visual themes, languages, and network endpoints
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>System configuration parameters committed successfully.</span>
        </div>
      )}

      {/* Section 1: VerfiX FastAPI Gateway */}
      <GlassCard className="p-6 border-cyan-500/30" glow>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                VerfiX FastAPI Gateway
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Core REST API &amp; Forensic Model Worker
              </span>
            </div>
          </div>

          <button
            onClick={() => checkConnection()}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isChecking ? 'Testing...' : 'Ping Gateway'}</span>
          </button>
        </div>

        <div className="pt-4 space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1.5">
              Backend Endpoint (`VITE_API_BASE_URL`)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputBaseUrl}
                onChange={(e) => setInputBaseUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-cyan-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => {
                  setApiBaseUrl(inputBaseUrl.trim());
                  checkConnection();
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-bold transition-all text-xs"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">HOST / PORT</span>
              <span className="text-slate-700 dark:text-slate-200 font-bold">127.0.0.1:8000</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">API PREFIX</span>
              <span className="text-slate-700 dark:text-slate-200 font-bold">/api</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">CORS ORIGIN</span>
              <span className="text-slate-700 dark:text-slate-200 font-bold">3000, 5173</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">GATEWAY STATUS</span>
              <span
                className={`font-bold ${
                  isConnected ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {isConnected ? 'Online' : 'Standby'}
              </span>
            </div>
          </div>

          {serverDiagnostics && (
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 text-slate-300 text-[11px]">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Diagnostics:
              </div>
              <div>Connected Endpoint: <span className="text-slate-200">{serverDiagnostics.endpoint || '/health'}</span></div>
              {serverDiagnostics.latencyMs !== undefined && (
                <div>Roundtrip Latency: <span className="text-emerald-400">{serverDiagnostics.latencyMs}ms</span></div>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Section 2: Supabase Storage & Database Integration */}
      <GlassCard className="p-6 border-emerald-500/30" glow>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Supabase Cloud Storage &amp; Database
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                PostgreSQL pooler &amp; forensic asset buckets
              </span>
            </div>
          </div>

          <button
            onClick={handleTestSupabase}
            disabled={isTestingSupabase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isTestingSupabase ? 'Testing...' : 'Test Supabase'}</span>
          </button>
        </div>

        <div className="pt-4 space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1">
              Supabase Project URL
            </label>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-emerald-400 font-bold flex items-center justify-between">
              <span className="truncate">{SUPABASE_URL}</span>
              <span className="shrink-0 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Active Pooler
              </span>
            </div>
          </div>

          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1">
              Public Anon API Key
            </label>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="font-mono text-[11px] truncate">
                {showAnonKey ? SUPABASE_ANON_KEY : `${SUPABASE_ANON_KEY.substring(0, 16)}••••••••••••••••`}
              </span>
              <button
                type="button"
                onClick={() => setShowAnonKey(!showAnonKey)}
                className="p-1 text-slate-400 hover:text-slate-200 ml-2"
                title={showAnonKey ? 'Hide key' : 'Show key'}
              >
                {showAnonKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block mb-1.5">
              Configured Storage Buckets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(BUCKETS).map(([key, name]) => (
                <div
                  key={key}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2"
                >
                  <HardDrive className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[9px] text-slate-400 truncate">{key}</span>
                    <span className="block text-[11px] text-slate-800 dark:text-slate-200 font-semibold truncate">
                      {name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {supabaseTestResult && (
            <div className={`p-3 rounded-xl border space-y-1 text-[11px] ${
              supabaseTestResult.connected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${supabaseTestResult.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                Supabase Test Result: {supabaseTestResult.connected ? 'Connected' : 'Notice'}
              </div>
              <div>{supabaseTestResult.message}</div>
              {supabaseTestResult.latencyMs !== undefined && (
                <div>Ping Latency: {supabaseTestResult.latencyMs}ms</div>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Section 3: Risk Engine Calibration */}
      <GlassCard className="p-6 border-slate-300 dark:border-slate-800">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Forensic Risk Engine Thresholds
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Calibrated to VerfiX risk metrics (0 - 100)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <span className="text-emerald-500 font-bold block">LOW RISK</span>
            <div className="text-lg font-black text-slate-900 dark:text-white">0 — 29</div>
            <span className="text-[10px] text-slate-500 block">Clean document integrity</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <span className="text-amber-500 font-bold block">MEDIUM RISK</span>
            <div className="text-lg font-black text-slate-900 dark:text-white">30 — 59</div>
            <span className="text-[10px] text-slate-500 block">Anomalies flagged for review</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
            <span className="text-rose-500 font-bold block">HIGH RISK</span>
            <div className="text-lg font-black text-slate-900 dark:text-white">60 — 100</div>
            <span className="text-[10px] text-slate-500 block">Critical tampering detected</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 font-mono">
          <div>Max Upload: <span className="text-slate-800 dark:text-slate-200 font-bold">20 MB</span></div>
          <div>OCR Engine: <span className="text-slate-800 dark:text-slate-200 font-bold">Tesseract (eng)</span></div>
          <div>Formats: <span className="text-slate-800 dark:text-slate-200 font-bold">PDF, PNG, JPG, WEBP</span></div>
        </div>
      </GlassCard>

      {/* Section 2: Visual Theme & Motion */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t.settings.appearance}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme Selector */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Color Archetype
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-100 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="font-semibold">{t.settings.darkMode}</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  theme === 'light'
                    ? 'bg-white border-cyan-500/50 text-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-100 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="font-semibold">{t.settings.lightMode}</span>
              </button>
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Motion Sensitivity
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-800">
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {t.settings.reducedMotion}
              </span>
              <button
                type="button"
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  reducedMotion ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    reducedMotion ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Section 3: Multilingual UI Selection */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <Globe className="w-5 h-5 text-cyan-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t.settings.language}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {(Object.keys(languageNames) as SupportedLanguage[]).map((langKey) => (
            <button
              key={langKey}
              onClick={() => setLanguage(langKey)}
              className={`p-3 rounded-xl border text-left transition-all ${
                language === langKey
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-500 dark:text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="block text-sm font-semibold">{languageNames[langKey].native}</span>
              <span className="block text-[11px] font-mono text-slate-400 mt-0.5">
                {languageNames[langKey].english}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Section 4: Forensic Notification Triggers */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <Bell className="w-5 h-5 text-violet-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Forensic Alerts &amp; Triggers
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Audible Tamper Alert
              </span>
              <span className="text-slate-500 text-[11px]">
                Play acoustic chime upon detection of Critical or High risk category
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSoundAlerts(!soundAlerts)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                soundAlerts ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                  soundAlerts ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Automatic Court-Admissible PDF Generation
              </span>
              <span className="text-slate-500 text-[11px]">
                Immediately compile PDF report upon scan completion
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoExportPdf(!autoExportPdf)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                autoExportPdf ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                  autoExportPdf ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <GlowButton variant="primary" size="md" onClick={handleSaveSettings}>
            Save Preferences
          </GlowButton>
        </div>
      </GlassCard>
    </div>
  );
};
