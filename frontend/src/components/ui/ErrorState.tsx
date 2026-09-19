import React from 'react';
import clsx from 'clsx';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Capacity Sync Disrupted',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={clsx(
        'w-full p-space-md bg-surface-cream border-l-2 border-accent-terracotta text-ink-primary',
        'flex flex-col gap-space-xs',
        className
      )}
    >
      <div className="flex items-center gap-space-xs">
        <span className="w-2 h-2 bg-status-alert inline-block" />
        <h4 className="font-label-lg text-label-lg font-semibold uppercase tracking-wider text-status-alert">
          {title}
        </h4>
      </div>
      <p className="font-body-md text-body-md text-ink-secondary">{message}</p>
      {onRetry && (
        <div className="pt-space-xs">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry Calibration
          </Button>
        </div>
      )}
    </div>
  );
};
