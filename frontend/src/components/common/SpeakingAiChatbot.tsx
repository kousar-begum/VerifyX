import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Bot,
  Sparkles,
  X,
  Play,
  Square,
  RotateCcw,
  ShieldCheck,
  Activity,
  ArrowRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlowButton } from './GlowButton';
import { useLanguage } from '../../context/LanguageContext';
import { useBackendStatus } from '../../context/BackendStatusContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionRoute?: string;
  actionLabel?: string;
}

interface SpeakingAiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const SpeakingAiChatbot: React.FC<SpeakingAiChatbotProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const { t } = useLanguage();
  const { apiBaseUrl } = useBackendStatus();
  const navigate = useNavigate();

  const [input, setInput] = useState(initialQuery);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am VerifyX AI, your cyber forensic intelligence advisor. I can analyze document tampering, interpret 3D surface graphs, explain ELA residual tensors, and guide your investigation. Speak to me or ask any question!",
      timestamp: 'Just now',
      actionRoute: '/analyze',
      actionLabel: 'Launch Forensic Scanner',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSpeaking]);

  // Handle Speech Synthesis (Text-to-Speech)
  const speakText = (text: string, messageId?: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean text for speech
    const cleanSpeech = text
      .replace(/[*_#`]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/\[.*?\]/g, '')
      .replace(/X-AXIS|Y-AXIS/gi, 'axis')
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') ||
          v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Karen') ||
          v.name.includes('David'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (messageId) setActiveSpeakingId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeakingId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeakingId(null);
    }
  };

  // Handle Speech Recognition (Microphone voice input)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        stopSpeaking();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
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
  };

  // Forensic Knowledge Engine
  const generateForensicResponse = (query: string): { text: string; actionRoute?: string; actionLabel?: string } => {
    const q = query.toLowerCase();

    if (q.includes('graph') || q.includes('3d') || q.includes('surface') || q.includes('spectrogram')) {
      return {
        text: 'The 3D Forensic Spectrogram converts 2D document heatmaps into a topographical surface mesh. The X and Y coordinates map to the document pixel grid, while elevation peaks along the Z-axis represent Error Level Analysis anomalies. Peaks exceeding 0.75 intensity pinpoint localized cloning or digital manipulation.',
        actionRoute: '/analyze',
        actionLabel: 'Inspect 3D Surface Graphs',
      };
    }

    if (q.includes('ela') || q.includes('error level') || q.includes('compression')) {
      return {
        text: 'Error Level Analysis (ELA) works by re-saving an image at a known 95% compression rate and calculating the mathematical delta between the two compression levels. Authentic unmodified documents exhibit a uniform noise floor. Forged, edited, or pasted elements stand out with distinct high-frequency error spikes.',
        actionRoute: '/analyze',
        actionLabel: 'Perform ELA Scan',
      };
    }

    if (q.includes('compare') || q.includes('difference') || q.includes('diff') || q.includes('dna')) {
      return {
        text: 'VerifyX Document DNA Comparison provides side-by-side structural alignment. It calculates a holistic similarity percentage, highlights typography and layout alterations, and isolates textual additions or deletions across contract and identity revisions.',
        actionRoute: '/compare',
        actionLabel: 'Open Document Comparator',
      };
    }

    if (q.includes('history') || q.includes('past') || q.includes('records')) {
      return {
        text: 'You can review all verified scans, export cryptographic audit trails, and inspect past tamper verdicts on the History page.',
        actionRoute: '/history',
        actionLabel: 'View Inspection History',
      };
    }

    if (q.includes('report') || q.includes('export') || q.includes('pdf')) {
      return {
        text: 'Forensic PDF reports include cryptographic SHA-256 integrity hashes, identified anomaly bounding boxes, high-risk metadata tags, and chain-of-custody timestamps for legal and regulatory compliance.',
        actionRoute: '/reports',
        actionLabel: 'Generate Forensic Reports',
      };
    }

    if (q.includes('password') || q.includes('security') || q.includes('rule') || q.includes('condition')) {
      return {
        text: 'VerifyX security clearance requires passwords to meet three strict conditions: minimum 4 characters, at least one numerical digit, and at least one special character. This ensures defense-grade credential resilience.',
        actionRoute: '/profile',
        actionLabel: 'Security Settings',
      };
    }

    if (q.includes('fastapi') || q.includes('backend') || q.includes('supabase') || q.includes('storage')) {
      return {
        text: 'VerifyX AI connects to our high-performance FastAPI neural gateway and Supabase cloud storage buckets. If the backend is running locally, you can configure custom port endpoints in Settings.',
        actionRoute: '/settings',
        actionLabel: 'Open Gateway Settings',
      };
    }

    if (q.includes('tamper') || q.includes('fake') || q.includes('forge') || q.includes('risk')) {
      return {
        text: 'VerifyX evaluates tampering across 5 defense vectors: localized compression variance, copy-move clone stamping, metadata inconsistency, font kerning aberrations, and facial biometric spoofing.',
        actionRoute: '/analyze',
        actionLabel: 'Scan Suspicious Document',
      };
    }

    return {
      text: `Understood. Analyzing query regarding "${query}". In forensic document verification, always inspect both multi-spectral ELA residual layers and coordinate waveforms. You can upload an image or PDF to run our full neural pipeline.`,
      actionRoute: '/analyze',
      actionLabel: 'Run Full Neural Analysis',
    };
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    stopSpeaking();

    // Generate response
    setTimeout(() => {
      const response = generateForensicResponse(trimmed);
      const botMsgId = `bot_${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: response.text,
        timestamp: 'Just now',
        actionRoute: response.actionRoute,
        actionLabel: response.actionLabel,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak response out loud!
      if (voiceEnabled) {
        speakText(response.text, botMsgId);
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full transition-all duration-300 ${
          isExpanded ? 'max-w-3xl h-[85vh]' : 'max-w-xl h-[560px]'
        } flex flex-col`}
      >
        <GlassCard
          className="flex-1 flex flex-col p-0 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden"
          glow
          borderAccent="cyan"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/70 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Bot className="w-5 h-5 text-slate-950" />
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  VerifyX AI Voice &amp; Chatbot
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </h3>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  {isSpeaking ? (
                    <span className="text-cyan-400 animate-pulse flex items-center gap-1 font-semibold">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      SPEAKING OUT LOUD...
                    </span>
                  ) : isListening ? (
                    <span className="text-rose-400 animate-pulse flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                      LISTENING TO VOICE...
                    </span>
                  ) : (
                    <span className="text-slate-400">Speech Engine Ready</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Mute / Unmute Toggle */}
              <button
                onClick={() => {
                  if (voiceEnabled) {
                    stopSpeaking();
                    setVoiceEnabled(false);
                  } else {
                    setVoiceEnabled(true);
                  }
                }}
                className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
                  voiceEnabled
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
                title={voiceEnabled ? 'Voice Output: ON (Click to Mute)' : 'Voice Output: MUTED (Click to Enable)'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span className="hidden sm:inline">{voiceEnabled ? 'Voice ON' : 'Muted'}</span>
              </button>

              {/* Stop Speaking Button if currently speaking */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 transition-colors text-xs font-mono flex items-center gap-1"
                  title="Stop Audio Speech"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              )}

              {/* Expand Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  stopSpeaking();
                  onClose();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Real-time Speaking Equalizer Visualizer Banner */}
          {isSpeaking && (
            <div className="px-4 py-2 bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-950/80 border-b border-cyan-500/30 flex items-center justify-between text-xs font-mono text-cyan-300">
              <div className="flex items-center gap-1.5 h-4">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.sin(i * 0.9 + Date.now() * 0.01) * 8 + 12}px`,
                      animationDuration: '0.4s',
                      animationDelay: `${i * 0.06}s`,
                    }}
                  />
                ))}
                <span className="ml-2 font-bold tracking-wider">AUDIO VOICE STREAM ACTIVE</span>
              </div>
              <button
                onClick={stopSpeaking}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
              >
                [Stop Audio]
              </button>
            </div>
          )}

          {/* Listening Audio Waves */}
          {isListening && (
            <div className="px-4 py-3 bg-rose-950/50 border-b border-rose-500/30 text-center animate-pulse">
              <div className="flex items-center justify-center gap-1.5 h-6 mb-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-rose-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.sin(i * 0.7) * 12 + 14}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-rose-300">
                Listening... Speak your question now
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4 text-slate-950" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-sans font-medium shadow-md ml-auto'
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs font-sans">
                    {msg.text}
                  </p>

                  {/* Message Action Navigation Link */}
                  {msg.actionRoute && (
                    <button
                      onClick={() => {
                        stopSpeaking();
                        onClose();
                        navigate(msg.actionRoute!);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 transition-all"
                    >
                      <span>{msg.actionLabel || 'Navigate'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Replay Voice Audio Button for bot messages */}
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 font-mono">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                          activeSpeakingId === msg.id && isSpeaking
                            ? 'text-cyan-400 font-bold bg-cyan-500/20'
                            : 'hover:text-cyan-400'
                        }`}
                        title="Replay Voice Speech"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{activeSpeakingId === msg.id && isSpeaking ? 'Playing...' : 'Play Voice'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Forensic Prompts */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 overflow-x-auto flex items-center gap-1.5 text-[11px] font-mono scrollbar-none">
            <span className="text-slate-400 shrink-0">Ask:</span>
            {[
              'How does ELA detect tampering?',
              'Explain 3D Surface Graphs',
              'Document DNA comparison',
              'Password security rules',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 border border-slate-300 dark:border-slate-700 whitespace-nowrap transition-colors shrink-0"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          {/* Input & Microphone Controls */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Speak or type a forensic question..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak via Microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <GlowButton type="submit" variant="primary" size="md" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </GlowButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
