import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Activity, BarChart3, TrendingUp, Sliders } from 'lucide-react';
import { SuspiciousRegion } from '../../types';

interface ForensicSignalGraphsProps {
  regions?: SuspiciousRegion[];
  className?: string;
}

export const ForensicSignalGraphs: React.FC<ForensicSignalGraphsProps> = ({
  regions = [],
  className = '',
}) => {
  const [scanlineY, setScanlineY] = useState<number>(45); // percentage from top
  const [graphMode, setGraphMode] = useState<'scanline' | 'histogram'>('scanline');

  // Compute horizontal scanline intensity waveform
  const scanlineData = React.useMemo(() => {
    const points = [];
    const count = 50;

    for (let i = 0; i <= count; i++) {
      const xPct = (i / count) * 100;
      // baseline authentic compression noise
      let amp = 12 + Math.sin(i * 0.8) * 3 + Math.random() * 2;

      // check if any anomaly region intersects or is near this scanline
      regions.forEach((r) => {
        const rx = r.x > 1 ? (r.x / 800) * 100 : r.x;
        const ry = r.y > 1 ? (r.y / 1000) * 100 : r.y;
        const rw = r.width > 1 ? (r.width / 800) * 100 : r.width;
        const rh = r.height > 1 ? (r.height / 1000) * 100 : r.height;

        const yDist = Math.abs(scanlineY - (ry + rh / 2));
        if (yDist < rh) {
          const xCenter = rx + rw / 2;
          const xDist = Math.abs(xPct - xCenter);
          if (xDist < rw * 0.8) {
            const peak = (r.confidence || 80) * (1 - yDist / rh) * Math.cos((xDist / rw) * (Math.PI / 2));
            amp = Math.max(amp, 12 + peak * 0.95);
          }
        }
      });

      points.push({
        coord: `${Math.round(xPct)}%`,
        amplitude: Math.round(amp),
        baseline: 14,
        threshold: 45,
      });
    }
    return points;
  }, [scanlineY, regions]);

  // ELA Residual Error Histogram Distribution
  const histogramData = React.useMemo(() => {
    return [
      { bin: '0-10 (Clean)', authentic: 65, detected: 28 },
      { bin: '10-25 (Low)', authentic: 28, detected: 22 },
      { bin: '25-45 (Med)', authentic: 6, detected: 24 },
      { bin: '45-70 (High)', authentic: 1, detected: 16 },
      { bin: '70-100 (Crit)', authentic: 0, detected: 10 },
    ];
  }, []);

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/90 text-slate-200 p-4 font-mono text-xs ${className}`}
    >
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100">
            {graphMode === 'scanline'
              ? 'SCANLINE INTENSITY GRAPH (f(x) Waveform)'
              : 'COMPRESSION RESIDUAL HISTOGRAM SPECTRUM'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setGraphMode('scanline')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
              graphMode === 'scanline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Horizontal Scanline
          </button>

          <button
            onClick={() => setGraphMode('histogram')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
              graphMode === 'histogram'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ELA Histogram
          </button>
        </div>
      </div>

      {/* Mode 1: Scanline Waveform Graph */}
      {graphMode === 'scanline' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Scanline Height (Y-Axis Cut): <strong className="text-cyan-400">{scanlineY}%</strong></span>
            <div className="flex items-center gap-2">
              <span>Adjust Cut:</span>
              <input
                type="range"
                min="5"
                max="95"
                value={scanlineY}
                onChange={(e) => setScanlineY(parseInt(e.target.value, 10))}
                className="w-24 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scanlineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tamperGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="coord" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#06b6d4',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Tamper Threshold', fill: '#f59e0b', fontSize: 9 }} />
                <Area
                  type="monotone"
                  dataKey="amplitude"
                  name="ELA Error Signal"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tamperGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Doc Origin (X: 0%)</span>
            <span className="text-amber-400 font-bold">Spikes &gt; 45 indicate forged pixel patches</span>
            <span>Doc Right Edge (X: 100%)</span>
          </div>
        </div>
      )}

      {/* Mode 2: Histogram Distribution Spectrum */}
      {graphMode === 'histogram' && (
        <div className="space-y-3">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="detectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="authenticGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="bin" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#06b6d4',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="detected"
                  name="Detected Document"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#detectedGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="authentic"
                  name="Authentic Baseline"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#authenticGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Authentic Baseline (Uniform compression)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Current Document (High error tail detected)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
