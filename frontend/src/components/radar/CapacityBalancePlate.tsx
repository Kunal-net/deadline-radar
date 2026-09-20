import React from 'react';
import { CapacityMetric, WorkItem } from '../../services/apiTypes';

interface CapacityBalancePlateProps {
  metric: CapacityMetric;
  items?: WorkItem[];
}

export const CapacityBalancePlate: React.FC<CapacityBalancePlateProps> = ({ metric, items = [] }) => {
  const commitmentsCount = items.length;
  const totalCapacity = metric.availableFocusHours > 0 ? metric.availableFocusHours : 1;
  const activeItems = items.slice(0, 4);
  const bufferPercent = Math.max(0, Math.min(100, (metric.netBufferHours / totalCapacity) * 100));

  const palette = ['bg-ink-primary', 'bg-ink-secondary', 'bg-outline', 'bg-accent-terracotta'];

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
                {metric.availableFocusHours.toFixed(1)}
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
                {metric.committedWorkHours.toFixed(1)}
                <span className="font-headline-md text-headline-md text-ink-muted ml-1">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-secondary">
                {commitmentsCount} defined commitment{commitmentsCount === 1 ? '' : 's'} remaining
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
                {metric.netBufferHours >= 0 ? `+${metric.netBufferHours.toFixed(1)}` : metric.netBufferHours.toFixed(1)} hrs
              </div>
              <p className="font-body-md text-body-md text-ink-secondary mt-1">
                {metric.riskAssessment || (metric.netBufferHours >= 0 ? 'Comfortable buffer margin.' : 'Capacity deficit detected.')}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Distribution Bar */}
        <div className="w-full bg-surface-variant h-3 relative overflow-hidden flex">
          {activeItems.map((item, idx) => {
            const hours = item.remainingEffortHours ?? item.estimatedEffortHours ?? 0;
            const pct = Math.min(100, (hours / totalCapacity) * 100);
            return (
              <div
                key={item.id}
                className={`${palette[idx % palette.length]} h-full transition-all duration-500 border-l border-surface first:border-l-0`}
                style={{ width: `${pct}%` }}
                title={`${item.title}: ${hours.toFixed(1)}h`}
              />
            );
          })}
          {bufferPercent > 0 && (
            <div
              className="bg-surface-tint h-full border-l border-surface transition-all duration-500"
              style={{ width: `${bufferPercent}%` }}
              title={`Buffer Reservoir: ${metric.netBufferHours.toFixed(1)}h`}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs text-ink-secondary font-label-md text-label-md">
          <div className="flex items-center gap-space-md flex-wrap">
            {activeItems.map((item, idx) => {
              const hours = (item.remainingEffortHours ?? item.estimatedEffortHours ?? 0).toFixed(1);
              return (
                <span key={item.id} className="inline-flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 ${palette[idx % palette.length]} inline-block shrink-0`} />
                  {item.title} ({hours}h)
                </span>
              );
            })}
            {bufferPercent > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-surface-tint inline-block shrink-0" /> Buffer Reservoir ({metric.netBufferHours.toFixed(1)}h)
              </span>
            )}
            {activeItems.length === 0 && (
              <span className="text-ink-muted">No active commitments to project.</span>
            )}
          </div>
          <span className="text-ink-muted">
            Scale 100% = {metric.availableFocusHours.toFixed(1)} Available Focus Hours
          </span>
        </div>
      </div>
    </section>
  );
};
