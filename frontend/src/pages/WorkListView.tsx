import React from 'react';
import { Link } from 'react-router-dom';
import { OpenListRow } from '../components/ui/OpenListRow';
import { Button } from '../components/ui/Button';
import { MOCK_WORK_ITEMS } from '../mocks/mockData';

export const WorkListView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
          <div>
            <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
              Work Workspace
            </span>
            <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary tracking-tight mt-1">
              Active Deliverables
            </h1>
          </div>
          <Link to="/work/new">
            <Button variant="primary" size="md">
              Add New Work
            </Button>
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-border-hairline">
          {MOCK_WORK_ITEMS.map((item) => (
            <OpenListRow
              key={item.id}
              leftContent={
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                    {item.category}
                  </span>
                  <span className="font-headline-md text-headline-md text-ink-primary mt-0.5">
                    {item.remainingEffortHours}h effort
                  </span>
                </div>
              }
              centerContent={
                <>
                  <Link
                    to={`/work/${item.id}`}
                    className="font-headline-md text-headline-md text-ink-primary hover:text-accent-terracotta transition-colors"
                  >
                    {item.title}
                  </Link>
                  <p className="font-body-md text-body-md text-ink-secondary">
                    {item.description}
                  </p>
                </>
              }
              rightContent={
                <Link to={`/work/${item.id}`}>
                  <Button variant="outline" size="sm" showArrow>
                    View Details
                  </Button>
                </Link>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};
