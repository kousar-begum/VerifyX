import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Clock,
  ScanLine,
  GitCompare,
  History,
  FileDown,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { GlowButton } from '../components/common/GlowButton';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { useLanguage } from '../context/LanguageContext';
import { useBackendStatus } from '../context/BackendStatusContext';
import { historyApi } from '../api/history';
import { HistoryRecord } from '../types';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { isConnected, apiBaseUrl } = useBackendStatus();
  const navigate = useNavigate();

  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    verified: 0,
    pending: 0,
    avgScore: 0,
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const historyData = await historyApi.getHistory({ page: 1, limit: 10 });
      if (historyData && Array.isArray(historyData.records)) {
        setRecords(historyData.records);
        const total = historyData.total || historyData.records.length;
        const highRisk = historyData.records.filter(
          (r) => r.riskCategory === 'HIGH' || r.riskCategory === 'CRITICAL'
        ).length;
        const verified = historyData.records.filter((r) => r.riskCategory === 'LOW').length;
        const avgScore =
          total > 0
            ? Math.round(
                historyData.records.reduce((acc, curr) => acc + curr.riskScore, 0) /
                  historyData.records.length
              )
            : 0;

        setStats({
          total,
          highRisk,
          verified,
          pending: 0,
          avgScore,
        });
      } else {
        setRecords([]);
      }
    } catch {
      // Backend is offline / not yet sending records
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              OPERATIONAL TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {t.dashboard.welcome}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            {t.dashboard.welcomeSub}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/analyze">
            <GlowButton variant="primary" size="md" icon={<ScanLine className="w-4 h-4" />}>
              {t.dashboard.quickAnalyze}
            </GlowButton>
          </NavLink>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Scanned */}
        <GlassCard className="p-5" glow>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              Total Scanned
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs font-mono text-slate-400">docs</span>
          </div>
        </GlassCard>

        {/* Metric 2: High Risk */}
        <GlassCard className="p-5" glow borderAccent="rose">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              High Risk
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-rose-500 dark:text-rose-400">
              {stats.highRisk}
            </span>
            <span className="text-xs font-mono text-rose-400/80">flagged</span>
          </div>
        </GlassCard>

        {/* Metric 3: Verified Authentic */}
        <GlassCard className="p-5" glow borderAccent="emerald">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              Verified Authentic
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-500 dark:text-emerald-400">
              {stats.verified}
            </span>
            <span className="text-xs font-mono text-emerald-400/80">passed</span>
          </div>
        </GlassCard>

        {/* Metric 4: Average Risk Index */}
        <GlassCard className="p-5" glow borderAccent="cyan">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              Average Risk Index
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
              {stats.avgScore}
              <span className="text-sm font-normal text-slate-400">%</span>
            </span>
            <span className="text-xs font-mono text-cyan-500">fleet index</span>
          </div>
        </GlassCard>
      </div>

      {/* Quick Action Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NavLink to="/analyze" className="group">
          <GlassCard className="p-5 hover:border-cyan-500/60 transition-all h-full" glow>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ScanLine className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
              <span>{t.dashboard.quickAnalyze}</span>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload single document to execute forensic neural and ELA scan.
            </p>
          </GlassCard>
        </NavLink>

        <NavLink to="/compare" className="group">
          <GlassCard className="p-5 hover:border-amber-500/60 transition-all h-full" glow>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
              <span>{t.dashboard.compareDocs}</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Compare two versions side-by-side to detect text &amp; visual drift.
            </p>
          </GlassCard>
        </NavLink>

        <NavLink to="/history" className="group">
          <GlassCard className="p-5 hover:border-violet-500/60 transition-all h-full" glow>
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
              <span>{t.nav.history}</span>
              <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inspect historical records, audit logs, and past telemetry.
            </p>
          </GlassCard>
        </NavLink>

        <NavLink to="/reports" className="group">
          <GlassCard className="p-5 hover:border-emerald-500/60 transition-all h-full" glow>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileDown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
              <span>{t.nav.reports}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generate court-admissible forensic PDF reports and JSON exports.
            </p>
          </GlassCard>
        </NavLink>
      </div>

      {/* Recent Analyses Section */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>{t.dashboard.recentAnalyses}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Live telemetry feed from {apiBaseUrl}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              title="Refresh analyses stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <NavLink
              to="/history"
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-mono"
            >
              View Full History →
            </NavLink>
          </div>
        </div>

        <div className="pt-4">
          {isLoading ? (
            <LoadingState title="Polling backend for forensic records..." />
          ) : records.length === 0 ? (
            <EmptyState
              title={t.dashboard.noRecentAnalyses}
              description={t.dashboard.emptySubtitle}
              actionLabel={t.dashboard.quickAnalyze}
              onAction={() => navigate('/analyze')}
              type="documents"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono">
                    <th className="pb-3 font-medium">Document</th>
                    <th className="pb-3 font-medium">Risk Score</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-500" />
                          <span className="truncate max-w-[200px]">{rec.fileName}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono font-bold">
                        <span
                          className={
                            rec.riskScore > 60
                              ? 'text-rose-500'
                              : rec.riskScore > 25
                              ? 'text-amber-500'
                              : 'text-emerald-500'
                          }
                        >
                          {rec.riskScore}%
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            rec.riskCategory === 'HIGH' || rec.riskCategory === 'CRITICAL'
                              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                              : rec.riskCategory === 'MEDIUM'
                              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          }`}
                        >
                          {rec.riskCategory}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 font-mono">
                        {new Date(rec.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <NavLink
                          to={`/result/${rec.analysisId || rec.id}`}
                          className="text-cyan-600 dark:text-cyan-400 hover:underline font-mono font-medium"
                        >
                          Inspect →
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
