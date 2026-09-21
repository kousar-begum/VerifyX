import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ScanLine,
  GitCompare,
  Layers,
  FileDown,
  History,
  ShieldCheck,
  User,
  Settings,
  Sun,
  Moon,
  Globe,
  Sliders,
  Sparkles,
  ArrowRight,
  Command,
  X,
  Check,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../types';


export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  category: 'Forensic Tools' | 'Analysis Modules' | 'Reporting & Audit' | 'System & Preferences';
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  action: () => void;
  keywords: string[];
}

interface FeatureSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureSearch: React.FC<FeatureSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const features: FeatureItem[] = [
    {
      id: 'feat-analyze',
      title: 'Document Tampering & Forgery Analyzer',
      description: 'Upload any document (PDF, PNG, JPG) to run 5-stage neural tamper detection.',
      category: 'Forensic Tools',
      icon: ScanLine,
      badge: 'Core Tool',
      keywords: ['analyze', 'upload', 'tamper', 'scan', 'forgery', 'detect', 'check', 'fake'],
      action: () => {
        navigate('/analyze');
        onClose();
      },
    },
    {
      id: 'feat-compare',
      title: 'Dual Document Version Comparison',
      description: 'Side-by-side alignment of Baseline Master vs Candidate Variant to isolate drift.',
      category: 'Forensic Tools',
      icon: GitCompare,
      badge: 'Comparator',
      keywords: ['compare', 'difference', 'diff', 'side by side', 'dna', 'variant', 'master', 'two files'],
      action: () => {
        navigate('/compare');
        onClose();
      },
    },
    {
      id: 'feat-heatmap',
      title: 'Multi-Layer Heatmap & Canvas Inspector',
      description: 'Interactive canvas with neural tamper heatmap, high-frequency X-Ray, and zoom.',
      category: 'Analysis Modules',
      icon: Layers,
      badge: 'Canvas',
      keywords: ['heatmap', 'xray', 'canvas', 'overlay', 'zoom', 'suspicious areas', 'interactive', 'layers'],
      action: () => {
        navigate('/result/sample-1');
        onClose();
      },
    },
    {
      id: 'feat-ela',
      title: 'Error Level Analysis (ELA)',
      description: 'Identifies JPEG re-compression gradient anomalies and localized pixel splicing.',
      category: 'Analysis Modules',
      icon: Sparkles,
      keywords: ['ela', 'error level', 'noise', 'compression', 'jpeg', 'splicing', 'resaved'],
      action: () => {
        navigate('/analyze');
        onClose();
      },
    },
    {
      id: 'feat-copymove',
      title: 'Copy-Move Texture Cloning Detector',
      description: 'Detects duplicated stamp marks, forged signatures, and cloned image patches.',
      category: 'Analysis Modules',
      icon: ShieldCheck,
      keywords: ['clone', 'copy move', 'signature', 'stamp', 'duplicated', 'patch', 'cut paste'],
      action: () => {
        navigate('/analyze');
        onClose();
      },
    },
    {
      id: 'feat-font',
      title: 'Font & Glyph Inconsistency Check',
      description: 'Scans for antialiasing variations, baseline shifts, and mismatched typography.',
      category: 'Analysis Modules',
      icon: Sliders,
      keywords: ['font', 'glyph', 'typography', 'text', 'antialiasing', 'kerning', 'altered number'],
      action: () => {
        navigate('/analyze');
        onClose();
      },
    },
    {
      id: 'feat-reports',
      title: 'Court-Admissible PDF & JSON Dossiers',
      description: 'Generate, preview, and download structured forensic audit reports.',
      category: 'Reporting & Audit',
      icon: FileDown,
      badge: 'Compliance',
      keywords: ['report', 'pdf', 'download', 'export', 'json', 'csv', 'dossier', 'compliance', 'legal'],
      action: () => {
        navigate('/reports');
        onClose();
      },
    },
    {
      id: 'feat-history',
      title: 'Audit Trail & Historical Case Archives',
      description: 'Filter, inspect, search, and manage previously analyzed documents.',
      category: 'Reporting & Audit',
      icon: History,
      keywords: ['history', 'logs', 'audit', 'previous', 'cases', 'records', 'past analyses'],
      action: () => {
        navigate('/history');
        onClose();
      },
    },
    {
      id: 'feat-profile',
      title: 'Operator Clearance & Cryptographic Dossier',
      description: 'View session cryptographic tokens, security clearance, and analyst profile.',
      category: 'System & Preferences',
      icon: User,
      keywords: ['profile', 'operator', 'agent', 'clearance', 'keys', 'credentials', 'analyst'],
      action: () => {
        navigate('/profile');
        onClose();
      },
    },
    {
      id: 'feat-theme',
      title: theme === 'dark' ? 'Switch to Clinical Light Theme' : 'Switch to Cyber Dark Theme',
      description: `Toggle application visual theme (currently ${theme.toUpperCase()} mode).`,
      category: 'System & Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      badge: 'Instant',
      keywords: ['theme', 'dark', 'light', 'mode', 'color', 'appearance', 'switch'],
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'feat-lang-te',
      title: 'Switch Language to Telugu (తెలుగు)',
      description: 'Instant UI localization to Telugu language.',
      category: 'System & Preferences',
      icon: Globe,
      keywords: ['telugu', 'language', 'తెలుగు', 'translate'],
      action: () => {
        setLanguage('te');
        onClose();
      },
    },
    {
      id: 'feat-lang-hi',
      title: 'Switch Language to Hindi (हिन्दी)',
      description: 'Instant UI localization to Hindi language.',
      category: 'System & Preferences',
      icon: Globe,
      keywords: ['hindi', 'language', 'हिन्दी', 'translate'],
      action: () => {
        setLanguage('hi');
        onClose();
      },
    },
    {
      id: 'feat-settings',
      title: 'Gateway & Neural Parameter Settings',
      description: 'Configure FastAPI endpoints, test connection roundtrip, and adjust sensitivity.',
      category: 'System & Preferences',
      icon: Settings,
      keywords: ['settings', 'gateway', 'api', 'backend', 'server', 'url', 'fastapi', 'diagnostics'],
      action: () => {
        navigate('/settings');
        onClose();
      },
    },
  ];

  const filteredFeatures = features.filter((feat) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      feat.title.toLowerCase().includes(q) ||
      feat.description.toLowerCase().includes(q) ||
      feat.category.toLowerCase().includes(q) ||
      feat.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredFeatures.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredFeatures.length) % (filteredFeatures.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFeatures[selectedIndex]) {
        filteredFeatures[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search VerifyX-AI features"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden transition-all text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Animated Holographic Top Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-violet-500 animate-pulse" />

        {/* Search Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-cyan-500 shrink-0 mr-3 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features, forensic tests, reports, settings..."
            className="w-full bg-transparent text-sm sm:text-base font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Feature List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredFeatures.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No matching forensic features found for &quot;{query}&quot;.
              <div className="mt-1 text-slate-400">
                Try searching for: <strong className="text-cyan-400">Analyze</strong>, <strong className="text-cyan-400">Compare</strong>, <strong className="text-cyan-400">Heatmap</strong>, or <strong className="text-cyan-400">Reports</strong>
              </div>
            </div>
          ) : (
            filteredFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={feat.id}
                  onClick={feat.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-start gap-3.5 p-3 rounded-xl text-left transition-all group ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-slate-900 dark:text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                        : 'bg-slate-100 dark:bg-slate-800 text-cyan-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm truncate">
                        {feat.title}
                      </span>
                      {feat.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                          {feat.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {feat.description}
                    </p>
                  </div>

                  <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">↵</kbd> to select
            </span>
          </div>
          <span className="text-cyan-500 hidden sm:inline">
            VerifyX-AI Neural Registry • Standalone Mode
          </span>
        </div>
      </div>
    </div>
  );
};
