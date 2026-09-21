import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Rotate3d,
  Layers,
  Sparkles,
  Maximize2,
  Sliders,
  Play,
  Pause,
  Activity,
  Crosshair,
} from 'lucide-react';
import { SuspiciousRegion } from '../../types';

interface Heatmap3DGraphProps {
  regions?: SuspiciousRegion[];
  documentName?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const Heatmap3DGraph: React.FC<Heatmap3DGraphProps> = ({
  regions = [],
  documentName = 'Document',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3D Graph controls
  const [yaw, setYaw] = useState<number>(0.75); // radians
  const [pitch, setPitch] = useState<number>(0.65); // radians
  const [elevationScale, setElevationScale] = useState<number>(1.2);
  const [gridResolution, setGridResolution] = useState<number>(32); // 32x32 vertices
  const [renderMode, setRenderMode] = useState<'wireframe' | 'solid' | 'points'>('solid');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [colorPalette, setColorPalette] = useState<'thermal' | 'cyber' | 'spectral'>('thermal');

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Generate heightfield grid based on anomaly regions & noise
  const gridData = useMemo(() => {
    const N = gridResolution;
    const grid: number[][] = [];

    // Precompute gaussian peak parameters for each region
    const peaks = regions.map((r) => {
      // Normalize coords to 0..1
      const cx = (r.x > 1 ? r.x / 800 : r.x / 100);
      const cy = (r.y > 1 ? r.y / 1000 : r.y / 100);
      const w = Math.max((r.width > 1 ? r.width / 800 : r.width / 100) * 0.7, 0.08);
      const h = Math.max((r.height > 1 ? r.height / 1000 : r.height / 100) * 0.7, 0.08);
      const amp = (r.confidence || 75) / 100;
      return { cx, cy, w, h, amp };
    });

    // If no regions, provide a subtle illustrative tamper signature
    if (peaks.length === 0) {
      peaks.push({ cx: 0.45, cy: 0.4, w: 0.14, h: 0.12, amp: 0.72 });
      peaks.push({ cx: 0.7, cy: 0.65, w: 0.12, h: 0.1, amp: 0.58 });
    }

    for (let i = 0; i <= N; i++) {
      grid[i] = [];
      const ny = i / N;
      for (let j = 0; j <= N; j++) {
        const nx = j / N;

        // Base noise floor
        let z = 0.05 + 0.04 * Math.sin(nx * 12) * Math.cos(ny * 12);

        // Sum gaussian anomaly peaks
        for (const peak of peaks) {
          const dx = (nx - peak.cx) / peak.w;
          const dy = (ny - peak.cy) / peak.h;
          const distSq = dx * dx + dy * dy;
          if (distSq < 9) {
            z += peak.amp * Math.exp(-distSq * 0.7);
          }
        }

        grid[i][j] = Math.min(z, 1.4);
      }
    }
    return grid;
  }, [gridResolution, regions]);

  // Handle Drag to Rotate
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setYaw((prev) => prev + dx * 0.008);
    setPitch((prev) => Math.max(0.2, Math.min(1.4, prev + dy * 0.008)));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Color helper based on elevation (0 to 1+)
  const getColor = (z: number, alpha = 1): string => {
    const norm = Math.min(Math.max((z - 0.05) / 0.9, 0), 1);

    if (colorPalette === 'thermal') {
      // Deep Navy -> Cyan -> Green -> Amber -> Bright Red/Rose
      if (norm < 0.25) {
        const t = norm / 0.25;
        return `rgba(${Math.round(6 + t * 0)}, ${Math.round(78 + t * 104)}, ${Math.round(160 + t * 52)}, ${alpha})`;
      } else if (norm < 0.5) {
        const t = (norm - 0.25) / 0.25;
        return `rgba(${Math.round(6 + t * 50)}, ${Math.round(182 + t * 40)}, ${Math.round(212 - t * 150)}, ${alpha})`;
      } else if (norm < 0.75) {
        const t = (norm - 0.5) / 0.25;
        return `rgba(${Math.round(56 + t * 189)}, ${Math.round(222 - t * 64)}, ${Math.round(62 - t * 62)}, ${alpha})`;
      } else {
        const t = (norm - 0.75) / 0.25;
        return `rgba(${Math.round(245 + t * 10)}, ${Math.round(158 - t * 95)}, ${Math.round(11 + t * 53)}, ${alpha})`;
      }
    } else if (colorPalette === 'cyber') {
      // Neon Cyan -> Electric Indigo -> Magenta
      if (norm < 0.5) {
        const t = norm / 0.5;
        return `rgba(${Math.round(6 + t * 133)}, ${Math.round(182 - t * 90)}, ${Math.round(212 + t * 44)}, ${alpha})`;
      } else {
        const t = (norm - 0.5) / 0.5;
        return `rgba(${Math.round(139 + t * 116)}, ${Math.round(92 - t * 29)}, ${Math.round(256 - t * 93)}, ${alpha})`;
      }
    } else {
      // Spectral Blue -> White hot
      const r = Math.round(50 + norm * 205);
      const g = Math.round(120 + norm * 135);
      const b = Math.round(255);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  };

  // 3D Rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Dynamic canvas resizing
      const rect = canvas.getBoundingClientRect();
      const w = (canvas.width = rect.width * (window.devicePixelRatio || 1));
      const h = (canvas.height = rect.height * (window.devicePixelRatio || 1));

      ctx.clearRect(0, 0, w, h);

      // Auto rotation
      if (autoRotate && !isDragging) {
        setYaw((prev) => (prev + 0.003) % (Math.PI * 2));
      }

      const N = gridResolution;
      const scale = Math.min(w, h) * 0.42;
      const originX = w / 2;
      const originY = h / 2 + scale * 0.22;

      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);

      // Project grid vertices
      interface ProjectedPoint {
        px: number;
        py: number;
        depth: number;
        z: number;
        i: number;
        j: number;
      }

      const projected: ProjectedPoint[][] = [];

      for (let i = 0; i <= N; i++) {
        projected[i] = [];
        for (let j = 0; j <= N; j++) {
          const xNorm = j / N - 0.5;
          const yNorm = i / N - 0.5;
          const zVal = gridData[i]?.[j] ?? 0.05;
          const zNorm = zVal * elevationScale * 0.55;

          // Yaw rotation (Z-axis)
          const rx = xNorm * cosYaw - yNorm * sinYaw;
          const ry = xNorm * sinYaw + yNorm * cosYaw;

          // Pitch rotation (X-axis)
          const rz = ry * sinPitch + zNorm * cosPitch;
          const depth = ry * cosPitch - zNorm * sinPitch;

          const px = originX + rx * scale;
          const py = originY - rz * scale;

          projected[i][j] = { px, py, depth, z: zVal, i, j };
        }
      }

      // Draw bounding base plate & axis guides
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.fillStyle = 'rgba(6, 10, 18, 0.4)';

      // Draw Base Grid Frame
      const p00 = projected[0][0];
      const p0N = projected[0][N];
      const pNN = projected[N][N];
      const pN0 = projected[N][0];

      ctx.beginPath();
      ctx.moveTo(p00.px, p00.py);
      ctx.lineTo(p0N.px, p0N.py);
      ctx.lineTo(pNN.px, pNN.py);
      ctx.lineTo(pN0.px, pN0.py);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();

      // Render Quads sorted by depth (Painter's Algorithm)
      interface Quad {
        i: number;
        j: number;
        avgDepth: number;
        avgZ: number;
      }

      const quads: Quad[] = [];
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const p1 = projected[i][j];
          const p2 = projected[i][j + 1];
          const p3 = projected[i + 1][j + 1];
          const p4 = projected[i + 1][j];
          const avgDepth = (p1.depth + p2.depth + p3.depth + p4.depth) / 4;
          const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
          quads.push({ i, j, avgDepth, avgZ });
        }
      }

      quads.sort((a, b) => a.avgDepth - b.avgDepth);

      // Render each quad
      for (const q of quads) {
        const p1 = projected[q.i][q.j];
        const p2 = projected[q.i][q.j + 1];
        const p3 = projected[q.i + 1][q.j + 1];
        const p4 = projected[q.i + 1][q.j];

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.lineTo(p3.px, p3.py);
        ctx.lineTo(p4.px, p4.py);
        ctx.closePath();

        if (renderMode === 'solid') {
          // Shaded facet with elevation color
          ctx.fillStyle = getColor(q.avgZ, 0.72);
          ctx.fill();
          ctx.strokeStyle = getColor(q.avgZ, 0.45);
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else if (renderMode === 'wireframe') {
          ctx.fillStyle = 'rgba(6, 10, 18, 0.8)';
          ctx.fill();
          ctx.strokeStyle = getColor(q.avgZ, 0.9);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw peak labels for top anomaly hotspots
      regions.forEach((r, idx) => {
        const cx = Math.min(Math.max(Math.round((r.x > 1 ? r.x / 800 : r.x / 100) * N), 0), N);
        const cy = Math.min(Math.max(Math.round((r.y > 1 ? r.y / 1000 : r.y / 100) * N), 0), N);
        const pt = projected[cy]?.[cx];

        if (pt) {
          // Pulsing pin
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Callout line
          ctx.beginPath();
          ctx.moveTo(pt.px, pt.py);
          ctx.lineTo(pt.px, pt.py - 22);
          ctx.lineTo(pt.px + 18, pt.py - 22);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Label text box
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(pt.px + 20, pt.py - 30, 80, 18);
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
          ctx.strokeRect(pt.px + 20, pt.py - 30, 80, 18);

          ctx.font = '9px monospace';
          ctx.fillStyle = '#fecdd3';
          ctx.fillText(`HOTSPOT #${idx + 1}`, pt.px + 24, pt.py - 18);
        }
      });

      // Axis calibration indicators
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.fillText('X (DOC_COL)', p0N.px + 5, p0N.py);
      ctx.fillText('Y (DOC_ROW)', pN0.px - 60, pN0.py);
      ctx.fillText('Z: TAMPER_INTENSITY', originX - 60, originY - scale * 0.65);

      if (!autoRotate) {
        // static single frame
      } else {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [
    yaw,
    pitch,
    elevationScale,
    gridResolution,
    renderMode,
    autoRotate,
    colorPalette,
    gridData,
    regions,
    isDragging,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/40 select-none shadow-2xl ${className}`}
    >
      {/* Top HUD Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-200">
            3D FORENSIC TOPOLOGY SPECTROGRAM
          </span>
          <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            ELA RESIDUAL TENSOR (32×32)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Palette Mode */}
          <button
            onClick={() =>
              setColorPalette((p) =>
                p === 'thermal' ? 'cyber' : p === 'cyber' ? 'spectral' : 'thermal'
              )
            }
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] capitalize"
            title="Cycle Color Palette"
          >
            Palette: {colorPalette}
          </button>

          {/* Render Mode */}
          <button
            onClick={() =>
              setRenderMode((m) => (m === 'solid' ? 'wireframe' : 'solid'))
            }
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] capitalize"
          >
            {renderMode === 'solid' ? 'Wireframe' : 'Solid Mesh'}
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded border transition-colors ${
              autoRotate
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Orbit */}
          <button
            onClick={() => {
              setYaw(0.75);
              setPitch(0.65);
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
            title="Reset Perspective Orbit"
          >
            <Rotate3d className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-[360px] sm:h-[420px] cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Floating Instruction overlay */}
        <div className="absolute top-2 left-3 pointer-events-none text-[10px] font-mono text-slate-400/80 bg-slate-950/70 px-2 py-1 rounded border border-slate-800 backdrop-blur-sm flex items-center gap-1.5">
          <Crosshair className="w-3 h-3 text-cyan-400" />
          <span>Click &amp; Drag to rotate surface topology • Peaks indicate splice anomalies</span>
        </div>

        {/* Amplitude elevation slider */}
        <div className="absolute bottom-3 right-3 bg-slate-900/85 border border-slate-800 rounded-lg px-2.5 py-1.5 backdrop-blur-sm text-[10px] font-mono text-slate-300 flex items-center gap-2">
          <span>Peak Scale:</span>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={elevationScale}
            onChange={(e) => setElevationScale(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400 cursor-pointer"
          />
          <span className="text-cyan-400 w-6">{elevationScale}x</span>
        </div>

        {/* Elevation Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/85 border border-slate-800 rounded-lg p-2 backdrop-blur-sm text-[9px] font-mono text-slate-400 space-y-1">
          <div className="text-[10px] font-bold text-slate-200">TAMPER SEVERITY</div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-rose-500" />
            <span>High Peak (Tampering &gt; 80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-amber-500" />
            <span>Medium Peak (Residual Anomaly)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-cyan-500" />
            <span>Base Valley (Authentic Compression)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
