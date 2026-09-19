import React from 'react';
import { Button } from '../components/ui/Button';

export const SettingsView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-space-lg">
        <div>
          <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
            Preferences &amp; Boundaries
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary mt-1">
            Settings
          </h1>
          <p className="font-body-md text-body-md text-ink-secondary mt-1">
            Configure your personal capacity limits, buffer allowances, and protected offline windows.
          </p>
        </div>

        <div className="bg-surface-container-low p-space-md flex flex-col gap-space-md max-w-2xl">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
              Max Daily Focus Hours
            </span>
            <span className="font-body-md text-body-md text-ink-secondary">
              Threshold beyond which the radar flags capacity overload warnings.
            </span>
            <input
              type="number"
              defaultValue={5.0}
              step={0.5}
              className="w-32 bg-surface border border-border-hairline p-space-xs font-headline-md text-headline-md text-ink-primary mt-space-xs"
            />
          </div>

          <div className="flex flex-col gap-space-xs pt-space-sm border-t border-border-hairline">
            <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
              Protected Evening Cutoff
            </span>
            <span className="font-body-md text-body-md text-ink-secondary">
              No work blocks will be planned past this time to safeguard recovery.
            </span>
            <input
              type="text"
              defaultValue="18:30"
              className="w-32 bg-surface border border-border-hairline p-space-xs font-headline-md text-headline-md text-ink-primary mt-space-xs"
            />
          </div>

          <div className="pt-space-sm">
            <Button variant="primary" size="md">
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
