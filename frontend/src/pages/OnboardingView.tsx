import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const OnboardingView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-2xl mx-auto flex flex-col gap-space-lg">
        <div>
          <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
            Capacity Setup · 5 Steps
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary mt-1">
            Calibrate your personal radar
          </h1>
          <p className="font-body-lg text-body-lg text-ink-secondary mt-1">
            Deadline Radar needs to know your baseline availability to plan realistically without guilt.
          </p>
        </div>

        <div className="bg-surface-container-low p-space-lg flex flex-col gap-space-md">
          <div className="flex items-center justify-between font-label-md text-label-md text-ink-muted">
            <span>STEP 01 OF 05</span>
            <span>AVAILABLE HOURS</span>
          </div>

          <h3 className="font-headline-md text-headline-md text-ink-primary">
            How many focused hours can you realistically spend each week?
          </h3>
          <p className="font-body-md text-body-md text-ink-secondary">
            Exclude meals, lectures, commute, and personal downtime. Be conservative.
          </p>

          <input
            type="number"
            defaultValue={25}
            className="w-40 bg-surface border border-border-hairline p-space-sm font-numeric-hero text-numeric-hero-mobile text-ink-primary"
          />

          <div className="pt-space-md flex justify-between items-center">
            <Link to="/today">
              <Button variant="ghost" size="md">
                Skip to Today
              </Button>
            </Link>
            <Link to="/today">
              <Button variant="primary" size="md" showArrow>
                Next Step
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
