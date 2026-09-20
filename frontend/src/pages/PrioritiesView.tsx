import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SubNavigation } from '../components/layout/SubNavigation';
import { useWorkItems, useActiveSessionTracking } from '../services/apiHooks';
import { useAppStore } from '../store/useAppStore';
import { WorkItem } from '../services/apiTypes';

export const PrioritiesView: React.FC = () => {
  const navigate = useNavigate();
  const { data: workItems = [], isLoading } = useWorkItems();
  const { activeSession, startSession, stopSession } = useAppStore();
  const { startSession: startBackendSession, stopSession: stopBackendSession } = useActiveSessionTracking();

  const activeItems = useMemo(() => {
    return workItems
      .filter((w: WorkItem) => w.status !== 'COMPLETED')
      .sort((a: WorkItem, b: WorkItem) => {
        if (b.dynamicPriorityScore !== a.dynamicPriorityScore) {
          return b.dynamicPriorityScore - a.dynamicPriorityScore;
        }
        const da = a.deadlineUtc ? new Date(a.deadlineUtc).getTime() : Infinity;
        const db = b.deadlineUtc ? new Date(b.deadlineUtc).getTime() : Infinity;
        return da - db;
      });
  }, [workItems]);

  const topItem = activeItems[0];
  const queueItems = activeItems;

  const handleToggleFocus = async (item: WorkItem) => {
    if (activeSession?.workItemId === item.id) {
      stopSession();
      try {
        await stopBackendSession({ notes: 'Concluded from Priorities ledger' });
      } catch {
        // Ignored
      }
    } else {
      startSession(item.title, item.id);
      try {
        await startBackendSession({ work_item_id: item.id });
      } catch {
        // Ignored
      }
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      {/* Sub-Navigation Bar */}
      <SubNavigation
        items={[
          { label: 'Work Ledger', path: '/work', badge: `${workItems.length}` },
          { label: 'Priorities', path: '/priorities', badge: `${activeItems.length} Active`, indicator: true },
          ...(topItem ? [{ label: 'Top Priority', path: `/work/${topItem.id}` }] : []),
        ]}
        rightContent={
          <div className="flex items-center gap-space-sm text-ink-muted font-label-md text-label-md">
            <span>Dynamic Mathematical Rank</span>
            <span className="w-1.5 h-1.5 bg-ink-muted/40" />
            <span className="text-ink-secondary">Priority Engine</span>
          </div>
        }
      />

      {/* Main Editorial Surface */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-2xl flex flex-col">
        {/* Header Block */}
        <header className="w-full max-w-4xl mb-space-xl">
          <div className="flex items-center gap-2 mb-space-xs">
            <span className="font-label-md text-label-md uppercase tracking-widest text-accent-terracotta">
              Attention Ledger · Mathematical Rank
            </span>
            <span className="text-ink-muted">/</span>
            <span className="font-label-md text-label-md text-ink-secondary">Deterministic Sequence</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-ink-primary mb-space-xs tracking-tight">
            Priorities
          </h1>
          <p className="font-body-xl text-body-xl text-ink-secondary leading-relaxed max-w-3xl">
            Clear, sequential recommendations based on deadline proximity, remaining effort, and unblocking downstream commitments—grounded in real human capacity instead of arbitrary urgencies.
          </p>
        </header>

        {isLoading ? (
          <div className="py-space-2xl text-center font-label-md text-label-md text-ink-muted">
            Evaluating priority rankings...
          </div>
        ) : activeItems.length === 0 ? (
          <div className="bg-canvas-paper border border-border-hairline p-space-2xl text-center max-w-3xl mx-auto my-space-lg">
            <p className="font-headline-lg text-headline-lg text-ink-primary">All commitments resolved</p>
            <p className="font-body-md text-body-md text-ink-secondary mt-1">
              No active deliverables in your priority ledger. Commit new work to initialize sequential ranking.
            </p>
            <Link
              to="/work/new"
              className="inline-block mt-space-md bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-md py-space-xs font-label-md text-label-md uppercase font-semibold transition-colors"
            >
              Commit New Work →
            </Link>
          </div>
        ) : (
          <>
            {/* Primary Decision Hero */}
            {topItem && (
              <section className="w-full mb-space-2xl bg-surface-container-low p-space-md md:p-space-lg lg:p-space-xl border border-border-hairline">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
                  {/* Left: Reasoning & Directive Action (8 cols) */}
                  <div className="lg:col-span-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-space-sm mb-space-md">
                        <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 bg-accent-terracotta text-canvas-paper font-label-md text-label-md uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[14px]">bolt</span> Immediate Priority
                        </span>
                        <span className="font-label-lg text-label-lg text-ink-secondary">
                          {topItem.deadlineUtc
                            ? `Due ${new Date(topItem.deadlineUtc).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                            : 'Flexible target'}
                        </span>
                        <span className="text-ink-muted hidden sm:inline">·</span>
                        <span className="font-label-lg text-label-lg text-accent-terracotta font-semibold">
                          Risk: {topItem.riskLevel.replace('_', ' ')}
                        </span>
                      </div>
                      <h2 className="font-display-hero text-display-hero-mobile sm:text-display-hero text-ink-primary mb-space-md tracking-tight">
                        {topItem.title}
                      </h2>
                      <div className="bg-surface-cream/80 p-space-md mb-space-lg border border-border-hairline">
                        <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted block mb-1">
                          Operational Reasoning
                        </span>
                        <p className="font-body-lg text-body-lg text-ink-primary leading-relaxed">
                          {topItem.description || `Highest priority deliverable in ${topItem.category}. Requires ${(topItem.remainingEffortHours ?? topItem.estimatedEffortHours ?? 0).toFixed(1)} remaining hours before cutoff.`}
                        </p>
                      </div>
                    </div>

                    {/* Direct Action Area */}
                    <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleFocus(topItem)}
                        className={`inline-flex items-center gap-space-xs font-label-lg text-label-lg px-space-lg py-space-sm transition-colors duration-200 cursor-pointer ${
                          activeSession?.workItemId === topItem.id
                            ? 'bg-accent-terracotta text-canvas-paper'
                            : 'bg-ink-primary hover:bg-accent-terracotta text-canvas-paper'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {activeSession?.workItemId === topItem.id ? 'pause' : 'timelapse'}
                        </span>
                        <span>
                          {activeSession?.workItemId === topItem.id
                            ? `Focus Active: ${activeSession.title}`
                            : 'Start Focus Block Now'}
                        </span>
                        {!(activeSession?.workItemId === topItem.id) && <span>→</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/work/${topItem.id}`)}
                        className="font-label-lg text-label-lg text-ink-secondary hover:text-ink-primary transition-colors py-space-sm px-space-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>View commitment details</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Metrics Plate (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col justify-between bg-surface-cream p-space-md border border-border-hairline">
                    <div className="flex flex-col gap-3">
                      <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                        Telemetry Plate
                      </span>
                      <div className="flex items-baseline justify-between border-b border-border-hairline pb-2">
                        <span className="font-label-md text-label-md text-ink-muted">Estimated Effort</span>
                        <span className="font-headline-md text-headline-md text-ink-primary">
                          {(topItem.remainingEffortHours ?? topItem.estimatedEffortHours ?? 0).toFixed(1)}{' '}
                          <span className="font-body-md text-body-md text-ink-secondary">hrs</span>
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between border-b border-border-hairline pb-2">
                        <span className="font-label-md text-label-md text-ink-muted">Category</span>
                        <span className="font-label-lg text-label-lg text-ink-primary font-medium">
                          {topItem.category}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between border-b border-border-hairline pb-2">
                        <span className="font-label-md text-label-md text-ink-muted">Hard Deadline</span>
                        <span className="font-label-lg text-label-lg font-medium text-ink-primary">
                          {topItem.isHardDeadline ? 'Yes (Fixed Gate)' : 'No (Flexible)'}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-label-md text-label-md text-ink-muted">Priority Weight</span>
                        <span className="font-label-lg text-label-lg font-bold text-accent-terracotta">
                          {topItem.dynamicPriorityScore.toFixed(0)} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Ordered Priority Stack Header */}
            <div className="w-full flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs mb-space-md">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted block">The Queue</span>
                <h2 className="font-headline-lg text-headline-lg text-ink-primary">Ordered Priority Stack</h2>
              </div>
              <p className="font-body-md text-body-md text-ink-secondary max-w-md">
                Ranked by deterministic mathematics: proximity to cutoff, remaining effort, and risk ratios.
              </p>
            </div>

            {/* Editorial Open List */}
            <div className="w-full flex flex-col mb-space-2xl border-t border-border-hairline divide-y divide-border-hairline">
              {queueItems.map((item: WorkItem, idx: number) => {
                const seq = (idx + 1).toString().padStart(2, '0');
                const isCritical = item.riskLevel === 'CRITICAL' || item.riskLevel === 'OVERDUE';
                const deadlineFormatted = item.deadlineUtc
                  ? new Date(item.deadlineUtc).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Flexible timeframe';

                return (
                  <article
                    key={item.id}
                    className="group w-full py-space-md px-space-sm sm:px-space-md hover:bg-surface-cream transition-colors duration-200 bg-canvas-paper"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-3 md:gap-gutter items-center">
                      <div className="md:col-span-2 flex items-baseline md:flex-col gap-2 md:gap-0">
                        <span className={`font-numeric-hero text-headline-xl leading-none ${isCritical ? 'text-accent-terracotta' : 'text-ink-primary'}`}>
                          {seq}
                        </span>
                        <span className={`font-label-md text-label-md uppercase tracking-widest font-semibold ${isCritical ? 'text-accent-terracotta' : 'text-ink-secondary'}`}>
                          {item.riskLevel.replace('_', ' ')}
                        </span>
                        <span className="font-label-md text-label-md text-ink-muted truncate">
                          Due: {deadlineFormatted}
                        </span>
                      </div>

                      <div className="md:col-span-7 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/work/${item.id}`}
                            className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors"
                          >
                            {item.title}
                          </Link>
                          {isCritical && (
                            <span className="inline-block w-1.5 h-1.5 bg-accent-terracotta shrink-0" title="Critical Risk" />
                          )}
                        </div>
                        <p className="font-body-md text-body-md text-ink-secondary leading-normal">
                          {item.description || `Category: ${item.category}. Active commitment in priority ledger.`}
                        </p>
                        <div className="flex flex-wrap items-center gap-space-md text-ink-muted font-label-md text-label-md pt-1">
                          <span>Remaining: <strong className="text-ink-primary font-medium">{(item.remainingEffortHours ?? item.estimatedEffortHours ?? 0).toFixed(1)}h</strong></span>
                          <span>·</span>
                          <span>Category: {item.category}</span>
                          <span>·</span>
                          <span>Priority Score: {item.dynamicPriorityScore.toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                        <div className="text-right">
                          <span className={`font-label-md text-label-md block font-semibold ${isCritical ? 'text-accent-terracotta' : 'text-ink-primary'}`}>
                            {item.status}
                          </span>
                          <span className="font-label-md text-label-md text-ink-muted">
                            {item.isHardDeadline ? 'Hard Deadline' : 'Soft Target'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleFocus(item)}
                          className={`font-label-lg text-label-lg px-space-md py-1.5 transition-colors duration-150 cursor-pointer ${
                            activeSession?.workItemId === item.id
                              ? 'bg-accent-terracotta text-canvas-paper'
                              : 'bg-ink-primary hover:bg-accent-terracotta text-canvas-paper'
                          }`}
                        >
                          {activeSession?.workItemId === item.id ? 'Pause Focus' : 'Work on this →'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
