import React from 'react';
import clsx from 'clsx';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={clsx(
        'w-full py-space-xl px-space-md border-t border-b border-border-hairline bg-surface-container-low',
        'flex flex-col items-start gap-space-sm rounded-none',
        className
      )}
    >
      <span className="font-label-md text-label-md font-medium text-ink-muted">
        Zero Active Commitments
      </span>
      <h3 className="font-headline-lg text-headline-lg text-ink-primary">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-ink-secondary max-w-xl">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="pt-space-xs">
          <Button variant="primary" onClick={onAction} showArrow>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
