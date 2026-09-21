import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, X, Volume2, Bot, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlowButton } from './GlowButton';
import { useLanguage } from '../../context/LanguageContext';
import { useBackendStatus } from '../../context/BackendStatusContext';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand?: (command: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const { t } = useLanguage();
  const { isConnected, apiBaseUrl } = useBackendStatus();
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleMic = () => {
    if (!isListening) {
      setIsListening(true);
      // Check for browser speech recognition availability
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setVoiceTranscript(transcript);
            setInputText(transcript);
          };
          recognition.onend = () => {
            setIsListening(false);
          };
          recognition.onerror = () => {
            setIsListening(false);
          };
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        // Fallback for environments without speech recognition permission
        setTimeout(() => {
          setIsListening(false);
        }, 3000);
      }
    } else {
      setIsListening(false);
    }
  };

  const handleCommandSelect = (cmd: string) => {
    setInputText(cmd);
    if (onExecuteCommand) {
      onExecuteCommand(cmd);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (onExecuteCommand) {
      onExecuteCommand(inputText);
    }
    // We intentionally DO NOT generate fake AI answers here per specification #3 and #22
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg">
        <GlassCard className="p-6 border-cyan-500/50 shadow-2xl relative" glow borderAccent="cyan">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Bot className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  {t.voice.title}
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {isListening ? (
                    <span className="text-cyan-400 animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      {t.voice.listening}
                    </span>
                  ) : (
                    t.voice.idle
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Voice Wave Animation when listening */}
          {isListening && (
            <div className="my-6 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-center">
              <div className="flex items-center justify-center gap-1.5 h-10 mb-2">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.sin(i * 0.8) * 20 + 24}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-mono text-cyan-300">
                {voiceTranscript || 'Capturing speech audio stream...'}
              </p>
            </div>
          )}

          {/* Suggested Commands */}
          <div className="mt-4 mb-5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
              {t.voice.suggestedCommands}
            </span>
            <div className="flex flex-wrap gap-2">
              {[t.voice.cmd1, t.voice.cmd2, t.voice.cmd3].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleCommandSelect(cmd)}
                  className="px-3 py-1.5 text-xs rounded-lg font-medium text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/40 transition-all text-left"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>

          {/* Real Backend Status Notice */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 mb-4 text-xs font-mono flex items-start gap-2.5 text-slate-400">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span>{t.voice.backendNotice}</span>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Target Endpoint: <code className="text-cyan-300">{apiBaseUrl}/assistant/stream</code>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.voice.promptPlaceholder}
                className="w-full px-4 py-2.5 pl-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
              <Volume2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            <button
              type="button"
              onClick={toggleMic}
              title={isListening ? 'Stop Listening' : 'Activate Microphone'}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <GlowButton type="submit" variant="primary" size="md" disabled={!inputText.trim()}>
              <Send className="w-4 h-4" />
            </GlowButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
