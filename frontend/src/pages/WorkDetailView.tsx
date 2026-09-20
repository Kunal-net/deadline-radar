import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SubNavigation } from '../components/layout/SubNavigation';
import { Button } from '../components/ui/Button';
import { MOCK_WORK_ITEMS } from '../mocks/mockData';
import { useAppStore } from '../store/useAppStore';

export const WorkDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { startSession } = useAppStore();

  const item =
    MOCK_WORK_ITEMS.find((w) => w.id === id) ||
    MOCK_WORK_ITEMS[0]; // fallback to first item

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actualHours, setActualHours] = useState(item.actualLoggedHours || 3.0);
  const [remainingHours, setRemainingHours] = useState(item.remainingEffortHours || 3.0);

  const [executionBlocks, setExecutionBlocks] = useState([
    {
      id: 'b1',
      title: 'Data pipeline & test split verification',
      subtitle: 'Verified no data leakage across 15,000 holdout splits.',
      timeSpent: '1.5h spent',
      status: 'Concluded Wed',
      completed: true,
    },
    {
      id: 'b2',
      title: 'Model checkpoints & hyperparameter runs',
      subtitle: 'Completed 6 training runs with cosine annealing schedules.',
      timeSpent: '1.5h spent',
      status: 'Concluded Thu 10:30',
      completed: true,
    },
    {
      id: 'b3',
      title: 'Synthesize confusion matrix & write analysis',
      subtitle: 'Run classification summaries and construct class divergence tables.',
      timeSpent: '2.0h left',
      status: 'Scheduled: Today 14:00 – 16:00',
      completed: false,
    },
    {
      id: 'b4',
      title: 'Final report compilation & upload',
      subtitle: 'Assemble PDF via Overleaf, audit bib references, and commit submission tarball.',
      timeSpent: '1.0h left',
      status: 'Scheduled: Tomorrow 10:00 – 11:00',
      completed: false,
    },
  ]);

  const toggleBlock = (blockId: string) => {
    setExecutionBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, completed: !b.completed } : b))
    );
  };

  const handleLogTime = (incrementHours: number, label: string) => {
    setActualHours((prev) => +(prev + incrementHours).toFixed(1));
    setRemainingHours((prev) => +(Math.max(0, prev - incrementHours)).toFixed(1));
    setToastMessage(`Recorded +${label} to active session. Execution plan recalculating.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-surface">
      {/* Sub-Navigation Bar */}
      <SubNavigation
        items={[
          { label: 'Work Ledger', path: '/work' },
          { label: 'Priorities', path: '/priorities' },
          { label: 'Work Detail', path: `/work/${item.id}`, indicator: true },
        ]}
        statusText="Active Dossier · Section 04"
      />

      {/* Minimal Context / Breadcrumbs Bar */}
      <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-sm">
        <div className="max-w-6xl flex items-center gap-space-xs font-label-md text-label-md text-ink-muted">
          <Link to="/work" className="hover:text-ink-primary transition-colors duration-150">
            Work
          </Link>
          <span>/</span>
          <span className="text-ink-secondary">{item.category}</span>
          <span>/</span>
          <span className="text-ink-primary font-medium">{item.title}</span>
        </div>
      </section>

      {/* Editorial Document Header & Primary Status Strip */}
      <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-lg">
        <div className="max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-md">
            <h1 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight max-w-3xl">
              {item.title}: Model Evaluation
            </h1>
            <div className="flex items-center gap-space-xs shrink-0">
              <span
                className={`w-1.5 h-1.5 ${
                  item.riskLevel === 'CRITICAL' ? 'bg-status-alert' : 'bg-ink-primary'
                }`}
              />
              <span className="font-label-lg text-label-lg text-ink-primary">
                {item.riskLevel === 'CRITICAL' ? 'Critical Horizon' : 'On Track · Low Risk'}
              </span>
            </div>
          </div>

          {/* Human Capacity & State Strip */}
          <div className="mt-space-lg bg-surface-cream px-space-md py-space-md grid grid-cols-2 md:grid-cols-4 gap-space-md border border-border-hairline">
            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                Deadline
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-ink-primary">
                  {new Date(item.deadlineUtc).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="font-body-md text-body-md text-ink-secondary">17:00</span>
              </div>
              <span className="font-label-md text-label-md text-accent-terracotta font-medium">
                {item.isHardDeadline ? 'Hard Deadline · In 28h' : 'Target Target'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                Remaining Effort
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-ink-primary">
                  {remainingHours}
                </span>
                <span className="font-body-md text-body-md text-ink-secondary">hrs</span>
              </div>
              <span className="font-label-md text-label-md text-ink-secondary">
                Predicted total {(actualHours + remainingHours).toFixed(1)} hrs
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                Actual Spent
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-ink-primary">
                  {actualHours}
                </span>
                <span className="font-body-md text-body-md text-ink-secondary">hrs</span>
              </div>
              <span className="font-label-md text-label-md text-ink-secondary">
                {Math.round((actualHours / (actualHours + remainingHours || 1)) * 100)}% completed
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                Pace &amp; Buffer
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-ink-primary">+45</span>
                <span className="font-body-md text-body-md text-ink-secondary">min</span>
              </div>
              <span className="font-label-md text-label-md text-ink-secondary">
                Buffer before cutoff
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Editorial Split Layout */}
      <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-2xl">
        <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            {/* Section 1: Work Description & Scope */}
            <article className="flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                Document Scope
              </span>
              <h2 className="font-headline-lg text-headline-lg text-ink-primary">
                Validation Confusion Matrix &amp; Loss Curvature
              </h2>
              <div className="font-body-lg text-body-lg text-ink-secondary flex flex-col gap-space-sm pt-space-xs">
                <p>
                  Produce a comprehensive comparative evaluation across the ResNet-34 baseline and
                  custom transformer vision checkpoints. Primary deliverables require computing
                  class-wise precision, recall, and harmonic F1 metrics over the unaugmented holdout set.
                </p>
                <p>
                  Final requirements include generating multi-epoch training versus validation loss
                  convergence diagrams, verifying non-overfitting parameters, and drafting a
                  concise two-page LaTeX brief detailing hyperparameter sensitivity findings.
                </p>
              </div>
            </article>

            {/* Section 2: Chronological Execution Plan */}
            <section className="flex flex-col gap-space-md">
              <div className="flex items-baseline justify-between">
                <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                  Execution Plan
                </span>
                <span className="font-label-md text-label-md text-ink-secondary">
                  {executionBlocks.filter((b) => b.completed).length} of {executionBlocks.length}{' '}
                  blocks complete
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {executionBlocks.map((block) => (
                  <div
                    key={block.id}
                    onClick={() => toggleBlock(block.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleBlock(block.id);
                      }
                    }}
                    role="checkbox"
                    aria-checked={block.completed}
                    tabIndex={0}
                    aria-label={`Mark "${block.title}" as ${block.completed ? 'incomplete' : 'complete'}`}
                    className={`py-space-md px-space-md flex items-start justify-between gap-space-md cursor-pointer transition-colors duration-150 border focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary ${
                      block.completed
                        ? 'bg-canvas-paper border-border-hairline opacity-75'
                        : 'bg-surface-cream border-border-hairline'
                    }`}
                  >
                    <div className="flex items-start gap-space-sm">
                      <span
                        className={`material-symbols-outlined text-[20px] mt-0.5 ${
                          block.completed
                            ? 'text-ink-primary'
                            : 'text-accent-terracotta'
                        }`}
                      >
                        {block.completed ? 'check_circle' : 'schedule'}
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={`font-headline-md text-headline-md ${
                            block.completed
                              ? 'text-ink-primary line-through opacity-60'
                              : 'text-ink-primary'
                          }`}
                        >
                          {block.title}
                        </span>
                        <span className="font-body-md text-body-md text-ink-muted">
                          {block.subtitle}
                        </span>
                        <span
                          className={`font-label-md text-label-md mt-1 ${
                            block.completed ? 'text-ink-muted' : 'text-accent-terracotta font-medium'
                          }`}
                        >
                          {block.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-label-lg text-label-lg text-ink-primary block font-semibold">
                        {block.timeSpent}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Time Logging & Recorded Sessions */}
            <section className="flex flex-col gap-space-md bg-canvas-paper p-space-md border border-border-hairline">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-xs">
                <div>
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest block">
                    Logged Intervals
                  </span>
                  <h3 className="font-headline-md text-headline-md text-ink-primary">
                    {actualHours.toFixed(1)} Hours Recorded
                  </h3>
                </div>

                <div className="flex items-center gap-space-xs">
                  <button
                    onClick={() => handleLogTime(0.5, '30m')}
                    className="px-space-sm py-1 bg-surface-cream hover:bg-surface-tint font-label-md text-label-md text-ink-primary transition-colors border border-border-hairline"
                  >
                    +30m
                  </button>
                  <button
                    onClick={() => handleLogTime(1.0, '1.0h')}
                    className="px-space-sm py-1 bg-surface-cream hover:bg-surface-tint font-label-md text-label-md text-ink-primary transition-colors border border-border-hairline"
                  >
                    +1.0h
                  </button>
                  <button
                    onClick={() => handleLogTime(2.0, '2.0h sprint')}
                    className="px-space-sm py-1 bg-ink-primary text-canvas-paper hover:bg-accent-terracotta font-label-md text-label-md transition-colors"
                  >
                    Custom Entry
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs mt-space-xs divide-y divide-border-hairline">
                <div className="flex items-center justify-between py-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-1.5 h-1.5 bg-ink-secondary" />
                    <span className="font-body-md text-body-md text-ink-primary">
                      Session 1 · Dataset setup &amp; split pipeline
                    </span>
                  </div>
                  <div className="flex items-center gap-space-md">
                    <span className="font-label-md text-label-md text-ink-muted">
                      Oct 18 · 16:15
                    </span>
                    <span className="font-label-lg text-label-lg text-ink-primary font-medium">
                      1.5 hrs
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-1.5 h-1.5 bg-ink-secondary" />
                    <span className="font-body-md text-body-md text-ink-primary">
                      Session 2 · Checkpoint runs on compute cluster
                    </span>
                  </div>
                  <div className="flex items-center gap-space-md">
                    <span className="font-label-md text-label-md text-ink-muted">
                      Oct 19 · 09:00
                    </span>
                    <span className="font-label-lg text-label-lg text-ink-primary font-medium">
                      1.5 hrs
                    </span>
                  </div>
                </div>
              </div>

              {toastMessage && (
                <div
                  role="status"
                  aria-live="polite"
                  className="font-label-md text-label-md text-accent-terracotta pt-space-xs font-semibold animate-pulse motion-reduce:animate-none"
                >
                  {toastMessage}
                </div>
              )}
            </section>
          </div>

          {/* Right Column (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-xl">
            {/* Primary Action Callout */}
            <div className="bg-surface-cream p-space-md flex flex-col gap-space-md border border-border-hairline">
              <div className="flex flex-col gap-1">
                <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                  Recommended Action
                </span>
                <h3 className="font-headline-md text-headline-md text-ink-primary">
                  Immediate Focus Window
                </h3>
                <p className="font-body-md text-body-md text-ink-secondary">
                  Block 3 starts in 40 minutes. Entering quiet deep work now avoids evening
                  compression.
                </p>
              </div>

              <div className="flex flex-col gap-space-xs pt-space-xs">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => startSession(`Sprint: ${item.title}`)}
                >
                  Focus This Work Now (2.0h)
                </Button>
                <div className="grid grid-cols-2 gap-space-xs pt-1">
                  <button
                    onClick={() => setToastMessage('Schedule plan adjusted against calendar.')}
                    className="py-space-xs px-space-sm bg-surface hover:bg-surface-tint text-ink-primary font-label-md text-label-md text-center transition-colors border border-border-hairline"
                  >
                    Reschedule Plan
                  </button>
                  <button
                    onClick={() => setToastMessage('Assignment archived as completed.')}
                    className="py-space-xs px-space-sm bg-surface hover:bg-surface-tint text-ink-primary font-label-md text-label-md text-center transition-colors border border-border-hairline"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            </div>

            {/* Velocity Intelligence Note */}
            <div className="bg-canvas-paper p-space-md flex flex-col gap-space-sm border border-border-hairline">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                Capacity &amp; Velocity Intelligence
              </span>
              <p className="font-body-md text-body-md text-ink-primary font-medium">
                Historical Pace: 1.1x estimate factor
              </p>
              <p className="font-body-md text-body-md text-ink-secondary">
                Your typical variance on CS assignments exhibits a 10% drift. The remaining 3.0h
                block includes a calibrated 45-minute safety reserve prior to Friday 17:00,
                safeguarding your buffer against unforeseen compute queue delays.
              </p>

              <div className="pt-space-xs flex flex-col gap-1">
                <div className="flex justify-between font-label-md text-label-md text-ink-muted">
                  <span>Time Committed: 3.0h</span>
                  <span>Available Horizon: 28.5h</span>
                </div>
                <div className="w-full h-1.5 bg-surface-cream flex overflow-hidden">
                  <div className="h-full bg-ink-primary" style={{ width: '50%' }} />
                  <div className="h-full bg-accent-terracotta" style={{ width: '15%' }} />
                </div>
                <span className="font-label-md text-label-md text-ink-muted pt-0.5">
                  Ratio: 10.5% of total remaining week hours
                </span>
              </div>
            </div>

            {/* Dependencies Module */}
            <div className="p-space-md bg-surface-container-low flex flex-col gap-space-sm border border-border-hairline">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                Pre-Requisite Work
              </span>
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-ink-secondary text-[18px] mt-0.5">
                  task_alt
                </span>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md text-ink-primary font-medium">
                    Review Lecture 12 &amp; 13 Notes
                  </span>
                  <span className="font-label-md text-label-md text-ink-secondary">
                    Finished Wednesday · Verified cross-entropy formulas
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Photo Plate */}
            <div className="flex flex-col gap-space-xs">
              <div className="overflow-hidden border border-border-hairline">
                <img
                  src="/assets/work-academic-desk.jpg"
                  alt="Editorial close-up still life of an academic workspace"
                  className="w-full h-48 object-cover"
                />
              </div>
              <span className="font-label-md text-label-md text-ink-muted">
                Plate 07 · Model Validation &amp; Empirical Metrics dossier.
              </span>
            </div>

            {/* Secondary Actions */}
            <div className="pt-space-sm flex items-center justify-between font-label-md text-label-md text-ink-secondary">
              <button
                onClick={() => window.print()}
                className="hover:text-ink-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Work Brief</span>
              </button>
              <Link
                to="/work"
                className="hover:text-status-alert transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">archive</span>
                <span>Archive Assignment</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
