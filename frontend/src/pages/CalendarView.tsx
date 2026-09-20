import React, { useState, useMemo } from 'react';
import { SubNavigation } from '../components/layout/SubNavigation';
import {
  useScheduleBlocks,
  useCreateScheduleBlock,
  useDeleteScheduleBlock,
  useWorkItems,
} from '../services/apiHooks';
import { ScheduleBlock, WorkItem } from '../services/apiTypes';

export const CalendarView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'agenda'>('week');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Initialize to Monday of current week
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [blockTitle, setBlockTitle] = useState('');
  const [blockType, setBlockType] = useState('focus');
  const [blockStart, setBlockStart] = useState('09:00');
  const [blockEnd, setBlockEnd] = useState('11:00');
  const [blockDayOffset, setBlockDayOffset] = useState(0);

  const startIso = weekStartDate.toISOString();
  const weekEndDate = useMemo(() => {
    const end = new Date(weekStartDate);
    end.setDate(end.getDate() + 7);
    return end;
  }, [weekStartDate]);
  const endIso = weekEndDate.toISOString();

  const { data: blocks = [], isLoading: isLoadingBlocks } = useScheduleBlocks(startIso, endIso);
  const { data: workItems = [] } = useWorkItems();
  const createBlockMutation = useCreateScheduleBlock();
  const deleteBlockMutation = useDeleteScheduleBlock();

  const handlePrevWeek = () => {
    const prev = new Date(weekStartDate);
    prev.setDate(prev.getDate() - 7);
    setWeekStartDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStartDate);
    next.setDate(next.getDate() + 7);
    setWeekStartDate(next);
  };

  const handleJumpToNow = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setWeekStartDate(monday);
  };

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Match deadlines on this day
      const dayDeadlines = workItems.filter((w: WorkItem) => {
        if (!w.deadlineUtc) return false;
        return w.deadlineUtc.startsWith(dateStr);
      });

      return {
        date: d,
        dateStr,
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: d.toDateString() === new Date().toDateString(),
        deadlines: dayDeadlines,
      };
    });
  }, [weekStartDate, workItems]);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;

    const targetDate = new Date(weekStartDate);
    targetDate.setDate(targetDate.getDate() + blockDayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];

    const startDateTime = `${dateStr}T${blockStart}:00Z`;
    const endDateTime = `${dateStr}T${blockEnd}:00Z`;

    try {
      await createBlockMutation.mutateAsync({
        title: blockTitle.trim(),
        block_type: blockType,
        start_time: startDateTime,
        end_time: endDateTime,
        is_blackout: blockType === 'blackout',
      });
      setBlockTitle('');
      setIsAddOpen(false);
    } catch {
      // Handled
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      await deleteBlockMutation.mutateAsync(id);
    } catch {
      // Handled
    }
  };

  const weekRangeLabel = useMemo(() => {
    const startStr = weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(weekStartDate);
    end.setDate(end.getDate() + 6);
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }, [weekStartDate]);

  return (
    <div className="w-full flex flex-col min-h-screen bg-surface">
      {/* Sub-Navigation Strip */}
      <SubNavigation
        items={[
          { label: 'Planning', path: '/planning' },
          { label: 'Timeline', path: '/timeline' },
          { label: 'Calendar', path: '/calendar', indicator: true },
          { label: 'Workload', path: '/workload' },
        ]}
        statusText={`Active Spatial Grid · ${weekRangeLabel}`}
        rightContent={
          <div className="flex items-center gap-space-xs text-ink-secondary">
            <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted mr-1">
              View Mode
            </span>
            <div className="flex items-center bg-surface-container p-0.5 border border-border-hairline">
              <button
                onClick={() => setViewMode('week')}
                className={`px-space-xs py-0.5 font-label-md text-label-md transition-colors ${
                  viewMode === 'week'
                    ? 'text-ink-primary bg-surface border-b-2 border-ink-primary font-semibold'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-space-xs py-0.5 font-label-md text-label-md transition-colors ${
                  viewMode === 'day'
                    ? 'text-ink-primary bg-surface border-b-2 border-ink-primary font-semibold'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-space-xs py-0.5 font-label-md text-label-md transition-colors ${
                  viewMode === 'agenda'
                    ? 'text-ink-primary bg-surface border-b-2 border-ink-primary font-semibold'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Agenda
              </button>
            </div>
          </div>
        }
      />

      {/* Editorial Lead Header Section */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-md">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs max-w-2xl">
            <div className="flex items-center gap-space-xs">
              <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
              <span className="font-label-md text-label-md text-ink-muted">
                Temporal Capacity Instrument
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight">
              Calendar
            </h1>
            <p className="font-body-xl text-body-xl text-ink-secondary leading-relaxed">
              Spatial distribution of your week. White space represents genuine uncommitted time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm sm:gap-space-md self-start lg:self-end">
            <div className="flex items-center bg-surface-cream px-space-sm py-space-xs gap-space-xs border border-border-hairline">
              <button
                type="button"
                onClick={handlePrevWeek}
                aria-label="Previous week"
                className="w-7 h-7 flex items-center justify-center text-ink-primary hover:bg-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="font-headline-md text-headline-md px-space-xs text-ink-primary">
                {weekRangeLabel}
              </span>
              <button
                type="button"
                onClick={handleNextWeek}
                aria-label="Next week"
                className="w-7 h-7 flex items-center justify-center text-ink-primary hover:bg-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleJumpToNow}
              className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-tint text-ink-primary px-space-md py-space-xs transition-colors border border-border-hairline"
            >
              Jump to Now
            </button>
            <button
              type="button"
              onClick={() => setIsAddOpen(!isAddOpen)}
              className="font-label-lg text-label-lg bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-md py-space-xs transition-colors"
            >
              {isAddOpen ? 'Cancel' : '+ Add Focus Block'}
            </button>
          </div>
        </div>

        {/* Add Block Form Drawer */}
        {isAddOpen && (
          <form onSubmit={handleCreateBlock} className="mt-space-md p-space-md bg-canvas-paper border border-ink-primary max-w-2xl flex flex-col gap-space-sm">
            <div className="flex items-center justify-between border-b border-border-hairline pb-space-xs">
              <span className="font-headline-md text-headline-md text-ink-primary">Schedule New Block</span>
              <span className="font-label-md text-label-md text-ink-muted">Persisted to backend</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <div>
                <label className="font-label-md text-label-md text-ink-muted block mb-1">Title</label>
                <input
                  type="text"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  placeholder="e.g. Deep Coding Session"
                  className="w-full bg-surface-cream border border-border-hairline p-2 text-ink-primary font-body-md focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-ink-muted block mb-1">Type</label>
                <select
                  value={blockType}
                  onChange={(e) => setBlockType(e.target.value)}
                  className="w-full bg-surface-cream border border-border-hairline p-2 text-ink-primary font-body-md focus:outline-none"
                >
                  <option value="focus">Focus Block</option>
                  <option value="blackout">Blackout (Protected Time)</option>
                  <option value="class">Class / Seminar</option>
                  <option value="routine">Routine</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-ink-muted block mb-1">Day</label>
                <select
                  value={blockDayOffset}
                  onChange={(e) => setBlockDayOffset(Number(e.target.value))}
                  className="w-full bg-surface-cream border border-border-hairline p-2 text-ink-primary font-body-md focus:outline-none"
                >
                  {days.map((d, idx) => (
                    <option key={idx} value={idx}>
                      {d.dayName} ({d.dateStr})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-ink-muted block mb-1">Start Time</label>
                <input
                  type="time"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="w-full bg-surface-cream border border-border-hairline p-2 text-ink-primary font-body-md focus:outline-none"
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-ink-muted block mb-1">End Time</label>
                <input
                  type="time"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="w-full bg-surface-cream border border-border-hairline p-2 text-ink-primary font-body-md focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-space-xs">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-1.5 font-label-md text-label-md text-ink-secondary hover:text-ink-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createBlockMutation.isPending || !blockTitle.trim()}
                className="px-4 py-1.5 bg-ink-primary hover:bg-accent-terracotta text-canvas-paper font-label-md text-label-md font-semibold transition-colors disabled:opacity-50"
              >
                {createBlockMutation.isPending ? 'Saving...' : 'Save Block'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Main Calendar View Section */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-2xl">
        {isLoadingBlocks && (
          <div className="py-space-xl text-center font-label-md text-label-md text-ink-muted">
            Loading schedule commitments...
          </div>
        )}

        {!isLoadingBlocks && viewMode === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-border-hairline border border-border-hairline">
            {days.map((day, idx) => {
              const dayBlocks = blocks.filter((b: ScheduleBlock) => b.start_time.startsWith(day.dateStr));

              return (
                <div key={idx} className="bg-canvas-paper min-h-[360px] p-space-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between border-b border-border-hairline pb-space-xs mb-space-xs">
                      <span className={`font-label-md text-label-md uppercase font-semibold ${day.isToday ? 'text-accent-terracotta' : 'text-ink-secondary'}`}>
                        {day.dayName}
                      </span>
                      <span className={`font-headline-md text-headline-md ${day.isToday ? 'text-accent-terracotta font-bold' : 'text-ink-primary'}`}>
                        {day.dayNum}
                      </span>
                    </div>

                    {/* Deadlines list on this day */}
                    {day.deadlines.map((dl) => (
                      <div
                        key={dl.id}
                        className="mb-1.5 p-1 bg-accent-terracotta/10 border-l-2 border-accent-terracotta text-accent-terracotta"
                      >
                        <span className="font-label-md text-[11px] uppercase font-bold block">
                          Deadline
                        </span>
                        <span className="font-body-md text-body-md font-medium text-ink-primary truncate block">
                          {dl.title}
                        </span>
                      </div>
                    ))}

                    {/* Schedule blocks on this day */}
                    <div className="flex flex-col gap-1 mt-1">
                      {dayBlocks.map((b) => (
                        <div
                          key={b.id}
                          className="group p-1.5 bg-surface-cream border border-border-hairline flex flex-col justify-between relative"
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-label-md text-label-md text-ink-primary font-medium truncate">
                              {b.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteBlock(b.id)}
                              className="text-ink-muted hover:text-accent-terracotta opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                              title="Delete block"
                            >
                              ×
                            </button>
                          </div>
                          <span className="font-mono text-[11px] text-ink-muted mt-0.5">
                            {b.start_time.slice(11, 16)} – {b.end_time.slice(11, 16)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-space-xs border-t border-border-hairline text-[11px] text-ink-muted">
                    {dayBlocks.length} block{dayBlocks.length === 1 ? '' : 's'} scheduled
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoadingBlocks && viewMode === 'day' && (
          <div className="w-full max-w-2xl mx-auto bg-canvas-paper border border-border-hairline p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-border-hairline pb-space-sm">
              <div className="flex items-center gap-2">
                {days.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`px-2.5 py-1 font-label-md text-label-md border transition-colors ${
                      selectedDayIndex === idx
                        ? 'bg-ink-primary text-canvas-paper border-ink-primary font-semibold'
                        : 'bg-surface-cream text-ink-secondary border-border-hairline'
                    }`}
                  >
                    {d.dayName} {d.dayNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected day contents */}
            <div>
              <h3 className="font-headline-lg text-headline-lg text-ink-primary mb-space-sm">
                {days[selectedDayIndex]?.dayName}, {days[selectedDayIndex]?.dateStr}
              </h3>

              {days[selectedDayIndex]?.deadlines.length > 0 && (
                <div className="mb-space-md space-y-1">
                  {days[selectedDayIndex].deadlines.map((dl) => (
                    <div key={dl.id} className="p-space-sm bg-accent-terracotta/10 border-l-4 border-accent-terracotta text-accent-terracotta">
                      <span className="font-label-md text-label-md uppercase font-bold block">Deliverable Due</span>
                      <span className="font-headline-md text-headline-md text-ink-primary">{dl.title}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="divide-y divide-border-hairline">
                {blocks
                  .filter((b: ScheduleBlock) => b.start_time.startsWith(days[selectedDayIndex]?.dateStr || ''))
                  .map((b: ScheduleBlock) => (
                    <div key={b.id} className="py-space-sm flex items-center justify-between">
                      <div>
                        <span className="font-headline-md text-headline-md text-ink-primary block">{b.title}</span>
                        <span className="font-mono text-label-md text-ink-muted">
                          {b.start_time.slice(11, 16)} – {b.end_time.slice(11, 16)} ({b.block_type})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(b.id)}
                        className="text-ink-muted hover:text-accent-terracotta font-label-md text-label-md"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {!isLoadingBlocks && viewMode === 'agenda' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-space-sm">
            {days.map((day, idx) => {
              const dayBlocks = blocks.filter((b: ScheduleBlock) => b.start_time.startsWith(day.dateStr));
              return (
                <div key={idx} className="bg-canvas-paper border border-border-hairline p-space-md flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between pb-space-xs border-b border-border-hairline">
                    <div className="flex items-center gap-space-sm">
                      <span className={`font-headline-md text-headline-md ${day.isToday ? 'text-accent-terracotta font-bold' : 'text-ink-primary'}`}>
                        {day.dayName} {day.dayNum} ({day.dateStr})
                      </span>
                      {day.deadlines.length > 0 && (
                        <span className="px-2 py-0.5 bg-accent-terracotta text-canvas-paper font-label-md text-[11px] font-semibold">
                          {day.deadlines.length} DEADLINE{day.deadlines.length === 1 ? '' : 'S'}
                        </span>
                      )}
                    </div>
                  </div>

                  {dayBlocks.length === 0 && day.deadlines.length === 0 ? (
                    <span className="text-body-md text-ink-muted py-space-xs">
                      Open uncommitted window — no scheduled focus blocks.
                    </span>
                  ) : (
                    <div className="flex flex-col gap-space-xs pt-space-xs">
                      {day.deadlines.map((dl) => (
                        <div key={dl.id} className="p-space-xs bg-accent-terracotta/10 border-l-2 border-accent-terracotta text-accent-terracotta">
                          <span className="font-label-md text-label-md font-semibold">Deadline: {dl.title}</span>
                        </div>
                      ))}
                      {dayBlocks.map((b) => (
                        <div key={b.id} className="p-space-sm flex items-center justify-between border border-border-hairline bg-surface-cream">
                          <div>
                            <span className="font-label-lg text-label-lg text-ink-primary font-semibold block">{b.title}</span>
                            <span className="font-mono text-label-md text-ink-muted">
                              {b.start_time.slice(11, 16)} – {b.end_time.slice(11, 16)} · {b.block_type}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(b.id)}
                            className="text-ink-muted hover:text-accent-terracotta font-label-md text-label-md"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
