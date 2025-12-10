export interface PasswordStrength {
  score: number; // 0-4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  color: string;
  suggestions: string[];
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length === 0) {
    return { score: 0, label: 'Weak', color: 'bg-destructive', suggestions: ['Enter a password'] };
  }

  // Length check
  if (password.length >= 8) score++;
  else suggestions.push('At least 8 characters');

  if (password.length >= 12) score++;

  // Uppercase check
  if (/[A-Z]/.test(password)) score++;
  else suggestions.push('Add uppercase letters');

  // Lowercase check
  if (/[a-z]/.test(password)) score++;
  else suggestions.push('Add lowercase letters');

  // Number check
  if (/[0-9]/.test(password)) score++;
  else suggestions.push('Add numbers');

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push('Add special characters');

  // Normalize score to 0-4
  const normalizedScore = Math.min(Math.floor(score * 0.67), 4);

  const labels: PasswordStrength['label'][] = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    color: colors[normalizedScore],
    suggestions: suggestions.slice(0, 2),
  };
};
