import React, { useState } from 'react';
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { GlowButton } from '../../components/common/GlowButton';
import { PasswordRequirements } from '../../components/common/PasswordRequirements';
import { validatePassword } from '../../utils/passwordValidator';
import { useLanguage } from '../../context/LanguageContext';
import { useBackendStatus } from '../../context/BackendStatusContext';
import { authApi } from '../../api/auth';

export const ResetPasswordPage: React.FC = () => {
  const { t } = useLanguage();
  const { apiBaseUrl } = useBackendStatus();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Enforce password requirements: min 4 chars, number, special char
    if (!passwordValidation.isValid) {
      if (!passwordValidation.minLength) {
        setErrorMessage('Password must be at least 4 characters long.');
        return;
      }
      if (!passwordValidation.hasNumber) {
        setErrorMessage('Password must include at least one numerical digit (0-9).');
        return;
      }
      if (!passwordValidation.hasSpecial) {
        setErrorMessage('Password must include at least one special character (!@#$%^&* etc.).');
        return;
      }
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(password, token);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Password reset failed. Token may have expired or backend is disconnected.'
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
            {t.auth.resetPasswordTitle}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {t.auth.resetPasswordSub}
          </p>
        </div>

        <GlassCard className="p-8 border-cyan-500/30 shadow-2xl" glow>
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Password Re-Keyed Successfully
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Your credentials have been securely updated in the backend authentication store.
              </p>
              <div className="pt-3">
                <NavLink to="/login">
                  <GlowButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                    Proceed to Login
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
                      Endpoint: {apiBaseUrl}/auth/reset-password
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 4 chars, 1 number, 1 special char"
                    className="w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <PasswordRequirements password={password} showAlways={false} />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <GlowButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                {t.auth.resetButton}
              </GlowButton>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
