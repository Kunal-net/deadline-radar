import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_WORK_ITEMS } from '../mocks/mockData';
import { Button } from '../components/ui/Button';

export const WorkDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const item = MOCK_WORK_ITEMS.find((w) => w.id === id) || MOCK_WORK_ITEMS[0];

  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-space-lg">
        <Link
          to="/work"
          className="font-label-md text-label-md text-ink-secondary hover:text-ink-primary flex items-center gap-1 w-fit"
        >
          ← Back to All Deliverables
        </Link>

        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 bg-accent-terracotta inline-block" />
            <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
              {item.category} • ID: {item.id}
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary">
            {item.title}
          </h1>
          <p className="font-body-lg text-body-lg text-ink-secondary max-w-2xl mt-1">
            {item.description}
          </p>
        </div>

        {/* Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md p-space-md bg-surface-container-low">
          <div>
            <span className="font-label-md text-label-md text-ink-muted uppercase">Estimated Effort</span>
            <div className="font-headline-md text-headline-md text-ink-primary mt-1">
              {item.estimatedEffortHours} hrs
            </div>
          </div>
          <div>
            <span className="font-label-md text-label-md text-ink-muted uppercase">Actual Logged</span>
            <div className="font-headline-md text-headline-md text-ink-primary mt-1">
              {item.actualLoggedHours} hrs
            </div>
          </div>
          <div>
            <span className="font-label-md text-label-md text-ink-muted uppercase">Current Risk</span>
            <div className="font-headline-md text-headline-md text-accent-terracotta mt-1">
              {item.riskLevel}
            </div>
          </div>
          <div>
            <span className="font-label-md text-label-md text-ink-muted uppercase">Priority Score</span>
            <div className="font-headline-md text-headline-md text-ink-primary mt-1">
              {item.dynamicPriorityScore} / 100
            </div>
          </div>
        </div>

        {/* Subtask Units Checklist */}
        {item.units && item.units.length > 0 && (
          <div className="flex flex-col gap-space-sm pt-space-md">
            <h2 className="font-headline-md text-headline-md text-ink-primary">
              Work Units &amp; Decomposition
            </h2>
            <div className="divide-y divide-border-hairline">
              {item.units.map((unit) => (
                <div key={unit.id} className="py-space-sm flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <span
                      className={`w-4 h-4 border flex items-center justify-center text-[10px] ${
                        unit.isCompleted
                          ? 'bg-ink-primary text-canvas-paper border-ink-primary'
                          : 'border-border-hairline'
                      }`}
                    >
                      {unit.isCompleted ? '✓' : ''}
                    </span>
                    <span
                      className={`font-body-md text-body-md ${
                        unit.isCompleted ? 'line-through text-ink-muted' : 'text-ink-primary'
                      }`}
                    >
                      {unit.title}
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-ink-secondary">
                    {unit.estimatedMinutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-space-md flex gap-space-sm">
          <Button variant="primary" size="md">
            Start Stopwatch Session
          </Button>
          <Button variant="outline" size="md">
            Edit Scope
          </Button>
        </div>
      </div>
    </div>
  );
};
