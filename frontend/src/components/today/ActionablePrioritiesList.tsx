import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export interface PriorityItem {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  dueText: string;
  dueUrgency: 'alert' | 'normal' | 'muted';
  remainingEffort: string;
  actionType: 'focus' | 'open' | 'done';
  workDetailId?: string;
}

import { WorkItem } from '../../services/apiTypes';

export interface PriorityItem {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  dueText: string;
  dueUrgency: 'alert' | 'normal' | 'muted';
  remainingEffort: string;
  actionType: 'focus' | 'open' | 'done';
  workDetailId?: string;
}

export interface ActionablePrioritiesListProps {
  items?: WorkItem[];
  onStartFocus: (title: string, workItemId?: string) => void;
}

const DEFAULT_PRIORITIES: PriorityItem[] = [
  {
    id: 'wi_ml_01',
    orderNumber: '01',
    title: 'Machine Learning Assignment: ResNet Retraining',
    description:
      'Model training complete; finalize hyperparameter ablation table and complete evaluation report.',
    dueText: 'Due Tomorrow 23:59',
    dueUrgency: 'alert',
    remainingEffort: '3h remaining',
    actionType: 'focus',
    workDetailId: 'wi_ml_01',
  },
  {
    id: 'wi_fastapi_02',
    orderNumber: '02',
    title: 'FastAPI Architecture Spec Drafting',
    description:
      'Review schema dependencies, draft endpoint contract, and document auth flow.',
    dueText: 'Due Thursday',
    dueUrgency: 'normal',
    remainingEffort: '1h 20m remaining',
    actionType: 'open',
    workDetailId: 'wi_fastapi_02',
  },
  {
    id: 'wi_linear_algebra_04',
    orderNumber: '03',
    title: 'Review Linear Algebra Lecture Notes',
    description:
      'Read recap on eigenvalue decomposition and solve exercise 4 before evening cutoff.',
    dueText: 'Due Tonight',
    dueUrgency: 'muted',
    remainingEffort: '45m remaining',
    actionType: 'done',
    workDetailId: 'wi_linear_algebra_04',
  },
];

export const ActionablePrioritiesList: React.FC<ActionablePrioritiesListProps> = ({
  items,
  onStartFocus,
}) => {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const activePriorities: PriorityItem[] =
    items && items.length > 0
      ? items
          .filter((w) => w.status?.toLowerCase() !== 'completed')
          .slice(0, 5)
          .map((item, idx) => ({
            id: item.id,
            orderNumber: String(idx + 1).padStart(2, '0'),
            title: item.title,
            description:
              item.description ||
              `Commitment ranked at dynamic priority ${item.dynamicPriorityScore?.toFixed(1) || '50'}.`,
            dueText: item.deadlineUtc
              ? `Due ${new Date(item.deadlineUtc).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}`
              : 'Open timeline',
            dueUrgency: (item.riskLevel === 'CRITICAL'
              ? 'alert'
              : item.riskLevel === 'WATCH'
              ? 'normal'
              : 'muted') as 'alert' | 'normal' | 'muted',
            remainingEffort: `${item.remainingEffortHours || 0}h remaining`,
            actionType: (idx === 0 ? 'focus' : 'open') as 'focus' | 'open' | 'done',
            workDetailId: item.id,
          }))
      : DEFAULT_PRIORITIES;

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section
      aria-labelledby="priorities-heading"
      className="w-full py-space-2xl px-margin-mobile md:px-margin-tablet lg:px-margin"
    >
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-lg text-label-lg uppercase tracking-wider text-accent-terracotta">
              Actionable Priorities
            </span>
            <h2
              id="priorities-heading"
              className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary"
            >
              What deserves your attention
            </h2>
          </div>
          <span className="font-body-md text-body-md text-ink-secondary">
            Ordered by deadline urgency and remaining workload
          </span>
        </div>

        {/* Editorial Open List */}
        <div className="flex flex-col w-full">
          {activePriorities.map((item) => {
            const isCompleted = completedIds.has(item.id);

            return (
              <React.Fragment key={item.id}>
                <div
                  className={`group py-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md hover:bg-surface-cream transition-colors duration-200 px-space-xs lg:px-space-md -mx-space-xs lg:-mx-space-md ${
                    isCompleted ? 'opacity-50' : ''
                  }`}
                >
                  {/* Left Column: Number and Timing */}
                  <div className="flex items-baseline gap-space-md lg:w-3/12">
                    <span
                      className={`font-numeric-hero text-numeric-hero-mobile md:text-numeric-hero leading-none select-none transition-opacity ${
                        item.orderNumber === '01'
                          ? 'text-ink-primary opacity-80 group-hover:opacity-100'
                          : item.orderNumber === '02'
                          ? 'text-ink-primary opacity-40 group-hover:opacity-100'
                          : 'text-ink-muted opacity-30 group-hover:opacity-60'
                      }`}
                      aria-hidden="true"
                    >
                      {item.orderNumber}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`font-label-lg text-label-lg uppercase tracking-wider ${
                          item.dueUrgency === 'alert'
                            ? 'text-status-alert font-medium'
                            : item.dueUrgency === 'normal'
                            ? 'text-ink-secondary'
                            : 'text-ink-muted'
                        }`}
                      >
                        {item.dueText}
                      </span>
                      <span
                        className={`font-body-md text-body-md ${
                          item.dueUrgency === 'muted' ? 'text-ink-muted' : 'text-ink-secondary'
                        }`}
                      >
                        {item.remainingEffort}
                      </span>
                    </div>
                  </div>

                  {/* Center Column: Title & Description */}
                  <div className="flex flex-col gap-space-xs lg:w-6/12">
                    <h3
                      className={`font-headline-md text-headline-md transition-colors ${
                        isCompleted
                          ? 'line-through text-ink-muted'
                          : item.dueUrgency === 'muted'
                          ? 'text-ink-secondary'
                          : 'text-ink-primary group-hover:text-accent-terracotta'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`font-body-md text-body-md max-w-2xl ${
                        item.dueUrgency === 'muted' || isCompleted ? 'text-ink-muted' : 'text-ink-secondary'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* Right Column: Contextual Action */}
                  <div className="flex items-center justify-start lg:justify-end gap-space-md lg:w-3/12">
                    {item.actionType === 'focus' && (
                      <button
                        type="button"
                        onClick={() => onStartFocus(item.title, item.workDetailId)}
                        className="bg-ink-primary group-hover:bg-accent-terracotta text-canvas-paper px-space-md py-space-xs font-label-lg text-label-lg flex items-center gap-space-xs transition-colors duration-150"
                      >
                        <span>Start Focus</span>
                        <span
                          className="material-symbols-outlined text-[16px]"
                          aria-hidden="true"
                        >
                          arrow_forward
                        </span>
                      </button>
                    )}

                    {item.actionType === 'open' && (
                      <Link
                        to={`/work/${item.workDetailId || item.id}`}
                        className="text-ink-primary hover:text-accent-terracotta font-label-lg text-label-lg flex items-center gap-space-xs underline underline-offset-4 decoration-border-hairline hover:decoration-accent-terracotta transition-all"
                      >
                        <span>Open</span>
                        <span
                          className="material-symbols-outlined text-[16px]"
                          aria-hidden="true"
                        >
                          arrow_forward
                        </span>
                      </Link>
                    )}

                    {item.actionType === 'done' && (
                      <button
                        type="button"
                        onClick={() => toggleComplete(item.id)}
                        className={`font-label-lg text-label-lg flex items-center gap-space-xs px-space-sm py-space-xs transition-colors ${
                          isCompleted
                            ? 'bg-ink-primary text-canvas-paper'
                            : 'text-ink-secondary hover:text-ink-primary bg-surface-cream'
                        }`}
                        aria-pressed={isCompleted}
                      >
                        <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                        <span
                          className="material-symbols-outlined text-[16px]"
                          aria-hidden="true"
                        >
                          check
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full h-px bg-border-hairline" />
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};
