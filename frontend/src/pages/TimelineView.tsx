import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SubNavigation } from '../components/layout/SubNavigation';
import { useTimelineProjection, useDashboardSummary } from '../services/apiHooks';

export const TimelineView: React.FC = () => {
  const [horizonScope, setHorizonScope] = useState<'this-week' | '14-day' | '30-day'>('14-day');

  const daysCount = horizonScope === 'this-week' ? 7 : horizonScope === '14-day' ? 14 : 30;
  const { data: projection, isLoading } = useTimelineProjection(daysCount);
  const { data: summary } = useDashboardSummary();

  const items = projection?.items || [];
  const windowStart = projection?.timelineWindow?.startDate
    ? new Date(projection.timelineWindow.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Now';
  const windowEnd = projection?.timelineWindow?.endDate
    ? new Date(projection.timelineWindow.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Horizon';

  const totalCommitted = items.reduce((acc, item) => acc + (item.remainingEstimatedHours || 0), 0);
  const criticalCount = items.filter((item) => item.isProjectedLate || item.riskState === 'CRITICAL' || item.riskState === 'OVERDUE').length;

  return (
    <div className="w-full flex flex-col min-h-screen bg-surface">
      {/* Sub-Navigation Strip */}
      <SubNavigation
        items={[
          { label: 'Planning', path: '/planning' },
          { label: 'Timeline', path: '/timeline', indicator: true },
          { label: 'Calendar', path: '/calendar' },
          { label: 'Workload', path: '/workload' },
        ]}
        statusText={`${daysCount}-Day Temporal Horizon`}
        rightContent={
          <div className="flex items-center bg-surface-tint/20 p-0.5 border border-border-hairline">
            <button
              onClick={() => setHorizonScope('this-week')}
              className={`px-space-sm py-1 font-label-md text-label-md transition-colors ${
                horizonScope === 'this-week'
                  ? 'bg-canvas-paper text-ink-primary font-semibold border-b-2 border-ink-primary'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              7-Day
            </button>
            <button
              onClick={() => setHorizonScope('14-day')}
              className={`px-space-sm py-1 font-label-md text-label-md transition-colors ${
                horizonScope === '14-day'
                  ? 'bg-canvas-paper text-ink-primary font-semibold border-b-2 border-ink-primary'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              14-Day
            </button>
            <button
              onClick={() => setHorizonScope('30-day')}
              className={`px-space-sm py-1 font-label-md text-label-md transition-colors ${
                horizonScope === '30-day'
                  ? 'bg-canvas-paper text-ink-primary font-semibold border-b-2 border-ink-primary'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              30-Day
            </button>
          </div>
        }
      />

      {/* Header Section: Editorial Contrast & Scale */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-end">
          <div className="lg:col-span-8 flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-ink-muted">
              <span className="font-label-md text-label-md uppercase tracking-wider">
                Temporal Projection
              </span>
              <span className="text-border-hairline">•</span>
              <span className="font-label-md text-label-md">{windowStart} — {windowEnd}</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight">
              Timeline
            </h1>
            <p className="font-body-xl text-body-xl text-ink-secondary max-w-2xl mt-space-xs">
              A calm, temporal flow of commitments, focus blocks, and immovable deadlines across the
              next {daysCount} days.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col lg:items-end justify-end gap-space-xs">
            <div className="flex items-center gap-space-md">
              <div className="flex flex-col text-left lg:text-right">
                <span className="font-numeric-hero-mobile text-numeric-hero-mobile text-ink-primary leading-none font-medium">
                  {totalCommitted.toFixed(1)}h
                </span>
                <span className="font-label-md text-label-md text-ink-muted mt-1">
                  Committed Focus
                </span>
              </div>
              <div className="w-px h-10 bg-border-hairline" />
              <div className="flex flex-col text-left lg:text-right">
                <span className={`font-numeric-hero-mobile text-numeric-hero-mobile leading-none font-medium ${criticalCount > 0 ? 'text-accent-terracotta' : 'text-ink-primary'}`}>
                  {criticalCount}
                </span>
                <span className="font-label-md text-label-md text-ink-muted mt-1">
                  Critical / Overdue
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Temporal Flow Legend */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-md">
        <div className="bg-surface-cream p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-border-hairline">
          <div className="flex flex-wrap items-center gap-space-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent-terracotta shrink-0" />
              <span className="font-label-md text-label-md text-ink-primary">
                Critical / Overdue Gate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-ink-primary shrink-0" />
              <span className="font-label-md text-label-md text-ink-primary">
                Committed Focus Allocation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-surface-dim shrink-0" />
              <span className="font-label-md text-label-md text-ink-secondary">
                Protected Buffer Reserve
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md text-ink-muted">Capacity Status:</span>
            <span className="font-label-md text-label-md text-ink-primary font-medium uppercase">
              {summary?.capacityStatus || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Editorial Timeline Stream */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-2xl">
        <div className="flex flex-col">
          {isLoading && (
            <div className="py-space-xl text-center font-label-md text-label-md text-ink-muted">
              Projecting temporal capacity...
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="py-space-2xl text-center bg-canvas-paper border border-border-hairline p-space-lg">
              <p className="font-headline-md text-headline-md text-ink-primary">No commitments projected in this horizon</p>
              <p className="font-body-md text-body-md text-ink-secondary mt-1 max-w-md mx-auto">
                Add deliverables with deadlines to calculate sequential allocation gates and risk horizons.
              </p>
              <Link
                to="/work/new"
                className="inline-block mt-space-md bg-ink-primary text-canvas-paper px-space-md py-space-xs font-label-md text-label-md uppercase tracking-wider font-semibold hover:bg-accent-terracotta transition-colors"
              >
                Create Work Commitment →
              </Link>
            </div>
          )}

          {!isLoading && items.length > 0 && (
            <div className="divide-y divide-border-hairline border-t border-b border-border-hairline bg-canvas-paper">
              {items.map((item) => {
                const isCritical = item.isProjectedLate || item.riskState === 'CRITICAL' || item.riskState === 'OVERDUE';
                const deadlineFormatted = item.deadlineUtc
                  ? new Date(item.deadlineUtc).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Flexible horizon';

                return (
                  <div
                    key={item.workItemId}
                    className="p-space-md hover:bg-surface-cream transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between gap-space-md"
                  >
                    <div className="flex items-start md:items-center gap-space-md min-w-[240px]">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isCritical ? 'bg-accent-terracotta' : 'bg-ink-primary'}`} />
                      <div className="flex flex-col">
                        <Link
                          to={`/work/${item.workItemId}`}
                          className="font-headline-md text-headline-md text-ink-primary hover:text-accent-terracotta transition-colors"
                        >
                          {item.title}
                        </Link>
                        <span className="font-label-md text-label-md text-ink-muted">
                          Category: {item.category} · {item.remainingEstimatedHours.toFixed(1)}h remaining
                        </span>
                      </div>
                    </div>

                    {/* Middle: Slots summary */}
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      {item.allocatedSlots && item.allocatedSlots.length > 0 ? (
                        item.allocatedSlots.map((slot, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 bg-surface-container text-ink-primary font-label-md text-label-md rounded-none border border-border-hairline"
                          >
                            {slot.date.slice(5)}: {slot.hours.toFixed(1)}h
                          </span>
                        ))
                      ) : (
                        <span className="font-label-md text-label-md text-ink-muted italic">
                          Continuous allocation
                        </span>
                      )}
                    </div>

                    {/* Right: Deadline & Late Warning */}
                    <div className="flex flex-col md:items-end min-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        {isCritical && (
                          <span className="material-symbols-outlined text-accent-terracotta text-sm">
                            warning
                          </span>
                        )}
                        <span className={`font-label-md text-label-md font-semibold ${isCritical ? 'text-accent-terracotta' : 'text-ink-primary'}`}>
                          {item.riskState}
                        </span>
                      </div>
                      <span className="font-label-md text-label-md text-ink-muted mt-0.5">
                        Due: {deadlineFormatted}
                      </span>
                      {item.isProjectedLate && (
                        <span className="text-[11px] text-accent-terracotta font-medium">
                          Projected completion after deadline
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
