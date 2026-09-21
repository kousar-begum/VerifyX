import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  FileDown,
  Trash2,
  RefreshCw,
  Eye,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { GlowButton } from '../components/common/GlowButton';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { useLanguage } from '../context/LanguageContext';
import { useBackendStatus } from '../context/BackendStatusContext';
import { historyApi } from '../api/history';
import { HistoryRecord } from '../types';

export const HistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const { apiBaseUrl } = useBackendStatus();

  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await historyApi.getHistory({
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy,
      });
      if (data && Array.isArray(data.records)) {
        setRecords(data.records);
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      setRecords([]);
      // Clean, quiet standby if backend is offline
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [searchQuery, selectedCategory, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await historyApi.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch {
      // Backend action
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              AUDIT TRAIL &amp; ARCHIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {t.history.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.history.subtitle}
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Sync Archive</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name or document hash..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Risk Category Filter */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="CRITICAL">Critical Tampering</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_risk">Highest Risk</option>
                <option value="lowest_risk">Lowest Risk</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Table */}
      <GlassCard className="p-6 overflow-hidden">
        {isLoading ? (
          <div className="py-12">
            <LoadingState title="Querying archived audit trail..." />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            title={t.history.noHistoryTitle}
            description={t.history.noHistoryDesc}
            actionLabel={t.dashboard.quickAnalyze}
            onAction={() => (window.location.href = '/analyze')}
            type="search"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono">
                  <th className="pb-3 w-8">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                      {selectedIds.length === records.length ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="pb-3 font-medium">Document File</th>
                  <th className="pb-3 font-medium">Risk Score</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Timestamp</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {records.map((rec) => {
                  const isSelected = selectedIds.includes(rec.id);
                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors ${
                        isSelected ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <td className="py-3">
                        <button
                          onClick={() => toggleSelect(rec.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-500 shrink-0" />
                          <span className="truncate max-w-xs">{rec.fileName || rec.documentName}</span>
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
                        {new Date(rec.createdAt || rec.date || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <NavLink
                            to={`/result/${rec.analysisId || rec.id}`}
                            className="p-1 rounded text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                            title="Inspect forensic dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </NavLink>
                          <button
                            onClick={() => handleDelete(rec.id)}
                            className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete archived entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
