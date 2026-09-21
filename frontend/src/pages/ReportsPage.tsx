import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileDown,
  Sparkles,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sliders,
  Filter,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { GlowButton } from '../components/common/GlowButton';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { useLanguage } from '../context/LanguageContext';
import { useBackendStatus } from '../context/BackendStatusContext';
import { reportsApi } from '../api/reports';
import { ReportItem } from '../types';

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const { apiBaseUrl } = useBackendStatus();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'json' | 'csv'>('pdf');
  const [includeHeatmaps, setIncludeHeatmaps] = useState<boolean>(true);
  const [includeOcr, setIncludeOcr] = useState<boolean>(true);
  const [includeAuditSignature, setIncludeAuditSignature] = useState<boolean>(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await reportsApi.getReports();
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
      }
    } catch {
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateBatchReport = async () => {
    setIsGenerating(true);
    try {
      await reportsApi.generateReport({
        format: reportFormat,
        includeHeatmaps,
        includeOcr,
        includeAuditSignature,
      });
      await fetchReports();
    } catch {
      // Backend not yet returning batch
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId: string, title: string, format: string) => {
    try {
      const blob = await reportsApi.downloadReport(reportId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Direct file fallback
      window.print();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              AUDIT COMPLIANCE &amp; EXPORT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {t.reports.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.reports.subtitle}
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Sync Reports</span>
        </button>
      </div>

      {/* Report Generator Options Card */}
      <GlassCard className="p-6 border-cyan-500/30" glow>
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
          <Sliders className="w-4 h-4 text-cyan-500" />
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t.reports.generateReport}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block">
              Output Container Format
            </label>
            <div className="flex gap-2 text-xs font-mono">
              {(['pdf', 'json', 'csv'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setReportFormat(fmt)}
                  className={`flex-1 py-2.5 rounded-xl uppercase font-bold border transition-all ${
                    reportFormat === fmt
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-100 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Forensic Inclusions */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block">
              Forensic Artifact Inclusions
            </label>
            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeatmaps}
                  onChange={(e) => setIncludeHeatmaps(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span>Include Multi-Spectral Heatmap &amp; ELA Plates</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOcr}
                  onChange={(e) => setIncludeOcr(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span>Include Extracted OCR &amp; Font Kerning Matrix</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAuditSignature}
                  onChange={(e) => setIncludeAuditSignature(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span>Embed SHA-256 Digital Verification Seal</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <GlowButton
            variant="primary"
            size="md"
            isLoading={isGenerating}
            onClick={handleGenerateBatchReport}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Synthesize Compliance Dossier
          </GlowButton>
        </div>
      </GlassCard>

      {/* Reports Archive Table */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>Generated Reports Archive</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Source: {apiBaseUrl}/reports
          </span>
        </div>

        <div className="pt-4">
          {isLoading ? (
            <div className="py-12">
              <LoadingState title="Polling compiled forensic reports..." />
            </div>
          ) : reports.length === 0 ? (
            <EmptyState
              title={t.reports.noReportsTitle}
              description={t.reports.noReportsDesc}
              actionLabel="Synthesize New Dossier"
              onAction={handleGenerateBatchReport}
              type="documents"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono">
                    <th className="pb-3 font-medium">Report Title</th>
                    <th className="pb-3 font-medium">Format</th>
                    <th className="pb-3 font-medium">Size</th>
                    <th className="pb-3 font-medium">Generated Date</th>
                    <th className="pb-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          <span>{rep.title || rep.documentName}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono uppercase font-bold text-cyan-400">
                        {rep.format}
                      </td>
                      <td className="py-3 font-mono text-slate-500">
                        {rep.fileSize || '1.4 MB'}
                      </td>
                      <td className="py-3 text-slate-500 font-mono">
                        {new Date(rep.createdAt || rep.analysisDate || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDownloadReport(rep.id, rep.title || rep.documentName, rep.format)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors font-mono font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
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
