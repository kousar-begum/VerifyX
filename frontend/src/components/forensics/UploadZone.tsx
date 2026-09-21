import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  X,
  RefreshCw,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlowButton } from '../common/GlowButton';
import { useLanguage } from '../../context/LanguageContext';

interface UploadZoneProps {
  label?: string;
  sublabel?: string;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  accept?: string;
  maxSizeMB?: number;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  label,
  sublabel,
  selectedFile,
  onFileSelect,
  isUploading = false,
  uploadProgress = 0,
  accept = '.pdf,.png,.jpg,.jpeg,.webp',
  maxSizeMB = 25,
}) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    // Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File exceeds maximum allowed limit of ${maxSizeMB}MB.`);
      return;
    }

    // Validate extension
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(fileExt)) {
      setErrorMessage(
        `Invalid file type (.${fileExt}). Please upload PDF, PNG, JPG, or WEBP.`
      );
      return;
    }

    // Generate local preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrorMessage(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        id="document-file-input"
      />

      {!selectedFile ? (
        <GlassCard
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            p-8 md:p-12 text-center cursor-pointer border-2 border-dashed transition-all duration-200
            ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.25)] scale-[1.005]'
                : 'border-slate-300 dark:border-slate-700/80 hover:border-cyan-500/60 hover:bg-cyan-500/[0.02]'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              {label || t.analyze.uploadAreaTitle}
            </h3>

            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-3">
              {t.analyze.uploadAreaDrag}{' '}
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold underline underline-offset-2">
                {t.analyze.uploadAreaBrowse}
              </span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                PDF, PNG, JPG, WEBP
              </span>
              <span>•</span>
              <span>Max {maxSizeMB}MB</span>
            </div>

            {sublabel && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 italic">{sublabel}</p>
            )}
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-5 md:p-6 border-cyan-500/40" borderAccent="cyan" glow>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* File Details & Preview */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="w-full h-full object-cover"
                  />
                ) : selectedFile.name.endsWith('.pdf') ? (
                  <FileText className="w-8 h-8 text-rose-500" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-cyan-500" />
                )}
                <div className="absolute top-1 right-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 bg-white dark:bg-slate-900 rounded-full" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">
                    {selectedFile.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/30 shrink-0">
                    {selectedFile.name.split('.').pop()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>•</span>
                  <span>{selectedFile.type || 'Document'}</span>
                </div>

                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                  <FileCheck className="w-3 h-3" />
                  <span>Valid container signature</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                title={t.analyze.replaceFile}
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
                <span>{t.analyze.replaceFile}</span>
              </button>

              <button
                onClick={handleRemove}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-300 dark:border-rose-900/40 transition-colors flex items-center gap-1.5"
                title={t.analyze.removeFile}
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.analyze.removeFile}</span>
              </button>
            </div>
          </div>

          {/* Upload Progress bar if active */}
          {isUploading && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Streaming document to backend...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {errorMessage && (
        <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
