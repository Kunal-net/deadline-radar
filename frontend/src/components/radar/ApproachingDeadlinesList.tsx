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

interface ApproachingDeadlinesListProps {
  items?: DeadlineItem[];
  onStartFocus?: (title: string, id: string) => void;
}

export const ApproachingDeadlinesList: React.FC<ApproachingDeadlinesListProps> = ({
  items = [],
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
        {items.length === 0 ? (
          <div className="py-space-xl text-center border-t border-b border-border-hairline bg-surface-container-low/30 my-space-md">
            <p className="font-headline-md text-headline-md text-ink-primary">No upcoming commitments</p>
            <p className="font-body-md text-body-md text-ink-secondary mt-1 max-w-md mx-auto">
              Your radar horizon is currently clear. Add a commitment to track its trajectory and risk ratio.
            </p>
            <Link
              to="/work/new"
              className="inline-flex items-center gap-1.5 mt-space-md bg-ink-primary text-canvas-paper px-space-md py-space-xs font-label-md text-label-md uppercase font-semibold hover:bg-accent-terracotta transition-colors"
            >
              <span>Commit Work</span>
              <span>+</span>
            </Link>
          </div>
        ) : (
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
      )}
      </div>
    </section>
  );
};
