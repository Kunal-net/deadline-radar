import React from 'react';
import { Link } from 'react-router-dom';

export interface DeadlineItem {
  id: string;
  dueLabel: string;
  dueFormatted: string;
  dotColor: string;
  title: string;
  description: string;
  riskBadge: string;
  riskBadgeColor: string;
  riskExplanation: string;
  remainingHours: string;
  againstLabel: string;
  actionLabel: string;
  actionPrimary?: boolean;
  linkTo: string;
}

const DEFAULT_DEADLINES: DeadlineItem[] = [
  {
    id: 'wi_ml_01',
    dueLabel: 'Due in 2 days',
    dueFormatted: 'Thursday, 23:59',
    dotColor: 'bg-accent-terracotta',
    title: 'Machine Learning Assignment',
    description: 'ResNet Retraining, validation loss analysis, LaTeX write-up.',
    riskBadge: 'Risk: High',
    riskBadgeColor: 'text-accent-terracotta',
    riskExplanation: 'Start before 15:00. Model epoch compute requires 3.5h.',
    remainingHours: '4.5 hrs',
    againstLabel: 'Against 7h available today',
    actionLabel: 'Start Focus',
    actionPrimary: true,
    linkTo: '/work/wi_ml_01',
  },
  {
    id: 'wi_fastapi_02',
    dueLabel: 'Due in 4 days',
    dueFormatted: 'Saturday, 17:00',
    dotColor: 'bg-ink-primary',
    title: 'FastAPI Architecture & Bus',
    description: 'Asynchronous consumer logic, Docker orchestration spec, integration endpoints.',
    riskBadge: 'Risk: Normal',
    riskBadgeColor: 'text-ink-primary',
    riskExplanation: '3.5h block tomorrow morning fits within allocation.',
    remainingHours: '7.0 hrs',
    againstLabel: 'Against 8.5h available Thu/Fri',
    actionLabel: 'View Spec',
    actionPrimary: false,
    linkTo: '/work/wi_fastapi_02',
  },
  {
    id: 'wi_research_03',
    dueLabel: 'Due in 6 days',
    dueFormatted: 'Monday, 09:00',
    dotColor: 'bg-ink-muted',
    title: 'Design Research Report',
    description: 'Participant interview synthesis, taxonomy codification, and executive summary.',
    riskBadge: 'Risk: Low',
    riskBadgeColor: 'text-ink-muted',
    riskExplanation: 'Safe weekend buffer allows calm execution on Sunday.',
    remainingHours: '3.0 hrs',
    againstLabel: 'Against Sunday block',
    actionLabel: 'View Notes',
    actionPrimary: false,
    linkTo: '/work/wi_research_03',
  },
];

interface ApproachingDeadlinesListProps {
  items?: DeadlineItem[];
  onStartFocus?: (title: string, id: string) => void;
}

export const ApproachingDeadlinesList: React.FC<ApproachingDeadlinesListProps> = ({
  items = DEFAULT_DEADLINES,
  onStartFocus,
}) => {
  return (
    <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-space-md">
          <div>
            <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
              Upcoming Deliverables
            </span>
            <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary tracking-tight mt-1">
              Approaching Deadlines
            </h2>
          </div>
          <span className="font-body-md text-body-md text-ink-muted mt-2 md:mt-0">
            Chronological order • Hours remaining &amp; risk level
          </span>
        </div>

        {/* OPEN EDITORIAL ROWS */}
        <div className="flex flex-col divide-y divide-border-hairline">
          {items.map((item) => (
            <div
              key={item.id}
              className="group py-space-md transition-colors duration-200 hover:bg-surface-cream px-space-xs -mx-space-xs"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-sm items-baseline">
                {/* Due Date Column */}
                <div className="lg:col-span-3 flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className={`w-2 h-2 rounded-full ${item.dotColor} inline-block shrink-0`} />
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      {item.dueLabel}
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-ink-secondary mt-0.5">
                    {item.dueFormatted}
                  </span>
                </div>

                {/* Work Details Column */}
                <div className="lg:col-span-5 pr-space-sm">
                  <Link to={item.linkTo}>
                    <h3 className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="font-body-md text-body-md text-ink-secondary mt-1">
                    {item.description}
                  </p>
                  <div className="mt-space-xs p-space-xs bg-surface-container-high/60 inline-flex items-center gap-2 text-ink-primary">
                    <span className={`font-label-md text-label-md font-semibold ${item.riskBadgeColor}`}>
                      {item.riskBadge}
                    </span>
                    <span className="font-body-md text-body-md">
                      {item.riskExplanation}
                    </span>
                  </div>
                </div>

                {/* Work Remaining Column */}
                <div className="lg:col-span-2 flex flex-col">
                  <span className="font-label-md text-label-md text-ink-muted uppercase">
                    Work Remaining
                  </span>
                  <span className="font-headline-md text-headline-md text-ink-primary mt-0.5">
                    {item.remainingHours}
                  </span>
                  <span className="font-label-md text-label-md text-ink-secondary">
                    {item.againstLabel}
                  </span>
                </div>

                {/* Action Column */}
                <div className="lg:col-span-2 flex lg:justify-end items-center mt-space-xs lg:mt-0">
                  {item.actionPrimary ? (
                    <button
                      type="button"
                      onClick={() => onStartFocus?.(item.title, item.id)}
                      className="inline-flex items-center gap-1 bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-md py-space-xs font-label-lg text-label-lg transition-colors duration-200"
                    >
                      <span>{item.actionLabel}</span>
                      <span>→</span>
                    </button>
                  ) : (
                    <Link
                      to={item.linkTo}
                      className="inline-flex items-center gap-1 font-label-lg text-label-lg text-ink-primary hover:text-accent-terracotta font-semibold"
                    >
                      <span>{item.actionLabel}</span>
                      <span>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
