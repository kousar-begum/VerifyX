import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanLine,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  FileSearch,
  Eye,
  Activity,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { GlowButton } from '../components/common/GlowButton';
import { UploadZone } from '../components/forensics/UploadZone';
import { useLanguage } from '../context/LanguageContext';
import { useBackendStatus } from '../context/BackendStatusContext';
import { documentsApi } from '../api/documents';
import { analysisApi } from '../api/analysis';

const SCAN_STEPS = [
  { id: 1, label: 'Streaming Document to Secure Vault', icon: <ScanLine className="w-4 h-4" /> },
  { id: 2, label: 'Extracting EXIF, ICC Profile & Header Signature', icon: <FileSearch className="w-4 h-4" /> },
  { id: 3, label: 'Executing Neural Optical Character Recognition', icon: <Cpu className="w-4 h-4" /> },
  { id: 4, label: 'Computing Error Level Analysis (ELA) Multi-Spectral Tensor', icon: <Layers className="w-4 h-4" /> },
  { id: 5, label: 'Synthesizing Risk Vector Index & Tamper Heatmap', icon: <Eye className="w-4 h-4" /> },
];

export const AnalyzePage: React.FC = () => {
  const { t } = useLanguage();
  const { isConnected, apiBaseUrl } = useBackendStatus();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Configuration options
  const [deepScan, setDeepScan] = useState(true);
  const [sensitivity, setSensitivity] = useState<'standard' | 'high' | 'ultra'>('high');

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;
    setErrorMessage(null);
    setIsScanning(true);
    setActiveStep(1);

    try {
      // 1. Upload document to FastAPI backend
      setUploadProgress(50);
      const uploadResult = await documentsApi.uploadDocument(selectedFile);
      setUploadProgress(100);

      const documentId = uploadResult?.documentId || 'doc-1';

      // 2. Animate stepping through stages while dispatching analysis job
      setActiveStep(2);
      const analysisJob = await analysisApi.triggerAnalysis(documentId);

      setActiveStep(3);
      await new Promise((r) => setTimeout(r, 600));

      setActiveStep(4);
      await new Promise((r) => setTimeout(r, 600));

      setActiveStep(5);
      await new Promise((r) => setTimeout(r, 600));

      const analysisId = analysisJob?.analysisId || documentId;
      navigate(`/result/${analysisId}`);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMessage(
        err.message ||
          'Failed to connect to backend engine. Please confirm FastAPI is running on ' +
            apiBaseUrl
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            DIGITAL FORENSIC ENGINE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
          {t.analyze.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
          {t.analyze.subtitle}
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Analysis Engine Communication Error</span>
            <span className="text-slate-600 dark:text-slate-300 block">{errorMessage}</span>
            <span className="text-[11px] font-mono text-slate-500 block">
              Ensure your FastAPI server is started via: <code className="text-cyan-400">uvicorn main:app --reload --port 8000</code>
            </span>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {!isScanning && (
        <div className="space-y-6">
          <UploadZone
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            isUploading={isScanning}
            uploadProgress={uploadProgress}
          />

          {/* Analysis Settings */}
          {selectedFile && (
            <GlassCard className="p-5 border-cyan-500/30" glow>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
                <Sliders className="w-4 h-4 text-cyan-500" />
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Analysis Engine Configuration
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Deep Scan Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Multi-Spectral ELA Deep Scan
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Calculates JPEG re-compression tensor grid
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeepScan(!deepScan)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      deepScan ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        deepScan ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Sensitivity Selector */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Anomaly Sensitivity
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Threshold for micro-font alterations
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-mono">
                    {(['standard', 'high', 'ultra'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSensitivity(lvl)}
                        className={`px-2 py-1 rounded capitalize transition-all ${
                          sensitivity === lvl
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Analysis Button */}
              <div className="mt-6 flex justify-end">
                <GlowButton
                  variant="primary"
                  size="lg"
                  onClick={handleStartAnalysis}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  {t.analyze.startAnalysis}
                </GlowButton>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* Scanning Animation / Progress Screen */}
      {isScanning && (
        <GlassCard className="p-8 md:p-12 text-center border-cyan-500/50 shadow-2xl relative overflow-hidden" glow>
          {/* Cyber Scanning Laser Line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scanLaser_2s_ease-in-out_infinite]" />

          <div className="max-w-md mx-auto space-y-6">
            {/* Spinning Radar Target */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-[radarSweep_4s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-cyan-400/50 border-dashed animate-spin duration-700" />
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                <ScanLine className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {t.analyze.analyzingDocument}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Forensic neural pipeline active • Document ID in transit
              </p>
            </div>

            {/* Stepper */}
            <div className="space-y-2.5 text-left pt-2">
              {SCAN_STEPS.map((step) => {
                const isDone = activeStep > step.id;
                const isCurrent = activeStep === step.id;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-mono transition-all ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isCurrent
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/30 border-slate-800 text-slate-600'
                    }`}
                  >
                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span className="flex-1 font-medium">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
