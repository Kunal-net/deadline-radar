import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-2xl">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-space-md">
        <span className="font-numeric-hero text-numeric-hero-mobile md:text-numeric-hero text-ink-muted">
          404
        </span>
        <h1 className="font-headline-xl text-headline-xl text-ink-primary">
          Commitment not found
        </h1>
        <p className="font-body-md text-body-md text-ink-secondary">
          The requested coordinate lies beyond the known radar horizon.
        </p>
        <Link to="/today" className="mt-space-sm">
          <Button variant="primary" size="md" showArrow>
            Return to Today
          </Button>
        </Link>
      </div>
    </div>
  );
};
