import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { GlowButton } from '../../components/common/GlowButton';
import { useLanguage } from '../../context/LanguageContext';
import { useBackendStatus } from '../../context/BackendStatusContext';
import { authApi } from '../../api/auth';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useLanguage();
  const { apiBaseUrl } = useBackendStatus();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Unable to transmit reset instructions. Please verify backend connectivity.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {t.auth.forgotPasswordTitle}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {t.auth.forgotPasswordSub}
          </p>
        </div>

        <GlassCard className="p-8 border-cyan-500/30 shadow-2xl" glow>
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Recovery Dispatch Transmitted
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                If an enterprise account is associated with <strong className="text-cyan-400">{email}</strong>,
                password recovery credentials have been queued by your backend service.
              </p>
              <div className="pt-3">
                <NavLink to="/login">
                  <GlowButton variant="secondary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
                    Return to Login Terminal
                  </GlowButton>
                </NavLink>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span>{errorMessage}</span>
                    <span className="block text-[11px] text-slate-500 font-mono mt-0.5">
                      Endpoint: {apiBaseUrl}/auth/forgot-password
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@agency.gov"
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <GlowButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
                icon={<Send className="w-4 h-4" />}
              >
                {t.auth.sendResetLink}
              </GlowButton>

              <div className="pt-4 text-center">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 font-mono transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Login Terminal</span>
                </NavLink>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
