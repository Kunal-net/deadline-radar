import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';

export const SignupView: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!fullName.trim() || !email.trim() || !password) {
      setLocalError('Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email.trim(), password, fullName.trim(), timezone);
      navigate('/onboarding', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setLocalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-ink-primary flex flex-col justify-center items-center px-margin-mobile py-space-xl">
      <div className="w-full max-w-md bg-surface-container-lowest border border-border-hairline p-space-lg sm:p-space-xl shadow-sm">
        {/* Header Block */}
        <div className="flex flex-col gap-space-xs mb-space-lg">
          <Link to="/" className="inline-flex items-center gap-space-xs mb-space-sm group">
            <span className="w-2 h-2 bg-accent-terracotta inline-block" />
            <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted group-hover:text-ink-primary transition-colors">
              Deadline Radar
            </span>
          </Link>
          <h1 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight">
            Create Account
          </h1>
          <p className="font-body-md text-body-md text-ink-secondary">
            Establish your personal baseline and secure your cognitive work margins.
          </p>
        </div>

        {/* Error Alert */}
        {(localError || error) && (
          <div
            role="alert"
            className="mb-space-md p-space-sm bg-status-alert/10 border border-status-alert text-status-alert font-body-md text-body-md flex items-start gap-space-xs"
          >
            <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
            <span>{localError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="signup-name"
              className="font-label-md text-label-md text-ink-primary uppercase tracking-wider"
            >
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="bg-surface border border-border-hairline px-space-md py-space-xs font-body-md text-body-md text-ink-primary focus:outline-none focus:border-ink-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="signup-email"
              className="font-label-md text-label-md text-ink-primary uppercase tracking-wider"
            >
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@university.edu"
              className="bg-surface border border-border-hairline px-space-md py-space-xs font-body-md text-body-md text-ink-primary focus:outline-none focus:border-ink-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="signup-password"
              className="font-label-md text-label-md text-ink-primary uppercase tracking-wider"
            >
              Password (min 8 characters)
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-surface border border-border-hairline px-space-md py-space-xs font-body-md text-body-md text-ink-primary focus:outline-none focus:border-ink-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="signup-timezone"
              className="font-label-md text-label-md text-ink-primary uppercase tracking-wider"
            >
              Timezone
            </label>
            <input
              id="signup-timezone"
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/New_York"
              className="bg-surface border border-border-hairline px-space-md py-space-xs font-body-md text-body-md text-ink-primary focus:outline-none focus:border-ink-primary transition-colors"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full mt-space-xs flex justify-center items-center"
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </Button>
        </form>

        {/* Footer / Switch Block */}
        <div className="mt-space-lg pt-space-md border-t border-border-hairline flex flex-col gap-space-xs text-center text-body-md text-ink-secondary">
          <div>
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-ink-primary font-semibold hover:text-accent-terracotta underline underline-offset-4 transition-colors"
            >
              Sign in
            </Link>
          </div>
          <div>
            <Link
              to="/"
              className="font-label-md text-label-md text-ink-muted hover:text-ink-primary transition-colors"
            >
              ← Back to Overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
