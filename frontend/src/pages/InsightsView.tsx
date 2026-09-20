import React, { useState } from 'react';
import { useInsightsSummary, useRecalibratePace, useWorkItems } from '../services/apiHooks';
import { WorkItem } from '../services/apiTypes';

export const InsightsView: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: insights } = useInsightsSummary();
  const { data: completedItems = [] } = useWorkItems({ status: 'COMPLETED' });
  const recalibrateMutation = useRecalibratePace();

  const isEarly = insights?.is_early_data ?? (insights?.observed_blocks_count ? insights.observed_blocks_count < 10 : true);
  const [activeTab, setActiveTab] = useState<'grounded' | 'early'>(isEarly ? 'early' : 'grounded');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleApplyMultiplier = async () => {
    try {
      await recalibrateMutation.mutateAsync();
      showToast('Pace factors recalibrated against verified focus history and updated in database.');
    } catch {
      showToast('Recalibration failed. Insufficient completed observations.');
    }
  };

  const observedCount = insights?.observed_blocks_count ?? completedItems.length;
  const variancePct = insights?.estimation_variance_pct ?? 0;
  const paceFactors = insights?.pace_factors || {};

  return (
    <div className="w-full bg-surface min-h-screen">
      {/* Observation Journal Header */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg md:pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-baseline">
          <div className="lg:col-span-8 flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-ink-muted font-label-md text-label-md tracking-wider uppercase">
              <span>Observation Journal</span>
              <span>·</span>
              <span>{isEarly ? 'Cold Start Calibration' : 'Empirical Rolling Cycle'}</span>
            </div>
            <h1 className="font-display-hero text-display-hero-mobile sm:text-display-hero text-ink-primary tracking-tight">
              Insights
            </h1>
            <p className="font-body-xl text-body-xl text-ink-secondary max-w-2xl mt-space-xs">
              {isEarly
                ? 'Observational baseline in training. Genuine cadence requires empirical focus logging.'
                : 'Empirical patterns from your verified work sessions, estimates, and completed deadlines.'}
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-end lg:items-end gap-space-xs pt-space-sm lg:pt-0">
            <div className="flex items-center gap-1 bg-surface-cream border border-border-hairline p-0.5 mb-1">
              <button
                type="button"
                onClick={() => setActiveTab('grounded')}
                className={`px-space-sm py-1 font-label-md text-label-md transition-colors ${
                  activeTab === 'grounded' ? 'bg-ink-primary text-canvas-paper' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Grounded ({observedCount} Blocks)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('early')}
                className={`px-space-sm py-1 font-label-md text-label-md transition-colors ${
                  activeTab === 'early' ? 'bg-ink-primary text-canvas-paper' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Calibration Status
              </button>
            </div>
            <span className="font-label-md text-label-md text-ink-muted">Synthesis Status</span>
            <div className="flex items-center gap-space-xs">
              <span className={`w-1.5 h-1.5 ${!isEarly ? 'bg-accent-terracotta' : 'bg-status-warning'}`} />
              <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                {!isEarly
                  ? `Grounded in ${observedCount} recorded blocks`
                  : `Calibrating: ${observedCount} / 10 minimum blocks`}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin">
        <div className="w-full h-px bg-border-hairline" />
      </div>

      {toastMessage && (
        <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin mt-space-sm">
          <div className="p-space-sm bg-surface-cream border border-ink-primary font-label-md text-label-md text-ink-primary">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Body Content: Grounded vs Calibration State */}
      {activeTab === 'early' ? (
        <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
          <div className="max-w-3xl flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-status-warning" />
                Empirical Observation Initializing · [SYSTEM CALIBRATION]
              </span>
              <h2 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight leading-tight">
                Authentic velocity intelligence requires observed human data.
              </h2>
              <p className="font-body-lg text-body-lg text-ink-secondary leading-relaxed">
                Deadline Radar refuses to manufacture artificial trends or pseudo-scientific scores. Personal estimation drift models unlock after verified focus blocks have been executed and logged.
              </p>
            </div>

            {/* Calibration Progress Card */}
            <div className="p-space-lg bg-surface-cream border border-border-hairline flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-ink-muted uppercase">Calibration Progress</span>
                <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                  {observedCount} / 10 Sessions ({Math.min(100, Math.round((observedCount / 10) * 100))}%)
                </span>
              </div>
              <div className="w-full h-2 bg-surface-tint overflow-hidden">
                <div
                  className="h-full bg-ink-primary transition-all duration-500"
                  style={{ width: `${Math.min(100, (observedCount / 10) * 100)}%` }}
                />
              </div>
              <span className="font-body-md text-body-md text-ink-secondary">
                {Math.max(0, 10 - observedCount)} more verified sessions needed before calculating high-confidence Pace Multipliers.
              </span>
            </div>

            {/* Action Card */}
            <div className="p-space-md bg-surface border border-border-hairline flex items-center justify-between">
              <div>
                <span className="font-headline-md text-headline-md text-ink-primary block">Recalibrate Pace Multipliers</span>
                <span className="font-body-md text-body-md text-ink-secondary">
                  Updates your database profile with current ratios from completed commitments.
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyMultiplier}
                disabled={recalibrateMutation.isPending}
                className="px-4 py-2 bg-ink-primary hover:bg-accent-terracotta text-canvas-paper font-label-md text-label-md uppercase font-semibold transition-colors disabled:opacity-50"
              >
                {recalibrateMutation.isPending ? 'Recalibrating...' : 'Recalibrate Now →'}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
            {/* Top KPI Stream */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <div className="bg-canvas-paper border border-border-hairline p-space-md">
                <span className="font-label-md text-label-md uppercase text-ink-muted block mb-1">
                  Observed Focus Blocks
                </span>
                <span className="font-numeric-hero text-headline-xl text-ink-primary font-bold">
                  {observedCount}
                </span>
                <span className="font-body-md text-body-md text-ink-secondary block mt-1">
                  Empirically logged sessions
                </span>
              </div>

              <div className="bg-canvas-paper border border-border-hairline p-space-md">
                <span className="font-label-md text-label-md uppercase text-ink-muted block mb-1">
                  Estimation Variance
                </span>
                <span className="font-numeric-hero text-headline-xl text-accent-terracotta font-bold">
                  {variancePct >= 0 ? `+${variancePct.toFixed(1)}%` : `${variancePct.toFixed(1)}%`}
                </span>
                <span className="font-body-md text-body-md text-ink-secondary block mt-1">
                  Actual vs planned completion time
                </span>
              </div>

              <div className="bg-canvas-paper border border-border-hairline p-space-md flex flex-col justify-between">
                <div>
                  <span className="font-label-md text-label-md uppercase text-ink-muted block mb-1">
                    Pace Recalibration
                  </span>
                  <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                    {Object.keys(paceFactors).length} Category Factors
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyMultiplier}
                  disabled={recalibrateMutation.isPending}
                  className="mt-space-sm w-full py-1.5 bg-ink-primary hover:bg-accent-terracotta text-canvas-paper font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors disabled:opacity-50"
                >
                  {recalibrateMutation.isPending ? 'Recalibrating...' : 'Apply Calibrated Multipliers'}
                </button>
              </div>
            </div>

            {/* Category Pace Factors */}
            {Object.keys(paceFactors).length > 0 && (
              <div className="bg-surface-cream p-space-md border border-border-hairline">
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted block mb-space-xs">
                  Category Drift Multipliers
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs">
                  {Object.entries(paceFactors).map(([cat, factor]) => (
                    <div key={cat} className="p-2 bg-canvas-paper border border-border-hairline">
                      <span className="font-label-md text-[11px] uppercase text-ink-muted block truncate">{cat}</span>
                      <span className="font-headline-md text-headline-md text-ink-primary font-bold">
                        {factor.toFixed(2)}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified History Table */}
            <div>
              <div className="flex items-baseline justify-between mb-space-xs">
                <h3 className="font-headline-lg text-headline-lg text-ink-primary">
                  Completed Deliverable Records
                </h3>
                <span className="font-label-md text-label-md text-ink-muted">
                  {completedItems.length} completed commitment{completedItems.length === 1 ? '' : 's'}
                </span>
              </div>

              {completedItems.length === 0 ? (
                <div className="py-space-xl text-center bg-canvas-paper border border-border-hairline p-space-md">
                  <p className="font-headline-md text-headline-md text-ink-primary">No completed deliverables yet</p>
                  <p className="font-body-md text-body-md text-ink-secondary mt-1">
                    Complete work items and log time to populate verified velocity metrics.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border-hairline border border-border-hairline bg-canvas-paper">
                  {completedItems.map((item: WorkItem) => {
                    const est = item.estimatedEffortHours ?? 0;
                    const act = item.actualLoggedHours ?? 0;
                    const diff = act - est;
                    const diffStr = diff >= 0 ? `+${diff.toFixed(1)}h` : `${diff.toFixed(1)}h`;

                    return (
                      <div key={item.id} className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-cream transition-colors">
                        <div>
                          <span className="font-headline-md text-headline-md text-ink-primary block">{item.title}</span>
                          <span className="font-label-md text-label-md text-ink-muted">
                            Category: {item.category} · Completed
                          </span>
                        </div>
                        <div className="flex items-center gap-space-lg text-right">
                          <div>
                            <span className="font-label-md text-[11px] text-ink-muted block uppercase">Planned</span>
                            <span className="font-label-lg text-label-lg font-mono text-ink-primary">{est.toFixed(1)}h</span>
                          </div>
                          <div>
                            <span className="font-label-md text-[11px] text-ink-muted block uppercase">Actual</span>
                            <span className="font-label-lg text-label-lg font-mono text-ink-primary">{act.toFixed(1)}h</span>
                          </div>
                          <div className="min-w-[70px]">
                            <span className="font-label-md text-[11px] text-ink-muted block uppercase">Variance</span>
                            <span className={`font-label-lg text-label-lg font-mono font-semibold ${diff > 0 ? 'text-accent-terracotta' : 'text-ink-primary'}`}>
                              {diffStr}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
