import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { BackendStatusProvider } from './context/BackendStatusContext';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import { BackendBanner } from './components/common/BackendBanner';
import { Navbar } from './components/common/Navbar';
import { AuthGuard } from './components/common/AuthGuard';
import { SpeakingAiChatbot } from './components/common/SpeakingAiChatbot';
import { FloatingChatLauncher } from './components/common/FloatingChatLauncher';

// Pages
import { Dashboard } from './pages/Dashboard';
import { AnalyzePage } from './pages/AnalyzePage';
import { AnalysisResultPage } from './pages/AnalysisResultPage';
import { ComparePage } from './pages/ComparePage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const isAuthPage =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password');

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <AnimatedBackground />

      {/* Real Backend Status Ribbon */}
      <BackendBanner />

      {/* Main Navbar */}
      <Navbar />

      {/* Main Content Area with Authentication Guard */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          {/* Protected routes requiring login first */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/analyze"
            element={
              <AuthGuard>
                <AnalyzePage />
              </AuthGuard>
            }
          />
          <Route
            path="/result/:id"
            element={
              <AuthGuard>
                <AnalysisResultPage />
              </AuthGuard>
            }
          />
          <Route
            path="/compare"
            element={
              <AuthGuard>
                <ComparePage />
              </AuthGuard>
            }
          />
          <Route
            path="/history"
            element={
              <AuthGuard>
                <HistoryPage />
              </AuthGuard>
            }
          />
          <Route
            path="/reports"
            element={
              <AuthGuard>
                <ReportsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <SettingsPage />
              </AuthGuard>
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating AI Speaking Chatbot Widget */}
      <FloatingChatLauncher
        isOpen={isChatbotOpen}
        onClick={() => setIsChatbotOpen(true)}
      />

      {/* Speaking AI Assistant Modal */}
      <SpeakingAiChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />

      {/* Global Security Footer */}
      {!isAuthPage && (
        <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md py-6 text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white tracking-wider">
                VERIFY<span className="text-cyan-500">X</span>-AI
              </span>
              <span>•</span>
              <span>AI Document Tampering &amp; Identity Risk Analyzer</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-cyan-600 dark:text-cyan-400">Zero Mock Data Architecture</span>
              <span>•</span>
              <a href="#/settings" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                FastAPI Gateway
              </a>
              <span>•</span>
              <span>Defense Grade Forensics</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BackendStatusProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </BackendStatusProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
