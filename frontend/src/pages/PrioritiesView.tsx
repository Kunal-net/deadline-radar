import React from 'react';
import { MOCK_WORK_ITEMS } from '../mocks/mockData';
import { OpenListRow } from '../components/ui/OpenListRow';
import { Button } from '../components/ui/Button';

export const PrioritiesView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-lg">
        <div>
          <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
            Deterministic Ranking
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary mt-1">
            Dynamic Priorities
          </h1>
          <p className="font-body-md text-body-md text-ink-secondary mt-1">
            Priorities mathematically computed from deadline proximity, remaining effort, and calendar capacity fit.
          </p>
        </div>

        <div className="flex flex-col divide-y divide-border-hairline">
          {MOCK_WORK_ITEMS.map((item, idx) => (
            <OpenListRow
              key={item.id}
              leftContent={
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-numeric-hero text-numeric-hero-mobile leading-none text-ink-primary">
                    {`#${idx + 1}`}
                  </span>
                  <span className="font-label-lg text-label-lg font-semibold text-accent-terracotta">
                    Score: {item.dynamicPriorityScore}
                  </span>
                </div>
              }
              centerContent={
                <>
                  <h3 className="font-headline-md text-headline-md text-ink-primary">
                    {item.title}
                  </h3>
                  <p className="font-body-md text-body-md text-ink-secondary">
                    {item.description}
                  </p>
                </>
              }
              rightContent={
                <Button variant="primary" size="sm">
                  Focus Now
                </Button>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};
