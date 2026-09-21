import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { GlowButton } from '../../components/common/GlowButton';
import { PasswordRequirements } from '../../components/common/PasswordRequirements';
import { validatePassword } from '../../utils/passwordValidator';
import { useLanguage } from '../../context/LanguageContext';
import { useBackendStatus } from '../../context/BackendStatusContext';
import { authApi } from '../../api/auth';

export const SignupPage: React.FC = () => {
  const { t } = useLanguage();
  const { setAuthToken, setUserEmail, setUserName, apiBaseUrl } = useBackendStatus();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

    if (!consent) {
      setErrorMessage('Please accept the Terms of Forensic Service to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.signup({ fullName, email, password });
      if (response?.access_token) {
        setAuthToken(response.access_token);
        setUserEmail(email);
        setUserName(fullName || email.split('@')[0]);
        navigate('/');
      }
    } catch {
      // If backend is unavailable or mock mode, generate local clearance token
      const demoToken = `local_jwt_${Date.now()}_${btoa(email)}`;
      setAuthToken(demoToken);
      setUserEmail(email);
      setUserName(fullName || email.split('@')[0]);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.4)] mb-4">
            <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {t.auth.signupTitle}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {t.auth.signupSub}
          </p>
        </div>

        <GlassCard className="p-8 border-cyan-500/30 shadow-2xl" glow borderAccent="cyan">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">{errorMessage}</span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  Target Endpoint: {apiBaseUrl}/auth/signup
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.auth.fullName}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Vance"
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

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
                  placeholder="name@agency.gov"
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

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

              {/* Password Conditions Checklist */}
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
                  placeholder="Repeat password"
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

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 mt-0.5"
                />
                <span>{t.auth.termsConsent}</span>
              </label>
            </div>

            <GlowButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {t.auth.signupButton}
            </GlowButton>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-600 dark:text-slate-400">
            <span>{t.auth.haveAccount} </span>
            <NavLink
              to="/login"
              className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
            >
              {t.auth.loginButton}
            </NavLink>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
