import React from 'react';
import { Bot, Volume2, Sparkles } from 'lucide-react';

interface FloatingChatLauncherProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingChatLauncher: React.FC<FloatingChatLauncherProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      {/* Floating Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Ask AI Voice &amp; Chatbot</span>
      </div>

      <button
        onClick={onClick}
        className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 text-slate-950 p-0 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] hover:scale-105 active:scale-95 transition-all"
        title="Open VerifyX Speaking AI Assistant"
      >
        {/* Animated Cyber Pulsing Ring */}
        <span className="absolute -inset-1 rounded-2xl bg-cyan-400/30 animate-ping pointer-events-none" />

        <div className="relative flex items-center justify-center">
          <Bot className="w-7 h-7 text-slate-950 stroke-[2.2]" />
          {/* Small speaking volume badge */}
          <span className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-950 border border-cyan-400 text-cyan-300">
            <Volume2 className="w-2.5 h-2.5 animate-pulse" />
          </span>
        </div>
      </button>
    </div>
  );
};
