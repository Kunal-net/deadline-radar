import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low border-t border-border-hairline mt-auto">
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-lg flex flex-col md:flex-row items-baseline justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <span className="font-headline-md text-headline-md text-ink-primary">
            Deadline Radar
          </span>
          <p className="font-body-md text-body-md text-ink-secondary max-w-sm">
            An editorial, calm, and intellectually grounded personal deadline intelligence instrument.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-md lg:gap-space-lg">
          <Link
            to="/radar"
            className="font-label-md text-label-md text-ink-secondary hover:text-ink-primary transition-colors"
          >
            Radar Overview
          </Link>
          <Link
            to="/planning"
            className="font-label-md text-label-md text-ink-secondary hover:text-ink-primary transition-colors"
          >
            Capacity Allocation
          </Link>
          <Link
            to="/settings"
            className="font-label-md text-label-md text-ink-secondary hover:text-ink-primary transition-colors"
          >
            Preferences
          </Link>
          <span className="font-label-md text-label-md text-ink-muted">
            © 2026 Deadline Radar. Human Capacity First.
          </span>
        </div>
      </div>
    </footer>
  );
};
