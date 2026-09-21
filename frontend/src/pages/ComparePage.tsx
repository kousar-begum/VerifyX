import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileText,
  Layers,
  Dna,
  RefreshCw,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { GlowButton } from '../components/common/GlowButton';
import { UploadZone } from '../components/forensics/UploadZone';
import { ComparisonViewer } from '../components/forensics/ComparisonViewer';
import { useLanguage } from '../context/LanguageContext';
import { useBackendStatus } from '../context/BackendStatusContext';
import { documentsApi } from '../api/documents';
import { comparisonApi } from '../api/comparison';
import { ComparisonResultData } from '../types';

export const ComparePage: React.FC = () => {
  const { t } = useLanguage();
  const { apiBaseUrl } = useBackendStatus();

  const [docAFile, setDocAFile] = useState<File | null>(null);
  const [docBFile, setDocBFile] = useState<File | null>(null);
  const [docAPreview, setDocAPreview] = useState<string | undefined>(undefined);
  const [docBPreview, setDocBPreview] = useState<string | undefined>(undefined);

  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResultData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDocASelect = (file: File | null) => {
    setDocAFile(file);
    if (file && file.type.startsWith('image/')) {
      setDocAPreview(URL.createObjectURL(file));
    } else {
      setDocAPreview(undefined);
    }
  };

  const handleDocBSelect = (file: File | null) => {
    setDocBFile(file);
    if (file && file.type.startsWith('image/')) {
      setDocBPreview(URL.createObjectURL(file));
    } else {
      setDocBPreview(undefined);
    }
  };

  const handleStartComparison = async () => {
    if (!docAFile || !docBFile) return;
    setErrorMessage(null);
    setIsComparing(true);

    try {
      // 1. Upload both documents
      const uploadA = await documentsApi.uploadDocument(docAFile);
      const uploadB = await documentsApi.uploadDocument(docBFile);

      const idA = uploadA?.documentId || 'doc-a';
      const idB = uploadB?.documentId || 'doc-b';

      // 2. Execute comparison on backend
      const job = await comparisonApi.compareDocuments(idA, idB);
      const result = await comparisonApi.getComparisonResult(job.comparisonId);
      setComparisonResult(result);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Failed to execute document comparison with FastAPI engine (' +
            apiBaseUrl +
            '). Ensure the backend service is running.'
      );
    } finally {
      setIsComparing(false);
    }
  };

  const handleResetComparison = () => {
    setComparisonResult(null);
    setDocAFile(null);
    setDocBFile(null);
    setDocAPreview(undefined);
    setDocBPreview(undefined);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
              CROSS-DOCUMENT DNA DIFF
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {t.compare.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            {t.compare.subtitle}
          </p>
        </div>

        {comparisonResult && (
          <button
            onClick={handleResetComparison}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
            <span>New Comparison</span>
          </button>
        )}
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Comparison Pipeline Failed</span>
            <span className="text-slate-600 dark:text-slate-300 block">{errorMessage}</span>
            <span className="text-[11px] font-mono text-slate-500 block">
              FastAPI Endpoint: <code className="text-cyan-400">{apiBaseUrl}/compare</code>
            </span>
          </div>
        </div>
      )}

      {/* Upload Dual View */}
      {!comparisonResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document A Upload */}
              <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>{t.compare.docA} (Baseline Master)</span>
              </div>
              <UploadZone
                label="Select Baseline Document A"
                sublabel="Original, authentic, or earlier revision"
                selectedFile={docAFile}
                onFileSelect={handleDocASelect}
              />
            </div>

            {/* Document B Upload */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>{t.compare.docB} (Candidate Variant)</span>
              </div>
              <UploadZone
                label="Select Candidate Document B"
                sublabel="Suspect copy, new revision, or secondary scan"
                selectedFile={docBFile}
                onFileSelect={handleDocBSelect}
              />
            </div>
          </div>

          {/* Compare Action Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-mono text-slate-500">
              {docAFile && docBFile
                ? 'Both document containers loaded. Ready to stream to FastAPI comparator.'
                : 'Upload both files to calculate cross-document DNA alignment.'}
            </div>

            <GlowButton
              variant="primary"
              size="lg"
              disabled={!docAFile || !docBFile || isComparing}
              isLoading={isComparing}
              onClick={handleStartComparison}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {t.compare.startComparison}
            </GlowButton>
          </div>
        </div>
      )}

      {/* Comparison Result Display */}
      {comparisonResult && (
        <ComparisonViewer
          result={comparisonResult}
          docAPreviewUrl={docAPreview}
          docBPreviewUrl={docBPreview}
          docAName={docAFile?.name}
          docBName={docBFile?.name}
        />
      )}
    </div>
  );
};
