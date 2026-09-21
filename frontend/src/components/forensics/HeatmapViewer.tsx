import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  Eye,
  Flame,
  Scan,
  ShieldAlert,
  Info,
  Rotate3d,
  TrendingUp,
  Grid,
  Crosshair,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { SuspiciousRegion } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Heatmap3DGraph } from './Heatmap3DGraph';
import { ForensicSignalGraphs } from './ForensicSignalGraphs';

interface HeatmapViewerProps {
  documentImageUrl?: string;
  heatmapImageUrl?: string;
  xrayImageUrl?: string;
  regions?: SuspiciousRegion[];
  documentName?: string;
  className?: string;
}

type LayerMode = 'original' | 'heatmap' | 'xray' | '3d-graph';

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({
  documentImageUrl,
  heatmapImageUrl,
  xrayImageUrl,
  regions = [],
  documentName = 'Document_Inspection',
  className = '',
}) => {
  const { t } = useLanguage();
  const [layer, setLayer] = useState<LayerMode>('heatmap');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showRegions, setShowRegions] = useState<boolean>(true);
  const [showGraphGrid, setShowGraphGrid] = useState<boolean>(true);
  const [showSignalGraphs, setShowSignalGraphs] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<SuspiciousRegion | null>(null);
  const [isLaserScanning, setIsLaserScanning] = useState<boolean>(true);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.75);

  // Crosshair coordinates on document
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; pctX: number; pctY: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedRegion(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoom > 1) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }

    // Update crosshair coordinates relative to image container
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        setCursorPos({
          x,
          y,
          pctX: Math.round((x / rect.width) * 100),
          pctY: Math.round((y / rect.height) * 100),
        });
      } else {
        setCursorPos(null);
      }
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // If no document image is present, show clean waiting state
  if (!documentImageUrl) {
    return (
      <GlassCard className={`p-8 md:p-12 text-center border-dashed ${className}`}>
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Scan className="w-8 h-8" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2">
            Forensic Inspection Layer Standby
          </h3>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Forensic heatmap, 3D surface mesh graph, multi-spectral X-Ray layers, and suspicious bounding boxes will be
            rendered here once the document analysis finishes processing.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <Info className="w-3.5 h-3.5 text-cyan-500" />
            <span>Awaiting document stream</span>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      ref={containerRef}
      className={`relative flex flex-col rounded-2xl overflow-hidden border-cyan-500/30 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-6' : ''
      } ${className}`}
      glow
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/60 backdrop-blur-md">
        {/* Layer Mode Selectors */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
          <button
            onClick={() => setLayer('original')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              layer === 'original'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.analysisResult.originalView}</span>
          </button>

          <button
            onClick={() => setLayer('heatmap')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              layer === 'heatmap'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t.analysisResult.heatmapView}</span>
          </button>

          <button
            onClick={() => setLayer('xray')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              layer === 'xray'
                ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{t.analysisResult.xrayView}</span>
          </button>

          {/* 3D Surface Graph Mode */}
          <button
            onClick={() => setLayer('3d-graph')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              layer === '3d-graph'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_14px_rgba(6,182,212,0.5)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>3D Surface Graph</span>
          </button>
        </div>

        {/* Viewport Zoom, Graph Grid & Inspection Controls */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Coordinate Graph Grid */}
          {layer !== '3d-graph' && (
            <button
              onClick={() => setShowGraphGrid(!showGraphGrid)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showGraphGrid
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:bg-slate-800'
              }`}
              title="Toggle Forensic Coordinate Graph Grid"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Graph Grid</span>
            </button>
          )}

          {/* Toggle Signal Waveform Drawer */}
          <button
            onClick={() => setShowSignalGraphs(!showSignalGraphs)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showSignalGraphs
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Scanline Signal Profile Graph"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Signal Curves</span>
          </button>

          {/* Toggle Laser Scanning Animation */}
          {layer !== '3d-graph' && (
            <button
              onClick={() => setIsLaserScanning(!isLaserScanning)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isLaserScanning
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse'
                  : 'text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:bg-slate-800'
              }`}
              title="Toggle Live Laser Forensic Beam"
            >
              <Scan className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Laser Scan</span>
            </button>
          )}

          {/* Toggle Anomaly Regions */}
          {layer !== '3d-graph' && (
            <button
              onClick={() => setShowRegions(!showRegions)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showRegions
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:bg-slate-800'
              }`}
              title={t.analysisResult.toggleRegions}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bounding Regions</span>
              {regions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 font-mono font-bold">
                  {regions.length}
                </span>
              )}
            </button>
          )}

          {/* Opacity slider for overlays */}
          {layer !== 'original' && layer !== '3d-graph' && (
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-slate-200/60 dark:bg-slate-900/60 rounded-lg border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-400">
              <span>Alpha:</span>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                className="w-16 accent-cyan-400 cursor-pointer"
                title="Overlay Opacity"
              />
              <span className="text-cyan-400 w-7 text-right">{Math.round(layerOpacity * 100)}%</span>
            </div>
          )}

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-0.5" />

          {layer !== '3d-graph' && (
            <>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title={t.analysisResult.zoomIn}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 min-w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title={t.analysisResult.zoomOut}
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title={t.analysisResult.resetView}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title={t.analysisResult.fullScreen}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Inspection Viewport Area */}
      {layer === '3d-graph' ? (
        <div className="p-3 bg-slate-950">
          <Heatmap3DGraph
            regions={regions}
            documentName={documentName}
          />
        </div>
      ) : (
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setCursorPos(null)}
          className={`
            relative w-full h-[460px] md:h-[540px] bg-slate-950 overflow-hidden flex items-center justify-center select-none
            ${zoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}
          `}
        >
          {/* Subtle cyber grid backdrop */}
          <div className="absolute inset-0 cyber-grid-dark opacity-35 pointer-events-none" />

          {/* Calibrated Coordinate Axes along Canvas Margins */}
          {showGraphGrid && (
            <>
              {/* Top X-Axis Ruler */}
              <div className="absolute top-0 inset-x-0 h-5 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between px-8 text-[9px] font-mono text-cyan-400/80 pointer-events-none z-20">
                <span>0%</span>
                <span>20%</span>
                <span>40%</span>
                <span className="font-bold text-cyan-300">X-AXIS (ELA SPECTRAL COORDINATE)</span>
                <span>60%</span>
                <span>80%</span>
                <span>100%</span>
              </div>

              {/* Left Y-Axis Ruler */}
              <div className="absolute left-0 inset-y-5 w-6 bg-slate-900/90 border-r border-cyan-500/30 flex flex-col justify-between py-6 text-[9px] font-mono text-cyan-400/80 pointer-events-none z-20">
                <span className="rotate-[-90deg] origin-center">0%</span>
                <span className="rotate-[-90deg] origin-center">25%</span>
                <span className="rotate-[-90deg] origin-center font-bold text-cyan-300">Y-AXIS</span>
                <span className="rotate-[-90deg] origin-center">75%</span>
                <span className="rotate-[-90deg] origin-center">100%</span>
              </div>
            </>
          )}

          {/* Viewport container */}
          <div
            ref={imageContainerRef}
            className="relative transition-transform duration-75 origin-center max-w-full max-h-full flex items-center justify-center p-4"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* Base Document Image */}
            <img
              src={documentImageUrl}
              alt={documentName}
              className="max-h-[440px] w-auto object-contain rounded-lg shadow-2xl border border-slate-800"
            />

            {/* Forensic Coordinate Graph Grid Overlay */}
            {showGraphGrid && (
              <div className="absolute inset-0 max-h-[440px] w-auto forensic-coordinate-grid forensic-major-grid opacity-60 pointer-events-none rounded-lg" />
            )}

            {/* Live Crosshair & Coordinate Telemetry */}
            {showGraphGrid && cursorPos && (
              <>
                {/* Horizontal crosshair line */}
                <div
                  className="absolute inset-x-0 h-px bg-cyan-400/80 pointer-events-none shadow-[0_0_8px_#06b6d4]"
                  style={{ top: `${cursorPos.y}px` }}
                />
                {/* Vertical crosshair line */}
                <div
                  className="absolute inset-y-0 w-px bg-cyan-400/80 pointer-events-none shadow-[0_0_8px_#06b6d4]"
                  style={{ left: `${cursorPos.x}px` }}
                />
                {/* Crosshair HUD Readout Badge */}
                <div
                  className="absolute pointer-events-none z-30 bg-slate-950/95 border border-cyan-400/70 text-cyan-300 text-[10px] font-mono px-2 py-1 rounded shadow-xl whitespace-nowrap"
                  style={{
                    left: `${Math.min(cursorPos.x + 14, 520)}px`,
                    top: `${Math.max(cursorPos.y - 28, 10)}px`,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <Crosshair className="w-3 h-3 text-cyan-400" />
                    <span>X: {cursorPos.pctX}% | Y: {cursorPos.pctY}%</span>
                  </div>
                </div>
              </>
            )}

            {/* Animated Laser Scanning Beam */}
            {isLaserScanning && (
              <div className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06b6d4,0_0_35px_#3b82f6] animate-laser-sweep pointer-events-none z-20">
                <div className="absolute right-0 -top-2 px-1.5 py-0.5 rounded text-[8px] font-mono text-cyan-300 bg-slate-950/80 border border-cyan-500/50">
                  SPECTRAL_SCAN_ACTIVE
                </div>
              </div>
            )}

            {/* Layer: Heatmap Overlay */}
            {layer === 'heatmap' && heatmapImageUrl && (
              <img
                src={heatmapImageUrl}
                alt="Heatmap Layer"
                style={{ opacity: layerOpacity }}
                className="absolute inset-0 max-h-[440px] w-auto object-contain mix-blend-screen pointer-events-none transition-opacity duration-200"
              />
            )}

            {/* Layer: AI X-Ray Overlay */}
            {layer === 'xray' && xrayImageUrl && (
              <img
                src={xrayImageUrl}
                alt="X-Ray Layer"
                style={{ opacity: layerOpacity }}
                className="absolute inset-0 max-h-[440px] w-auto object-contain mix-blend-color-dodge pointer-events-none transition-opacity duration-200"
              />
            )}

            {/* Fallback indicators if layers waiting */}
            {layer === 'heatmap' && !heatmapImageUrl && (
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-1.5 shadow-lg">
                <Info className="w-3.5 h-3.5" />
                <span>Thermal heatmap layer: awaiting backend tensor generation</span>
              </div>
            )}

            {layer === 'xray' && !xrayImageUrl && (
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-violet-500/40 text-violet-300 text-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-1.5 shadow-lg">
                <Info className="w-3.5 h-3.5" />
                <span>AI X-Ray ELA layer: awaiting backend tensor generation</span>
              </div>
            )}

            {/* Suspicious Regions / Bounding Boxes with Graph Isobar Contours */}
            {showRegions &&
              regions.map((region) => {
                const leftPct = region.x > 1 ? (region.x / 800) * 100 : region.x;
                const topPct = region.y > 1 ? (region.y / 1000) * 100 : region.y;
                const widthPct = region.width > 1 ? (region.width / 800) * 100 : region.width;
                const heightPct = region.height > 1 ? (region.height / 1000) * 100 : region.height;

                return (
                  <div
                    key={region.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRegion(region);
                    }}
                    className={`
                      absolute border-2 transition-all cursor-pointer rounded
                      ${
                        selectedRegion?.id === region.id
                          ? 'border-rose-400 bg-rose-500/35 shadow-[0_0_25px_rgba(244,63,94,0.7)] z-20'
                          : 'border-amber-400/90 bg-amber-500/15 hover:border-rose-400 hover:bg-rose-500/25 z-10'
                      }
                    `}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                    }}
                  >
                    {/* Graph Contour Isobar rings around anomaly */}
                    <div className="absolute -inset-2 border border-rose-500/40 rounded pointer-events-none border-dashed" />

                    {/* Pulsing anomaly radar marker */}
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400" />

                    <div className="absolute -top-6 left-0 bg-slate-950/95 text-amber-300 border border-amber-400/70 px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-lg flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {region.label} ({Math.round(region.confidence)}%)
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Selected Region Tooltip / Popover */}
          {selectedRegion && (
            <div className="absolute bottom-4 right-4 max-w-xs bg-slate-900/95 border border-rose-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs font-mono text-slate-200 z-30">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {selectedRegion.label}
                </span>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div>Type: <span className="text-cyan-400">{selectedRegion.anomalyType}</span></div>
                <div>Confidence: <span className="text-amber-400">{Math.round(selectedRegion.confidence)}%</span></div>
                <div>Coordinates: X:{selectedRegion.x}%, Y:{selectedRegion.y}%</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Embedded Collapsible Forensic Signal Graphs Panel */}
      {showSignalGraphs && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-950/90 animate-in slide-in-from-top-2 duration-200">
          <ForensicSignalGraphs regions={regions} />
        </div>
      )}

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-950/40 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
        <span className="truncate max-w-xs">{documentName}</span>
        <div className="flex items-center gap-3">
          <span>Active Layer: <strong className="uppercase text-cyan-500">{layer}</strong></span>
          <span>Regions Detected: <strong className="text-slate-900 dark:text-white">{regions.length}</strong></span>
          <span className="hidden sm:inline">Graph Grid: <strong className={showGraphGrid ? 'text-emerald-400' : 'text-slate-500'}>{showGraphGrid ? 'ON' : 'OFF'}</strong></span>
        </div>
      </div>
    </GlassCard>
  );
};
