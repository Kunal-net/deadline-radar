import React from 'react';
import clsx from 'clsx';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Calibrating timeline and focus envelopes...',
  className,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'w-full py-space-xl flex flex-col items-center justify-center gap-space-md text-ink-secondary',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block shrink-0 animate-pulse motion-reduce:animate-none" />
        <span className="w-1.5 h-1.5 bg-ink-primary inline-block shrink-0" />
        <span className="w-1.5 h-1.5 bg-ink-muted inline-block shrink-0" />
      </div>
      <p className="font-body-md text-body-md text-ink-muted">{message}</p>
    </div>
  );
};
