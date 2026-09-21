import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  FileDown,
  RefreshCw,
  Share2,
  CheckCircle,
  Copy,
  ArrowLeft,
  FileCode,
  AlertCircle,
  Sparkles,
  Printer,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { GlowButton } from '../components/common/GlowButton';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { RiskScore } from '../components/forensics/RiskScore';
import { RiskBreakdown } from '../components/forensics/RiskBreakdown';
import { HeatmapViewer } from '../components/forensics/HeatmapViewer';
import { ForensicSummary } from '../components/forensics/ForensicSummary';
import { useLanguage } from '../context/LanguageContext';
import { useBackendStatus } from '../context/BackendStatusContext';
import { analysisApi } from '../api/analysis';
import { reportsApi } from '../api/reports';
import { AnalysisResultData } from '../types';

export const AnalysisResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { apiBaseUrl } = useBackendStatus();
  const navigate = useNavigate();

  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fetchAnalysisResult = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await analysisApi.getAnalysisResult(id);
      setResult(data);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Analysis result unavailable from backend. Please verify your FastAPI service is online.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisResult();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadReport = async () => {
    if (!id) return;
    setIsExporting(true);
    try {
      const blob = await reportsApi.generatePdfReport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Forensic_Report_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback print dialog if backend PDF generation endpoint is in dev standby
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Telemetry_${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingState
          message="Retrieving multi-spectral forensic tensors from FastAPI backend..."
          submessage={`Querying endpoint: ${apiBaseUrl}/analysis/${id}`}
        />
      </div>
    );
  }

  if (errorMessage || !result) {
    return (
      <div className="py-12">
        <ErrorState
          title="Forensic Data Retrieval Standby"
          message={
            errorMessage ||
            'No forensic result record was returned for this ID. When your backend processes documents, full forensic inspection data will render here.'
          }
          onRetry={fetchAnalysisResult}
        />
        <div className="text-center mt-6">
          <NavLink to="/analyze">
            <GlowButton variant="secondary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
              Return to Document Analyzer
            </GlowButton>
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Forensic ID */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <button
              onClick={() => navigate('/history')}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              FORENSIC DOSSIER #{id?.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {t.analysisResult.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            Inspected File: <strong className="text-slate-800 dark:text-slate-200">{result.metadata.fileName}</strong> •
            Analyzed {new Date(result.analyzedAt || Date.now()).toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <GlowButton
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            icon={copiedLink ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          >
            {copiedLink ? 'Copied' : 'Share Dossier'}
          </GlowButton>

          <GlowButton
            variant="secondary"
            size="sm"
            onClick={handleExportJson}
            icon={<FileCode className="w-4 h-4" />}
          >
            Export JSON
          </GlowButton>

          <GlowButton
            variant="primary"
            size="sm"
            isLoading={isExporting}
            onClick={handleDownloadReport}
            icon={<FileDown className="w-4 h-4" />}
          >
            {t.analysisResult.downloadReport}
          </GlowButton>
        </div>
      </div>

      {/* Primary Risk & Telemetry Gauge */}
      <RiskScore
        score={result.riskScore}
        category={result.riskCategory}
        confidence={result.confidence}
        status={result.status}
      />

      {/* Main Grid: Heatmap Inspection (Left 7 cols) & Risk Breakdown (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <HeatmapViewer
            documentImageUrl={result.originalDocumentUrl}
            heatmapImageUrl={result.heatmapImageUrl}
            xrayImageUrl={result.xrayImageUrl}
            regions={result.suspiciousRegions}
            documentName={result.metadata.fileName}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <RiskBreakdown breakdown={result.riskBreakdown} />
        </div>
      </div>

      {/* Forensic Summary, Evidence, and Recommendations */}
      <ForensicSummary
        metadata={result.metadata}
        factors={result.factors}
        anomalies={result.anomalies}
        explanation={result.explanation}
      />
    </div>
  );
};
