import React from 'react';
import { MetricBlock } from '../components/ui/MetricBlock';

export const WorkloadView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-lg">
        <div>
          <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
            Capacity Pressure
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary mt-1">
            Workload Distribution
          </h1>
          <p className="font-body-md text-body-md text-ink-secondary mt-1">
            Visualizing usable capacity against required deliverable hours by day and week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
          <MetricBlock
            label="Load Ratio"
            value="78%"
            description="14.5 hours assigned against 18.5 hours net capacity"
          />
          <MetricBlock
            label="Peak Day Load"
            value="Thursday"
            description="7.0h required against 5.0h max recommended focus threshold"
            variant="cream"
          />
        </div>
      </div>
    </div>
  );
};
