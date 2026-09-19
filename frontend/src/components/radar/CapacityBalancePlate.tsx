import React from 'react';
import { CapacityMetric } from '../../services/apiTypes';

interface CapacityBalancePlateProps {
  metric: CapacityMetric;
}

export const CapacityBalancePlate: React.FC<CapacityBalancePlateProps> = ({ metric }) => {
  return (
    <section className="w-full bg-surface-container py-space-xl px-margin-mobile md:px-margin-tablet lg:px-margin">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
          <div>
            <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
              Week Overview
            </span>
            <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary mt-1">
              Available focus vs. required energy.
            </h2>
          </div>
          <p className="font-body-md text-body-md text-ink-secondary max-w-md">
            Direct tally of confirmed calendar focus windows against remaining estimated deliverable hours.
          </p>
        </div>

        {/* Balance Visualization / Editorial Ratio Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm mb-space-md">
          {/* Block 1: Available Time */}
          <div className="bg-surface p-space-md flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-ink-muted uppercase">
                Available Time
              </span>
              <span className="material-symbols-outlined text-ink-secondary text-[20px]">
                calendar_today
              </span>
            </div>
            <div>
              <div className="font-numeric-hero text-numeric-hero-mobile md:text-numeric-hero text-ink-primary">
                {metric.availableFocusHours}
                <span className="font-headline-md text-headline-md text-ink-muted ml-1">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-secondary">
                Open focus calendar windows
              </span>
            </div>
          </div>

          {/* Block 2: Remaining Work */}
          <div className="bg-surface p-space-md flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-ink-muted uppercase">
                Remaining Work
              </span>
              <span className="material-symbols-outlined text-accent-terracotta text-[20px]">
                timelapse
              </span>
            </div>
            <div>
              <div className="font-numeric-hero text-numeric-hero-mobile md:text-numeric-hero text-ink-primary">
                {metric.committedWorkHours}
                <span className="font-headline-md text-headline-md text-ink-muted ml-1">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-secondary">
                3 defined commitments remaining
              </span>
            </div>
          </div>

          {/* Block 3: Net Buffer */}
          <div className="bg-surface-cream p-space-md flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-ink-secondary uppercase font-semibold">
                Net Buffer
              </span>
              <span className="w-3 h-3 bg-accent-terracotta inline-block shrink-0" />
            </div>
            <div>
              <div className="font-headline-lg text-headline-lg text-ink-primary">
                +{metric.netBufferHours.toFixed(1)} hrs
              </div>
              <p className="font-body-md text-body-md text-ink-secondary mt-1">
                Moderate risk. Zero recovery reserve if Thursday slips.
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Progress Distribution Bar */}
        <div className="w-full bg-surface-variant h-3 relative overflow-hidden flex">
          <div
            className="bg-ink-primary h-full transition-all duration-500"
            style={{ width: '24.3%' }}
            title="Machine Learning: 4.5h"
          />
          <div
            className="bg-ink-secondary h-full border-l border-surface transition-all duration-500"
            style={{ width: '37.8%' }}
            title="FastAPI Microservice: 7h"
          />
          <div
            className="bg-outline h-full border-l border-surface transition-all duration-500"
            style={{ width: '16.2%' }}
            title="Design Research: 3h"
          />
          <div
            className="bg-surface-tint h-full border-l border-surface transition-all duration-500"
            style={{ width: '21.7%' }}
            title="Buffer Margin: 4h"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs text-ink-secondary font-label-md text-label-md">
          <div className="flex items-center gap-space-md flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-ink-primary inline-block shrink-0" /> ML Assignment (4.5h)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-ink-secondary inline-block shrink-0" /> FastAPI Service (7.0h)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-outline inline-block shrink-0" /> Design Research (3.0h)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-surface-tint inline-block shrink-0" /> Buffer Reservoir (4.0h)
            </span>
          </div>
          <span className="text-ink-muted">
            Scale 100% = {metric.availableFocusHours} Available Focus Hours
          </span>
        </div>
      </div>
    </section>
  );
};
