import React, { useState } from 'react';
import { SubNavigation } from '../components/layout/SubNavigation';
import { useWorkloadCapacity, useDashboardSummary, useGeneratePlan } from '../services/apiHooks';
import { WorkloadPeriod } from '../services/apiTypes';

export const WorkloadView: React.FC = () => {
  const [viewGranularity, setViewGranularity] = useState<'day' | 'week'>('day');
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: workload, isLoading: isLoadingWorkload, refetch: refetchWorkload } = useWorkloadCapacity(viewGranularity);
  const { data: summary, refetch: refetchSummary } = useDashboardSummary();
  const generatePlanMutation = useGeneratePlan();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSyncTelemetry = async () => {
    await Promise.all([refetchWorkload(), refetchSummary()]);
    showToast('Capacity diagnostics resynchronized with backend engine.');
  };

  const handleApplyRebalance = async () => {
    setIsRebalanceModalOpen(false);
    try {
      await generatePlanMutation.mutateAsync({ target_date: new Date().toISOString().split('T')[0] });
      await Promise.all([refetchWorkload(), refetchSummary()]);
      showToast('Heuristic rebalancing applied: daily allocations leveled across capacity.');
    } catch {
      showToast('Failed to apply rebalance. Engine could not optimize allocations.');
    }
  };

  const periods = workload?.periods || [];
  const totalDemand = periods.reduce((acc: number, p: WorkloadPeriod) => acc + (p.demandHours || 0), 0);
  const totalCapacity = periods.reduce((acc: number, p: WorkloadPeriod) => acc + (p.capacityHours || 0), 0);
  const utilizationPct = totalCapacity > 0 ? Math.round((totalDemand / totalCapacity) * 100) : 0;
  const bufferHours = Math.max(0, totalCapacity - totalDemand);
  const overloadedDays = periods.filter((p: WorkloadPeriod) => p.isOverloaded);

  return (
    <div className="w-full bg-surface min-h-screen">
      {/* Sub-Navigation */}
      <SubNavigation
        items={[
          { label: 'Planning', path: '/planning' },
          { label: 'Timeline', path: '/timeline' },
          { label: 'Calendar', path: '/calendar' },
          { label: 'Workload', path: '/workload', indicator: true },
        ]}
        statusText={`Equilibrium Diagnostics · Status: ${(summary?.capacityStatus || 'balanced').toUpperCase()}`}
      />

      {/* Main Hero Editorial Statement */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-md">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-widest text-ink-muted block mb-space-xs">
              Capacity Diagnostics · Mathematical Equilibrium
            </span>
            <h1 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight">
              Workload &amp; Capacity Equilibrium
            </h1>
            <p className="font-body-md text-body-md text-ink-secondary mt-1 max-w-2xl">
              An empirical balance sheet comparing scheduled deliverables against calendar capacity limits and non-negotiable reserves.
            </p>
          </div>
          <div className="flex items-center gap-space-sm mt-space-sm md:mt-0">
            <button
              type="button"
              onClick={() => setIsRebalanceModalOpen(true)}
              className="bg-surface-cream hover:bg-surface-tint text-ink-primary font-label-lg text-label-lg px-space-md py-space-xs rounded-none transition-colors duration-150 flex items-center gap-space-xs cursor-pointer border border-border-hairline"
            >
              <span className="material-symbols-outlined text-[18px]">balance</span>
              <span>Rebalance Horizon</span>
            </button>
            <button
              type="button"
              onClick={handleSyncTelemetry}
              className="bg-ink-primary hover:bg-accent-terracotta text-canvas-paper font-label-lg text-label-lg px-space-md py-space-xs rounded-none transition-colors duration-150 flex items-center gap-space-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin mb-space-sm">
          <div className="p-space-sm bg-surface-cream border border-ink-primary font-label-md text-label-md text-ink-primary">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Section 1: Macroscopic Balance */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Main Workload Card (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="bg-surface-cream p-space-lg rounded-none border border-border-hairline">
              <div className="flex items-center justify-between pb-space-sm border-b border-border-hairline">
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-secondary">
                  Macro Summary
                </span>
                <span className={`px-2 py-0.5 font-label-md text-[11px] rounded-none ${utilizationPct > 100 ? 'bg-accent-terracotta text-canvas-paper' : 'bg-ink-primary text-canvas-paper'}`}>
                  {utilizationPct > 100 ? 'Deficit Warning' : 'Stable Load'}
                </span>
              </div>

              <div className="mt-space-md flex flex-col gap-space-xs">
                <div className="flex items-baseline justify-between">
                  <span className="font-headline-lg text-headline-lg text-ink-primary">
                    {totalDemand.toFixed(1)} hrs Total Demand
                  </span>
                  <span className="font-label-md text-label-md text-ink-muted">
                    of {totalCapacity.toFixed(1)}h capacity baseline
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-md text-ink-secondary pt-1">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 bg-ink-primary inline-block rounded-none" />
                    <span>Focus Booked: <strong>{utilizationPct}%</strong> ({totalDemand.toFixed(1)}h)</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 bg-surface-tint inline-block rounded-none" />
                    <span>Buffer Margin: <strong>{Math.max(0, 100 - utilizationPct)}%</strong> ({bufferHours.toFixed(1)}h)</span>
                  </div>
                </div>

                {/* Custom Segmented Gauge Bar */}
                <div className="w-full h-4 bg-surface-tint rounded-none flex overflow-hidden mt-1">
                  <div
                    className={`h-full ${utilizationPct > 100 ? 'bg-accent-terracotta' : 'bg-ink-primary'} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min(100, utilizationPct)}%` }}
                  />
                  {utilizationPct < 100 && (
                    <div
                      className="h-full bg-surface-tint transition-all duration-500 ease-out flex items-center justify-end pr-2"
                      style={{ width: `${100 - utilizationPct}%` }}
                    >
                      <span className="inline-block w-1.5 h-1.5 bg-accent-terracotta shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Distribution Rows */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-ink-primary">
                  Granular Distribution
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewGranularity('day')}
                    className={`px-2 py-0.5 font-label-md text-label-md border ${viewGranularity === 'day' ? 'bg-ink-primary text-canvas-paper' : 'bg-canvas-paper text-ink-secondary'}`}
                  >
                    Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewGranularity('week')}
                    className={`px-2 py-0.5 font-label-md text-label-md border ${viewGranularity === 'week' ? 'bg-ink-primary text-canvas-paper' : 'bg-canvas-paper text-ink-secondary'}`}
                  >
                    Week
                  </button>
                </div>
              </div>

              {isLoadingWorkload ? (
                <div className="py-space-md text-center text-ink-muted font-label-md text-label-md">
                  Analyzing capacity distribution...
                </div>
              ) : periods.length === 0 ? (
                <div className="py-space-md text-center text-ink-muted bg-canvas-paper border border-border-hairline p-space-md">
                  No workload allocations recorded for this window.
                </div>
              ) : (
                <div className="divide-y divide-border-hairline bg-canvas-paper border border-border-hairline">
                  {periods.map((p: WorkloadPeriod, idx: number) => {
                    const isOver = p.isOverloaded || p.demandHours > p.capacityHours;
                    const freeHours = Math.max(0, p.capacityHours - p.demandHours);

                    return (
                      <div key={idx} className="p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                        <div className="flex items-center gap-space-md min-w-[160px]">
                          <span className={`w-2 h-2 rounded-full ${isOver ? 'bg-accent-terracotta' : 'bg-ink-primary'}`} />
                          <div className="flex flex-col">
                            <span className="font-headline-md text-headline-md text-ink-primary">
                              {p.dayOfWeek || p.dateLabel}
                            </span>
                            <span className="font-label-md text-label-md text-ink-muted">
                              {p.dateLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <div className="flex items-baseline justify-between text-body-md text-ink-primary mb-1">
                            <span>Demand: <strong>{p.demandHours.toFixed(1)}h</strong> / Capacity: {p.capacityHours.toFixed(1)}h</span>
                            <span className={`font-semibold ${isOver ? 'text-accent-terracotta' : 'text-ink-secondary'}`}>
                              {p.utilizationPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-surface-container overflow-hidden">
                            <div
                              className={`h-full ${isOver ? 'bg-accent-terracotta' : 'bg-ink-primary'}`}
                              style={{ width: `${Math.min(100, p.utilizationPercentage)}%` }}
                            />
                          </div>
                        </div>

                        <div className="min-w-[120px] text-left md:text-right">
                          <span className={`font-label-md text-label-md font-medium ${isOver ? 'text-accent-terracotta' : 'text-ink-muted'}`}>
                            {isOver ? `Overload (+${(p.demandHours - p.capacityHours).toFixed(1)}h)` : `${freeHours.toFixed(1)}h free`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Diagnostic Warnings & Rules (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-canvas-paper p-space-md border border-border-hairline">
              <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted block mb-space-xs">
                Diagnostic Health
              </span>
              <h3 className="font-headline-lg text-headline-lg text-ink-primary mb-space-xs">
                {overloadedDays.length === 0 ? 'Zero Horizon Overlaps' : `${overloadedDays.length} Allocation Pinch Points`}
              </h3>
              <p className="font-body-md text-body-md text-ink-secondary">
                {overloadedDays.length === 0
                  ? 'All commitments fit within your declared focus templates without encroaching into sleep or non-work sanctuaries.'
                  : 'Specific days exceed maximum focus thresholds. Rebalance to maintain physiological pace without slip.'}
              </p>
            </div>

            <div className="bg-surface-cream p-space-md border border-border-hairline">
              <span className="font-label-md text-label-md uppercase tracking-wider text-accent-terracotta block mb-space-xs">
                Equilibrium Principle
              </span>
              <p className="font-body-md text-body-md text-ink-primary italic">
                &ldquo;Capacity is not infinite just because a deadline is critical. Work paced beyond 100% capacity produces exponential error rates and compounding delays.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rebalance Modal */}
      {isRebalanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-primary/40 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-canvas-paper border border-border-hairline max-w-lg w-full p-space-lg shadow-xl">
            <div className="flex items-center justify-between pb-space-xs border-b border-border-hairline mb-space-md">
              <h3 className="font-headline-lg text-headline-lg text-ink-primary">
                Rebalance Horizon
              </h3>
              <button
                type="button"
                onClick={() => setIsRebalanceModalOpen(false)}
                className="text-ink-muted hover:text-ink-primary text-xl"
              >
                ×
              </button>
            </div>
            <p className="font-body-md text-body-md text-ink-secondary mb-space-md">
              The planning engine will redistribute pending work items across your available calendar capacity to eliminate overload spikes and protect minimum buffer margins.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRebalanceModalOpen(false)}
                className="px-4 py-2 font-label-md text-label-md text-ink-secondary hover:text-ink-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyRebalance}
                disabled={generatePlanMutation.isPending}
                className="px-4 py-2 bg-ink-primary hover:bg-accent-terracotta text-canvas-paper font-label-md text-label-md font-semibold transition-colors disabled:opacity-50"
              >
                {generatePlanMutation.isPending ? 'Optimizing...' : 'Apply Rebalance →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
