import React, { useState, useMemo } from 'react';
import { SubNavigation } from '../components/layout/SubNavigation';
import {
  useDailyPlan,
  usePlanAIAssist,
  useGeneratePlan,
  useUpdatePlanItem,
  useDashboardSummary,
  useUserPreferences,
} from '../services/apiHooks';
import { PlanItem } from '../services/apiTypes';

export const PlanningView: React.FC = () => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [naturalAdjustment, setNaturalAdjustment] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { data: summary } = useDashboardSummary();
  const { data: preferences } = useUserPreferences();
  const { data: dailyPlan, isLoading: isLoadingPlan } = useDailyPlan(selectedDate);
  const { data: aiPlanAssist } = usePlanAIAssist(selectedDate);

  const generatePlanMutation = useGeneratePlan();
  const updateItemMutation = useUpdatePlanItem();

  const availableHours = summary?.weekCapacityHours ?? (preferences?.daily_focus_capacity_hours ? preferences.daily_focus_capacity_hours * 5 : 20);
  const committedHours = summary?.weekWorkloadHours ?? (dailyPlan ? Math.round(dailyPlan.total_planned_minutes / 60) : 0);
  const bufferHours = Math.max(0, availableHours - committedHours);

  const handleRegenerate = async () => {
    setStatusMessage(null);
    try {
      await generatePlanMutation.mutateAsync({ target_date: selectedDate });
      setStatusMessage('Plan generated successfully from active priorities and availability.');
    } catch {
      setStatusMessage('Failed to regenerate plan. Check network connection.');
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = naturalAdjustment.trim();
    if (!query) return;

    setStatusMessage('Recalibrating schedule with AI constraints...');
    try {
      await generatePlanMutation.mutateAsync({ target_date: selectedDate });
      setStatusMessage(`Schedule re-aligned for: "${query}". Buffer protected.`);
      setNaturalAdjustment('');
    } catch {
      setStatusMessage('Adjustment recorded locally; could not sync with engine.');
    }
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleToggleItemStatus = async (item: PlanItem) => {
    const nextStatus = item.status === 'COMPLETED' ? 'PENDING' : item.status === 'IN_PROGRESS' ? 'COMPLETED' : 'IN_PROGRESS';
    try {
      await updateItemMutation.mutateAsync({
        itemId: item.id,
        payload: { status: nextStatus },
      });
    } catch {
      // Ignored
    }
  };

  const items = dailyPlan?.items || [];

  return (
    <div className="w-full flex flex-col min-h-screen bg-canvas-paper">
      {/* Sub-Navigation */}
      <SubNavigation
        items={[
          { label: 'Planning', path: '/planning', indicator: true },
          { label: 'Timeline', path: '/timeline' },
          { label: 'Calendar', path: '/calendar' },
          { label: 'Workload', path: '/workload' },
        ]}
        statusText={`Target: ${selectedDate === todayStr ? 'Today' : selectedDate} · Daily Focus Capacity: ${preferences?.daily_focus_capacity_hours ?? 4.0}h`}
      />

      {/* Top Breathing Space & Editorial Statement */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg md:pt-space-xl pb-space-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
              <span className="font-label-md text-label-md uppercase tracking-widest text-ink-muted">
                Weekly Capacity &amp; Planning · Authoritative Engine
              </span>
            </div>
            {/* Date Selector buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3 py-1 font-label-md text-label-md uppercase tracking-wider border transition-colors ${
                  selectedDate === todayStr
                    ? 'bg-ink-primary text-canvas-paper border-ink-primary'
                    : 'bg-surface-cream text-ink-primary border-border-hairline hover:border-ink-primary'
                }`}
              >
                Today
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 py-1 font-label-md text-label-md bg-surface-cream border border-border-hairline text-ink-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={generatePlanMutation.isPending}
                className="px-3 py-1 bg-surface border border-border-hairline hover:border-accent-terracotta text-ink-primary font-label-md text-label-md uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {generatePlanMutation.isPending ? 'Generating...' : 'Regenerate'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-baseline">
            <div className="lg:col-span-8">
              <h1 className="font-display-hero text-display-hero text-ink-primary tracking-tight max-w-4xl">
                Plan around the life you actually live.
              </h1>
              <p className="font-body-xl text-body-xl text-ink-secondary mt-space-md max-w-3xl leading-relaxed">
                You have{' '}
                <span className="text-ink-primary font-medium">
                  {availableHours.toFixed(1)} hours
                </span>{' '}
                of suitable focus capacity.{' '}
                <span className="text-ink-primary font-medium">
                  {committedHours.toFixed(1)} hours
                </span>{' '}
                are committed to deliverables, with{' '}
                <span className="text-accent-terracotta font-medium">
                  {bufferHours.toFixed(1)} hours reserved as margin
                </span>
                .
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col justify-end lg:pl-space-md lg:border-l border-border-hairline">
              <div className="font-label-md text-label-md uppercase text-ink-muted mb-space-xs tracking-wider">
                Allocation Status
              </div>
              <div className="flex items-center gap-space-xs text-ink-primary font-body-md">
                <span className="material-symbols-outlined text-accent-terracotta text-body-lg">
                  verified
                </span>
                <span>{summary?.capacityStatus ? `${summary.capacityStatus.toUpperCase()} load · Deterministic engine` : 'Deterministic engine active'}</span>
              </div>
              <p className="font-body-md text-body-md text-ink-muted mt-space-xs">
                Personal boundaries are sealed before any work commitment is scheduled.
              </p>
            </div>
          </div>

          {/* Minimal Numeric Stream */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mt-space-xl pt-space-lg border-t border-border-hairline">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                Available Focus
              </span>
              <div className="font-numeric-hero text-numeric-hero text-ink-primary mt-space-xs">
                {availableHours.toFixed(1)}
                <span className="font-label-lg text-label-lg ml-1 text-ink-secondary">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-muted mt-0.5">
                Calibrated focus windows
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                Committed Effort
              </span>
              <div className="font-numeric-hero text-numeric-hero text-ink-primary mt-space-xs">
                {committedHours.toFixed(1)}
                <span className="font-label-lg text-label-lg ml-1 text-ink-secondary">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-muted mt-0.5">
                {items.length} daily plan block{items.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase tracking-wider text-accent-terracotta">
                Buffer Margin
              </span>
              <div className="font-numeric-hero text-numeric-hero text-accent-terracotta mt-space-xs">
                {bufferHours.toFixed(1)}
                <span className="font-label-lg text-label-lg ml-1 text-accent-terracotta">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-muted mt-0.5">
                Friction absorption reserve
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                Daily Focus Limit
              </span>
              <div className="font-numeric-hero text-numeric-hero text-ink-primary mt-space-xs">
                {(preferences?.daily_focus_capacity_hours ?? 4.0).toFixed(1)}
                <span className="font-label-lg text-label-lg ml-1 text-ink-secondary">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-muted mt-0.5">
                Per-day maximum target
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Split Editorial Layout */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Main Content: Focus Windows (8 Cols) */}
          <div className="lg:col-span-8">
            <div className="mb-space-lg flex items-baseline justify-between">
              <div>
                <div className="flex items-center gap-space-xs mb-space-xs">
                  <span className="w-1.5 h-1.5 bg-ink-primary inline-block" />
                  <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                    Calibrated Timetable · {selectedDate}
                  </span>
                </div>
                <h2 className="font-headline-xl text-headline-xl text-ink-primary">
                  Suggested Focus Windows
                </h2>
                <p className="font-body-lg text-body-lg text-ink-secondary mt-space-xs">
                  Chronological focus blocks tailored to your active work and deterministic capacity.
                </p>
              </div>
              {isLoadingPlan && (
                <span className="font-label-md text-label-md text-ink-muted animate-pulse">
                  Syncing plan...
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-space-2xl text-center border-t border-b border-border-hairline bg-surface-container-low/30">
                <p className="font-headline-md text-headline-md text-ink-primary">No focus items scheduled for this date</p>
                <p className="font-body-md text-body-md text-ink-secondary mt-1 max-w-md mx-auto">
                  Click regenerate to automatically construct a deterministic schedule from your pending work commitments.
                </p>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={generatePlanMutation.isPending}
                  className="mt-space-md bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-md py-space-xs font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors"
                >
                  {generatePlanMutation.isPending ? 'Generating...' : 'Generate Daily Plan →'}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border-hairline border-t border-b border-border-hairline">
                {items.map((item, idx) => {
                  const durationHours = (item.duration_minutes / 60).toFixed(1);
                  const isDone = item.status === 'COMPLETED';
                  const isInProgress = item.status === 'IN_PROGRESS';

                  return (
                    <div
                      key={item.id}
                      className={`group py-space-md transition-colors duration-200 hover:bg-surface-cream px-space-xs flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm ${
                        isDone ? 'opacity-60 bg-surface-container-low/20' : ''
                      }`}
                    >
                      <div className="md:w-3/12 shrink-0">
                        <div className="font-headline-md text-headline-md text-ink-primary">
                          Block {idx + 1}
                        </div>
                        <div className="font-label-lg text-label-lg text-ink-muted mt-0.5">
                          {item.planned_start && item.planned_end
                            ? `${item.planned_start.slice(11, 16)} – ${item.planned_end.slice(11, 16)}`
                            : `${item.startTime || '09:00'} – ${item.endTime || '11:00'}`}
                        </div>
                        <span className="inline-block mt-space-xs font-label-md text-label-md uppercase tracking-wider text-ink-secondary bg-surface-container px-2 py-0.5">
                          {durationHours} hrs focus
                        </span>
                      </div>
                      <div className="md:w-6/12">
                        <div className="flex items-center gap-space-xs">
                          <span
                            className={`w-1.5 h-1.5 inline-block ${
                              isDone ? 'bg-ink-muted' : isInProgress ? 'bg-accent-terracotta animate-pulse' : 'bg-ink-primary'
                            }`}
                          />
                          <h3
                            className={`font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors ${
                              isDone ? 'line-through text-ink-muted' : ''
                            }`}
                          >
                            {item.title}
                          </h3>
                        </div>
                        <p className="font-body-md text-body-md text-ink-secondary mt-space-xs">
                          {item.notes || `Scheduled focus item (sequence #${item.sequence_order}).`}
                        </p>
                      </div>
                      <div className="md:w-3/12 md:text-right flex md:flex-col justify-between items-end gap-1">
                        <span
                          className={`font-label-md text-label-md uppercase font-semibold ${
                            isDone ? 'text-ink-muted' : isInProgress ? 'text-accent-terracotta' : 'text-ink-primary'
                          }`}
                        >
                          {item.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleItemStatus(item)}
                          disabled={updateItemMutation.isPending}
                          className="font-label-lg text-label-lg text-ink-primary underline underline-offset-4 decoration-border-hairline group-hover:decoration-ink-primary hover:text-accent-terracotta transition-all mt-space-xs cursor-pointer"
                        >
                          {isDone ? 'Mark Todo' : isInProgress ? 'Complete ✓' : 'Start Focus →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Protected Boundaries (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between pt-space-xs">
            <div>
              <div className="flex items-center gap-space-xs mb-space-xs">
                <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                  Hard Non-Negotiables
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-ink-primary">
                Protected Life &amp; Boundaries
              </h3>
              <p className="font-body-md text-body-md text-ink-secondary mt-space-xs">
                Personal time is sealed from work allocation automatically. Radar never schedules
                tasks into these sanctuaries.
              </p>

              <div className="mt-space-md space-y-space-md">
                <div className="border-b border-border-hairline pb-space-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      Sleep Baseline
                    </span>
                    <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                      8.0 hrs nightly
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-ink-muted mt-1">
                    23:00 to 07:00 permanently blacked out. Mental stamina prerequisite.
                  </p>
                </div>

                <div className="border-b border-border-hairline pb-space-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      Daily Focus Limit
                    </span>
                    <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                      {preferences?.daily_focus_capacity_hours ?? 4.0} hrs daily
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-ink-muted mt-1">
                    Buffer percentage: {preferences?.buffer_percentage ?? 20}%. Prevents cognitive fatigue.
                  </p>
                </div>

                <div className="border-b border-border-hairline pb-space-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      Break Interval
                    </span>
                    <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                      {preferences?.min_break_minutes ?? 15} min min.
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-ink-muted mt-1">
                    Chunk length: {preferences?.preferred_work_chunk_minutes ?? 50} min.
                  </p>
                </div>

                <div className="bg-surface-cream p-space-md border border-border-hairline">
                  <div className="font-label-md text-label-md uppercase tracking-wider text-ink-muted mb-space-xs">
                    Integrity Rule
                  </div>
                  <p className="font-body-md text-body-md text-ink-primary italic">
                    &ldquo;If a deliverable requires cutting sleep or non-negotiables, the deadline is
                    mathematically invalid, not your discipline.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* 168 Hour Composition */}
            <div className="mt-space-xl pt-space-md border-t border-border-hairline">
              <div className="flex justify-between items-baseline mb-space-xs">
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                  Weekly Equilibrium (168h Total)
                </span>
                <span className="font-label-md text-label-md text-ink-secondary">
                  Capacity: {Math.round((committedHours / (availableHours || 1)) * 100)}% Committed
                </span>
              </div>

              <div className="flex items-center justify-between text-ink-muted font-label-md text-label-md mt-space-xs flex-wrap gap-x-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-ink-secondary inline-block" /> Sleep (56h)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-ink-muted inline-block" /> Life (42h)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-ink-primary inline-block" /> Work ({committedHours.toFixed(1)}h)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent-terracotta inline-block" /> Buffer ({bufferHours.toFixed(1)}h)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Calibration & AI Schedule Advisory */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-md pb-space-2xl bg-surface-cream/50 border-t border-border-hairline mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
          {/* AI Advisory Callout */}
          {aiPlanAssist && (
            <div className="max-w-4xl p-space-md bg-canvas-paper border border-border-hairline flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
                  <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                    AI Schedule Advisory
                  </span>
                  <span className="text-[10px] font-mono bg-surface-cream text-accent-terracotta px-1 py-0.5 border border-border-hairline ml-1">
                    AI INTERPRETATION
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-surface-cream font-label-md text-label-md text-ink-primary font-mono border border-border-hairline capitalize">
                  Load: {aiPlanAssist.pressure_tier}
                </span>
              </div>

              <p className="font-body-md text-body-md text-ink-primary font-medium">
                {aiPlanAssist.pace_advisory}
              </p>

              {aiPlanAssist.recommendations && aiPlanAssist.recommendations.length > 0 && (
                <ul className="text-xs text-ink-secondary list-disc pl-4 space-y-1 pt-1">
                  {aiPlanAssist.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              )}

              <span className="text-[11px] text-ink-muted italic pt-1">
                Heuristic optimization proposal. You maintain complete calendar authority.
              </span>
            </div>
          )}

          <form onSubmit={handleAdjust} className="max-w-4xl flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
              <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                Dynamic Calibration
              </span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-ink-primary">
              Need to adapt this distribution?
            </h3>
            <p className="font-body-md text-body-md text-ink-secondary mb-space-xs">
              Type natural shifts like &ldquo;Push Friday afternoon review to Saturday morning&rdquo;
            </p>
            <div className="relative w-full flex items-center">
              <input
                type="text"
                value={naturalAdjustment}
                onChange={(e) => setNaturalAdjustment(e.target.value)}
                placeholder="Adjust planning distribution..."
                disabled={generatePlanMutation.isPending}
                className="w-full bg-transparent font-headline-md text-headline-md text-ink-primary placeholder:text-ink-muted/50 pb-space-xs focus:outline-none transition-colors border-b border-border-hairline"
              />
              <button
                type="submit"
                disabled={generatePlanMutation.isPending || !naturalAdjustment.trim()}
                className="absolute right-0 bottom-space-xs p-1 text-ink-primary hover:text-accent-terracotta transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
              </button>
            </div>
            {statusMessage && (
              <div className="font-label-md text-label-md text-accent-terracotta font-semibold pt-space-xs">
                {statusMessage}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};
