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
      className={clsx(
        'w-full py-space-xl flex flex-col items-center justify-center gap-space-md text-ink-secondary',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-accent-terracotta inline-block animate-ping" />
        <span className="w-2 h-2 bg-ink-primary inline-block" />
        <span className="w-2 h-2 bg-ink-muted inline-block" />
      </div>
      <p className="font-body-md text-body-md text-ink-muted">{message}</p>
    </div>
  );
};
