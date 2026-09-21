import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle,
  AlertTriangle,
  FileText,
  Sliders,
  Maximize,
  HelpCircle,
  Dna,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ComparisonResultData } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ComparisonViewerProps {
  result?: ComparisonResultData;
  docAPreviewUrl?: string;
  docBPreviewUrl?: string;
  docAName?: string;
  docBName?: string;
  className?: string;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  result,
  docAPreviewUrl,
  docBPreviewUrl,
  docAName = 'Document A',
  docBName = 'Document B',
  className = '',
}) => {
  const { t } = useLanguage();
  const [activeDiffTab, setActiveDiffTab] = useState<'all' | 'text' | 'visual' | 'metadata'>('all');
  const [splitSlider, setSplitSlider] = useState<number>(50);

  if (!result) {
    return (
      <GlassCard className={`p-8 text-center border-dashed ${className}`}>
        <div className="flex flex-col items-center justify-center max-w-md mx-auto py-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
            <GitCompare className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {t.compare.noComparisonFound}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Upload two document versions and execute comparative inspection to examine DNA variances.
          </p>
        </div>
      </GlassCard>
    );
  }

  const filteredDifferences =
    activeDiffTab === 'all'
      ? result.differences
      : result.differences.filter((d) => d.type === activeDiffTab);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top DNA Overview */}
      <GlassCard className="p-6 border-cyan-500/40" glow>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <span className="text-2xl font-black font-mono text-cyan-500 dark:text-cyan-400">
                {result.similarityScore}%
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Similarity
              </span>
            </div>

            <div>
              <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-500 mb-1">
                <Dna className="w-3.5 h-3.5" />
                {t.compare.dnaComparison}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.compare.similarityScore}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
                {result.summary}
              </p>
            </div>
          </div>

          {/* DNA Metrics Bars */}
          <div className="w-full md:w-72 space-y-2 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span>Text Similarity</span>
                <span>{result.dnaComparison.textSimilarity}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${result.dnaComparison.textSimilarity}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span>Layout Alignment</span>
                <span>{result.dnaComparison.layoutSimilarity}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${result.dnaComparison.layoutSimilarity}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span>Visual Hash Match</span>
                <span>{result.dnaComparison.visualSimilarity}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${result.dnaComparison.visualSimilarity}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Side-by-Side Document Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Document A */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Document A (Baseline)
            </span>
            <span className="text-slate-500 truncate max-w-[180px]">{docAName}</span>
          </div>

          <div className="h-80 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-800">
            {docAPreviewUrl ? (
              <img
                src={docAPreviewUrl}
                alt="Document A"
                className="max-h-full w-auto object-contain rounded"
              />
            ) : (
              <div className="text-center text-slate-500 text-xs font-mono">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span>Document A Loaded</span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Document B */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Document B (Candidate)
            </span>
            <span className="text-slate-500 truncate max-w-[180px]">{docBName}</span>
          </div>

          <div className="h-80 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-800">
            {docBPreviewUrl ? (
              <img
                src={docBPreviewUrl}
                alt="Document B"
                className="max-h-full w-auto object-contain rounded"
              />
            ) : (
              <div className="text-center text-slate-500 text-xs font-mono">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span>Document B Loaded</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Difference Log */}
      <GlassCard className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.compare.differencesDetected} ({result.differences.length})
            </h4>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-xs font-mono">
            {(['all', 'text', 'visual', 'metadata'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveDiffTab(tab)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  activeDiffTab === tab
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 space-y-2.5">
          {filteredDifferences.length > 0 ? (
            filteredDifferences.map((diff) => (
              <div
                key={diff.id}
                className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {diff.type}
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {diff.description}
                    </span>
                  </div>
                  {diff.documentALocation && (
                    <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                      <span>Doc A: {diff.documentALocation}</span>
                      <span>→</span>
                      <span>Doc B: {diff.documentBLocation}</span>
                    </div>
                  )}
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                    diff.severity === 'major'
                      ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                      : diff.severity === 'moderate'
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {diff.severity}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 font-mono py-2 text-center">
              No variances detected in category "{activeDiffTab}".
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
