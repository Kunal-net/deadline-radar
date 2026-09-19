import React from 'react';
import { MetricBlock } from '../components/ui/MetricBlock';

export const InsightsView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-lg">
        <div>
          <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
            Empirical Feedback Loop
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary mt-1">
            Personal Insights
          </h1>
          <p className="font-body-md text-body-md text-ink-secondary mt-1">
            Continuous personalization curves derived from actual stopwatch observations and completion variance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          <MetricBlock
            label="Estimation Accuracy"
            value="89%"
            description="Average predicted vs actual time ratio"
          />
          <MetricBlock
            label="Coding Pace Factor"
            value="1.2x"
            description="You typically require 20% longer than initial estimate"
            variant="cream"
          />
          <MetricBlock
            label="Reading Pace Factor"
            value="0.95x"
            description="Academic readings completed slightly ahead of baseline"
          />
        </div>
      </div>
    </div>
  );
};
