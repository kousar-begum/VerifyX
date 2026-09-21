import React from 'react';
import {
  FileCode,
  Type,
  Eye,
  Layers,
  LayoutGrid,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useLanguage } from '../../context/LanguageContext';

interface RiskBreakdownProps {
  breakdown?: {
    metadataAnomalies: number;
    ocrTextAnomalies: number;
    visualAnomalies: number;
    imageManipulation: number;
    layoutInconsistencies: number;
    crossFieldInconsistencies: number;
  };
  className?: string;
}

export const RiskBreakdown: React.FC<RiskBreakdownProps> = ({
  breakdown,
  className = '',
}) => {
  const { t } = useLanguage();

  if (!breakdown) {
    return (
      <GlassCard className={`p-6 text-center border-dashed ${className}`}>
        <div className="flex flex-col items-center justify-center py-4">
          <Layers className="w-8 h-8 text-slate-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.analysisResult.riskBreakdown}
          </h4>
          <p className="text-xs text-slate-500 font-mono">
            Waiting for backend vector telemetry
          </p>
        </div>
      </GlassCard>
    );
  }

  const items = [
    {
      label: 'Metadata & Container EXIF',
      value: breakdown.metadataAnomalies,
      icon: <FileCode className="w-4 h-4 text-cyan-400" />,
      desc: 'Creation dates, software fingerprints, compression signatures',
    },
    {
      label: 'OCR & Font Typography',
      value: breakdown.ocrTextAnomalies,
      icon: <Type className="w-4 h-4 text-violet-400" />,
      desc: 'Glyph kerning, baseline alignment, font substitutions',
    },
    {
      label: 'Visual & Color Anomalies',
      value: breakdown.visualAnomalies,
      icon: <Eye className="w-4 h-4 text-blue-400" />,
      desc: 'Noise inconsistencies, edge gradients, copy-move artifacts',
    },
    {
      label: 'Image Manipulation / ELA',
      value: breakdown.imageManipulation,
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      desc: 'Error Level Analysis, JPEG recompression disparities',
    },
    {
      label: 'Layout & Grid Structure',
      value: breakdown.layoutInconsistencies,
      icon: <LayoutGrid className="w-4 h-4 text-emerald-400" />,
      desc: 'Official template geometry, seal placement, margin skew',
    },
    {
      label: 'Cross-Field Semantic Integrity',
      value: breakdown.crossFieldInconsistencies,
      icon: <FileCheck2 className="w-4 h-4 text-rose-400" />,
      desc: 'DOB vs issue dates, MRZ checksums, signature correlation',
    },
  ];

  const getColorClass = (val: number) => {
    if (val < 25) return 'bg-emerald-500 text-emerald-400';
    if (val < 60) return 'bg-amber-500 text-amber-400';
    return 'bg-rose-500 text-rose-400';
  };

  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-500" />
          {t.analysisResult.riskBreakdown}
        </h3>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          6 Forensic Vectors Scanned
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {item.value}%
              </span>
            </div>

            {/* Bar meter */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  getColorClass(item.value).split(' ')[0]
                }`}
                style={{ width: `${item.value}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
