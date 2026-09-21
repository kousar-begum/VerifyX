import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Hash,
  Clock,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ForensicFactor, AnomalyItem, DocumentMetadata } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ForensicSummaryProps {
  metadata?: DocumentMetadata;
  factors?: ForensicFactor[];
  anomalies?: AnomalyItem[];
  explanation?: {
    summary: string;
    keyFactors: string[];
    evidence: string[];
    recommendations: string[];
  };
  className?: string;
}

type TabKey = 'explanation' | 'factors' | 'metadata' | 'recommendations';

export const ForensicSummary: React.FC<ForensicSummaryProps> = ({
  metadata,
  factors = [],
  anomalies = [],
  explanation,
  className = '',
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>('explanation');

  if (!explanation && factors.length === 0 && !metadata) {
    return (
      <GlassCard className={`p-6 text-center border-dashed ${className}`}>
        <div className="flex flex-col items-center justify-center py-6">
          <HelpCircle className="w-8 h-8 text-slate-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.analysisResult.forensicSummary}
          </h4>
          <p className="text-xs text-slate-500 font-mono">
            Awaiting forensic neural synthesis from backend
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`p-6 ${className}`} glow>
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('explanation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'explanation'
              ? 'bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{t.analysisResult.explainRisk}</span>
        </button>

        <button
          onClick={() => setActiveTab('factors')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'factors'
              ? 'bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Forensic Factors ({factors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('metadata')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'metadata'
              ? 'bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Document Metadata</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'recommendations'
              ? 'bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Actionable Guidance</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {/* Tab 1: Explain My Risk */}
        {activeTab === 'explanation' && (
          <div className="space-y-4">
            {explanation ? (
              <>
                <div className="p-4 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/30">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-500 dark:text-cyan-400 font-bold mb-1.5">
                    Executive Neural Assessment
                  </h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {explanation.summary}
                  </p>
                </div>

                {explanation.keyFactors?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-2">
                      Primary Contributing Factors
                    </h5>
                    <ul className="space-y-2">
                      {explanation.keyFactors.map((factor, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.evidence?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-2">
                      Forensic Artifact Evidence
                    </h5>
                    <div className="space-y-1.5 font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      {explanation.evidence.map((ev, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-cyan-500">›</span>
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-500 font-mono">
                No explanation generated yet. Connect your backend to evaluate risks.
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Forensic Factors List */}
        {activeTab === 'factors' && (
          <div className="space-y-3">
            {factors.length > 0 ? (
              factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {factor.factor}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          factor.status === 'tampered'
                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                            : factor.status === 'suspicious'
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        }`}
                      >
                        {factor.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {factor.details}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                      {factor.score}
                      <span className="text-[10px] font-normal text-slate-400">/100</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono">
                No forensic factors reported by backend.
              </p>
            )}
          </div>
        )}

        {/* Tab 3: Document Metadata */}
        {activeTab === 'metadata' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {metadata ? (
              <>
                <div className="p-3 rounded-lg bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">File Name</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {metadata.fileName}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">SHA-256 Checksum</span>
                  <span className="font-bold text-cyan-500 truncate block text-[11px]">
                    {metadata.sha256Hash || 'Calculated on upload'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">Creator / Software</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {metadata.creatorTool || 'Not specified in EXIF'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">Embedded Timestamps</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {metadata.createdDate || metadata.uploadedAt || 'N/A'}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 col-span-2">
                No document metadata indexed yet.
              </p>
            )}
          </div>
        )}

        {/* Tab 4: Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            {explanation?.recommendations && explanation.recommendations.length > 0 ? (
              explanation.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0 font-bold font-mono text-[10px]">
                    {i + 1}
                  </div>
                  <span className="text-slate-800 dark:text-slate-200 leading-relaxed">{rec}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono">
                No custom recommendations available without backend evaluation.
              </p>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
