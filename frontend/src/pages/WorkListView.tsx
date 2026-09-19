import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SubNavigation } from '../components/layout/SubNavigation';
import { MOCK_WORK_ITEMS, MOCK_CAPACITY_METRIC } from '../mocks/mockData';
import { WorkItem } from '../services/apiTypes';
import { useAppStore } from '../store/useAppStore';

export const WorkListView: React.FC = () => {
  const navigate = useNavigate();
  const { startSession } = useAppStore();
  const [naturalInput, setNaturalInput] = useState('');
  const [items, setItems] = useState<WorkItem[]>(MOCK_WORK_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DEADLINE' | 'PRIORITY' | 'EFFORT'>('DEADLINE');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Filter and Sort Items
  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesCategory =
          filterCategory === 'ALL'
            ? true
            : filterCategory === 'CRITICAL'
            ? item.riskLevel === 'CRITICAL'
            : item.category === filterCategory;

        const matchesSearch =
          !searchQuery.trim() ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'DEADLINE') {
          return new Date(a.deadlineUtc).getTime() - new Date(b.deadlineUtc).getTime();
        }
        if (sortBy === 'PRIORITY') {
          return (b.dynamicPriorityScore || 0) - (a.dynamicPriorityScore || 0);
        }
        if (sortBy === 'EFFORT') {
          return b.remainingEffortHours - a.remainingEffortHours;
        }
        return 0;
      });
  }, [items, filterCategory, searchQuery, sortBy]);

  const totalRemainingHours = useMemo(() => {
    return items.reduce((sum, i) => sum + i.remainingEffortHours, 0);
  }, [items]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = naturalInput.trim();
    if (!trimmed) return;

    // Parse effort if mentioned in string
    const match = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|h)/i);
    const parsedEffort = match ? parseFloat(match[1]) : 2.0;

    const newItem: WorkItem = {
      id: `wi_${Date.now()}`,
      title: trimmed,
      description: 'Parsed deliverable appended to Work ledger.',
      category: 'PROJECT',
      status: 'IN_PROGRESS',
      riskLevel: 'WATCH',
      deadlineUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      isHardDeadline: false,
      estimatedEffortHours: parsedEffort,
      remainingEffortHours: parsedEffort,
      actualLoggedHours: 0.0,
      dynamicPriorityScore: 78,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
    setNaturalInput('');
    setFeedbackNotice(`Appended "${trimmed}" (${parsedEffort}h remaining) to active commitments.`);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleStartFocus = (title: string, id: string) => {
    startSession(title, id);
    navigate('/today');
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-surface">
      {/* Sub-Navigation Bar */}
      <SubNavigation
        items={[
          { label: 'Work Ledger', path: '/work', badge: `${items.length}` },
          { label: 'Priorities', path: '/priorities', indicator: true },
          { label: 'Work Detail', path: '/work/wi_ml_01' },
        ]}
        statusText={`Evaluated for Sprint Wk ${MOCK_CAPACITY_METRIC.weekNumber}`}
      />

      {/* Workspace Header */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-md pb-space-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <h1 className="font-display-hero text-headline-xl md:text-display-hero text-ink-primary tracking-tight">
              Work
            </h1>
            <Link
              to="/work/new"
              className="inline-flex items-center gap-space-xs bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-md py-space-xs transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-[16px] leading-none text-canvas-paper">
                add
              </span>
              <span className="font-label-lg text-label-lg tracking-wide">Add Work</span>
            </Link>
          </div>
          <p className="font-body-lg text-body-lg text-ink-secondary">
            Everything currently on your plate, deadlines, and remaining time.
          </p>

          {/* Search, Filter, and Sort Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs">
            {/* Filter Pills */}
            <div className="flex items-center gap-space-xs overflow-x-auto">
              {[
                { id: 'ALL', label: `All (${items.length})` },
                { id: 'ACADEMIC', label: 'Academic' },
                { id: 'PROJECT', label: 'Backend & Dev' },
                { id: 'RESEARCH', label: 'Design & Research' },
                { id: 'CRITICAL', label: 'High Risk' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setFilterCategory(pill.id)}
                  className={`font-label-md text-label-md px-space-sm py-1 transition-colors shrink-0 ${
                    filterCategory === pill.id
                      ? 'bg-ink-primary text-canvas-paper font-semibold'
                      : 'bg-surface-cream text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex items-center gap-space-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search work..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-surface-cream border border-border-hairline px-space-sm py-1 text-label-lg text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ink-primary text-sm w-44 sm:w-56"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1 text-ink-muted hover:text-ink-primary text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="font-label-md text-label-md text-ink-muted hidden md:inline">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'DEADLINE' | 'PRIORITY' | 'EFFORT')}
                  className="bg-surface-cream border border-border-hairline px-2 py-1 font-label-md text-label-md text-ink-primary focus:outline-none cursor-pointer"
                >
                  <option value="DEADLINE">Deadline</option>
                  <option value="PRIORITY">Priority Score</option>
                  <option value="EFFORT">Remaining Effort</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Summary Bar */}
      <section
        className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-sm bg-surface-cream/50 mt-space-xs"
        style={{
          boxShadow:
            'rgba(26, 23, 21, 0.08) 0px 1px 0px 0px, rgba(26, 23, 21, 0.08) 0px -1px 0px 0px',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm md:gap-space-lg">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
              Active Tasks:
            </span>
            <span className="font-headline-md text-headline-md text-ink-primary font-semibold">
              {filteredAndSortedItems.length}
            </span>
          </div>
          <div className="h-4 w-px bg-border-hairline hidden sm:block" />
          <div className="flex items-center gap-space-xs">
            <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
              Total Remaining:
            </span>
            <span className="font-headline-md text-headline-md text-ink-primary font-semibold">
              {totalRemainingHours.toFixed(1)} hrs
            </span>
          </div>
          <div className="h-4 w-px bg-border-hairline hidden sm:block" />
          <div className="flex items-center gap-space-xs">
            <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
              Available this week:
            </span>
            <span className="font-headline-md text-headline-md text-ink-primary font-semibold">
              {MOCK_CAPACITY_METRIC.availableFocusHours} hrs
            </span>
          </div>
          <div className="h-4 w-px bg-border-hairline hidden sm:block" />
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-accent-terracotta inline-block" />
            <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
              Status:
            </span>
            <span className="font-body-md text-body-md font-semibold text-ink-primary">
              On schedule (+{MOCK_CAPACITY_METRIC.netBufferHours.toFixed(1)}h buffer)
            </span>
          </div>
        </div>
      </section>

      {/* Main Active Work Section (Clean, Open List) */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-md">
        <div className="max-w-7xl mx-auto flex flex-col">
          {/* Ledger Header */}
          <div
            className="hidden md:grid md:grid-cols-12 pb-space-xs font-label-md text-label-md text-ink-muted uppercase tracking-wider"
            style={{ boxShadow: '0 1px 0 0 rgba(26, 23, 21, 0.12)' }}
          >
            <div className="col-span-5">Task &amp; Context</div>
            <div className="col-span-2">Deadline</div>
            <div className="col-span-3">Effort Remaining</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {/* Deliverables List */}
          <div className="flex flex-col">
            {filteredAndSortedItems.length === 0 ? (
              <div className="py-space-xl text-center flex flex-col items-center">
                <span className="font-headline-md text-headline-md text-ink-primary">
                  No work items match your filter.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-space-sm font-label-lg text-label-lg text-accent-terracotta underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredAndSortedItems.map((item) => {
                const totalEffort =
                  item.estimatedEffortHours || item.actualLoggedHours + item.remainingEffortHours || 1;
                const progress = Math.min(
                  100,
                  Math.round((item.actualLoggedHours / totalEffort) * 100)
                );

                const deadlineDate = new Date(item.deadlineUtc);
                const isOverdue = deadlineDate.getTime() < Date.now();
                const isHighRisk = item.riskLevel === 'CRITICAL';

                return (
                  <article
                    key={item.id}
                    className="py-space-md transition-colors duration-150 hover:bg-surface-cream/30"
                    style={{ boxShadow: '0 1px 0 0 rgba(26, 23, 21, 0.08)' }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-space-xs md:gap-x-gutter items-center">
                      <div className="md:col-span-5 flex flex-col">
                        <div className="flex items-center gap-space-xs">
                          <span
                            className={`w-1.5 h-1.5 rounded-full inline-block ${
                              isHighRisk
                                ? 'bg-accent-terracotta'
                                : item.riskLevel === 'WATCH'
                                ? 'bg-ink-primary'
                                : 'bg-ink-muted'
                            }`}
                          />
                          <span
                            className={`font-label-md text-label-md uppercase font-semibold ${
                              isHighRisk ? 'text-accent-terracotta' : 'text-ink-secondary'
                            }`}
                          >
                            {item.category}
                          </span>
                          {item.dynamicPriorityScore ? (
                            <span className="font-mono text-[11px] bg-surface-cream px-1.5 py-0.5 text-ink-primary border border-border-hairline">
                              Score {item.dynamicPriorityScore}
                            </span>
                          ) : null}
                        </div>
                        <Link
                          to={`/work/${item.id}`}
                          className="font-headline-md text-headline-md text-ink-primary hover:text-accent-terracotta tracking-tight transition-colors mt-0.5"
                        >
                          {item.title}
                        </Link>
                        <p className="font-body-md text-body-md text-ink-secondary line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <span
                          className={`font-label-lg text-label-lg font-semibold block ${
                            isHighRisk || isOverdue ? 'text-accent-terracotta' : 'text-ink-primary'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : item.isHardDeadline ? 'Hard Deadline' : 'Target'}
                        </span>
                        <span className="block font-label-md text-label-md text-ink-muted">
                          {deadlineDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="md:col-span-3 flex flex-col gap-1">
                        <div className="flex justify-between items-center font-label-md text-label-md text-ink-muted">
                          <span>{item.remainingEffortHours}h remaining</span>
                          <span>
                            {totalEffort}h total ({progress}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-dim h-1 overflow-hidden">
                          <div
                            className="bg-ink-primary h-full transition-all duration-300"
                            style={{ width: `${Math.max(4, progress)}%` }}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 flex justify-start md:justify-end gap-space-xs">
                        <button
                          type="button"
                          onClick={() => handleStartFocus(item.title, item.id)}
                          className="px-space-md py-space-xs bg-ink-primary hover:bg-accent-terracotta text-canvas-paper font-label-lg text-label-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Focus</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Desk Photographic Plate Accent (Retained with simple caption) */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-sm">
        <div className="max-w-7xl mx-auto">
          <div className="w-full overflow-hidden border border-border-hairline">
            <img
              src="/assets/workledger-desk.jpg"
              alt="A tranquil, high-contrast photograph of an architect's work desk with blueprints, mechanical pencil, notebook, and coffee cup."
              className="w-full h-48 md:h-56 object-cover filter contrast-[0.95]"
            />
            <div className="p-space-xs bg-surface-cream/50 flex justify-between items-center">
              <span className="font-label-md text-label-md text-ink-muted italic">
                Focus environment snapshot — Intentional pacing and daily cognitive horizon.
              </span>
              <span className="font-mono text-label-md text-ink-muted uppercase">
                Plate 03 · Desk Calm
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Clean Natural Task Intake Bar */}
      <section
        className="w-full bg-surface-container-low px-margin-mobile md:px-margin-tablet lg:px-margin py-space-md mt-auto"
        style={{ boxShadow: 'rgba(26, 23, 21, 0.12) 0px -1px 0px 0px' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-space-xs">
          {feedbackNotice && (
            <div className="p-space-xs bg-surface-cream border border-border-hairline text-ink-primary font-body-md text-sm flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-accent-terracotta text-[18px]">
                check_circle
              </span>
              <span>{feedbackNotice}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <label
              htmlFor="natural-work-input"
              className="font-label-md text-label-md text-ink-muted uppercase tracking-wider flex items-center gap-space-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-ink-secondary">
                edit_note
              </span>
              <span>Add a new task</span>
            </label>
            <span className="hidden sm:inline font-mono text-[11px] text-ink-muted">
              Press [Enter] to add
            </span>
          </div>
          <form onSubmit={handleQuickAdd} className="relative w-full flex items-center">
            <input
              id="natural-work-input"
              type="text"
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="Add a new task... e.g. Finish lab report by Thursday taking 2 hours"
              className="w-full bg-transparent font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-ink-primary placeholder:text-ink-muted/50 pb-space-xs focus:outline-none transition-colors"
              style={{ boxShadow: '0 1px 0 0 rgba(26, 23, 21, 0.2)' }}
            />
            <button
              type="submit"
              aria-label="Commit Work Item"
              className="absolute right-0 bottom-space-xs p-1 text-ink-primary hover:text-accent-terracotta transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">keyboard_return</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
