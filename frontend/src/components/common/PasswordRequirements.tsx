import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { validatePassword, PasswordValidationResult } from '../../utils/passwordValidator';

interface PasswordRequirementsProps {
  password: string;
  showAlways?: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  showAlways = false,
}) => {
  const result: PasswordValidationResult = validatePassword(password);

  if (!password && !showAlways) {
    return null;
  }

  const items = [
    {
      key: 'minLength',
      label: 'Minimum 4 characters',
      valid: result.minLength,
    },
    {
      key: 'hasNumber',
      label: 'Must include numerical digit (0-9)',
      valid: result.hasNumber,
    },
    {
      key: 'hasSpecial',
      label: 'Must include at least 1 special character (!@#$%^&*)',
      valid: result.hasSpecial,
    },
  ];

  return (
    <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-2">
      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-800">
        <span className="text-slate-400 flex items-center gap-1.5 font-sans font-medium">
          {result.isValid ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          )}
          Password Security Rules:
        </span>
        <span
          className={`font-bold ${
            result.isValid
              ? 'text-emerald-400'
              : result.score >= 2
              ? 'text-amber-400'
              : 'text-rose-400'
          }`}
        >
          {result.score}/3 Rules Met
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-2 text-[11px] transition-colors ${
              item.valid
                ? 'text-emerald-400'
                : password
                ? 'text-rose-400'
                : 'text-slate-500'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border text-[10px] ${
                item.valid
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {item.valid ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5 stroke-[2.5]" />}
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
