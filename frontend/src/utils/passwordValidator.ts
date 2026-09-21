/**
 * Password validation rules for VerifyX-AI security clearance:
 * 1. Minimum 4 characters
 * 2. At least one numerical digit (0-9)
 * 3. At least one special character (!@#$%^&*()_+-=[]{};':"|,.<>/?`~)
 */
export interface PasswordValidationResult {
  minLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
  score: number; // 0 to 3
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const minLength = password.length >= 4;
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  let score = 0;
  if (minLength) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  return {
    minLength,
    hasNumber,
    hasSpecial,
    isValid: minLength && hasNumber && hasSpecial,
    score,
  };
};
