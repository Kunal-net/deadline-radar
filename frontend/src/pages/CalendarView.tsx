import React, { useState } from 'react';
import { SubNavigation } from '../components/layout/SubNavigation';
import { MOCK_CALENDAR_SLOTS } from '../mocks/mockData';

export const CalendarView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'agenda'>('week');

  const days = [
    { dayNum: 16, dayName: 'Mon', note: 'Steady runway', isDeadline: false },
    { dayNum: 17, dayName: 'Tue', note: 'Deep code day', isDeadline: false },
    { dayNum: 18, dayName: 'Wed', note: 'Midweek check', isDeadline: false },
    { dayNum: 19, dayName: 'Thu', note: 'Final drafts', isDeadline: false },
    { dayNum: 20, dayName: 'Fri', note: '17:00 ML Assignment', isDeadline: true },
    { dayNum: 21, dayName: 'Sat', note: 'Recovery & review', isDeadline: false },
    { dayNum: 22, dayName: 'Sun', note: '23:59 FastAPI Project', isDeadline: true },
  ];

  const timeHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

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
        statusText="Active Spatial Grid · Week 42"
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
                aria-label="Previous week"
                className="w-7 h-7 flex items-center justify-center text-ink-primary hover:bg-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="font-headline-md text-headline-md px-space-xs text-ink-primary">
                Mon Oct 16 – Sun Oct 22
              </span>
              <button
                aria-label="Next week"
                className="w-7 h-7 flex items-center justify-center text-ink-primary hover:bg-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
            <button className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-tint text-ink-primary px-space-md py-space-xs transition-colors border border-border-hairline">
              Jump to Now
            </button>
          </div>
        </div>

        {/* Conflict & Capacity Ledger Banner */}
        <div className="mt-space-md w-full bg-surface-cream p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm border border-border-hairline">
          <div className="flex items-center gap-space-sm">
            <div className="w-7 h-7 bg-surface flex items-center justify-center text-ink-primary border border-border-hairline">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
            <div>
              <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                Zero conflicts detected
              </span>
              <span className="font-body-md text-body-md text-ink-secondary ml-2">
                · 4.0h uncommitted buffer intact across 7 days.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-lg text-ink-secondary flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary-container inline-block" />
              <span className="font-label-md text-label-md">Scheduled Work (28.5h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-surface-tint inline-block" />
              <span className="font-label-md text-label-md">Sanctuary &amp; Health (24.0h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-surface-container-lowest inline-block border border-border-hairline" />
              <span className="font-label-md text-label-md">Verified Open Windows</span>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Spatial Calendar Grid */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-2xl overflow-x-auto">
        <div className="min-w-[980px] w-full flex flex-col bg-surface-container-low border border-border-hairline">
          {/* Day Headers & Deadline Flags */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-surface-container-high border-b border-border-hairline">
            <div className="p-space-xs flex flex-col justify-end text-ink-muted border-r border-border-hairline">
              <span className="font-label-md text-label-md">UTC-05</span>
            </div>
            {days.map((day) => (
              <div
                key={day.dayNum}
                className={`p-space-xs flex flex-col gap-1 border-r border-border-hairline ${
                  day.isDeadline ? 'bg-surface-cream' : 'bg-surface-container-high'
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span
                    className={`font-headline-md text-headline-md ${
                      day.isDeadline ? 'text-accent-terracotta font-bold' : 'text-ink-primary'
                    }`}
                  >
                    {day.dayNum}
                  </span>
                  <span
                    className={`font-label-md text-label-md uppercase tracking-wider ${
                      day.isDeadline
                        ? 'text-accent-terracotta font-semibold'
                        : 'text-ink-secondary'
                    }`}
                  >
                    {day.dayName}
                  </span>
                </div>
                <div
                  className={`h-6 flex items-center px-1.5 text-xs truncate ${
                    day.isDeadline
                      ? 'bg-accent-terracotta text-canvas-paper font-medium'
                      : 'text-ink-muted'
                  }`}
                >
                  {day.isDeadline && (
                    <span className="material-symbols-outlined text-[13px] mr-1">flag</span>
                  )}
                  {day.note}
                </div>
              </div>
            ))}
          </div>

          {/* Time Axis & Columns */}
          <div className="relative grid grid-cols-[80px_repeat(7,1fr)] bg-surface divide-x divide-border-hairline min-h-[640px]">
            {/* Time labels on the left */}
            <div className="flex flex-col divide-y divide-border-hairline/60 bg-surface-container-low/40">
              {timeHours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 p-space-xs font-label-md text-label-md text-ink-muted text-right pr-2 select-none"
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* 7 Days Columns */}
            {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
              const daySlots = MOCK_CALENDAR_SLOTS.filter((s) => s.day === dayIdx);

              return (
                <div
                  key={dayIdx}
                  className="relative flex flex-col divide-y divide-border-hairline/40 h-full"
                >
                  {timeHours.map((hour) => (
                    <div key={hour} className="h-16 relative hover:bg-surface-cream/20 transition-colors" />
                  ))}

                  {/* Render Focus Envelopes inside day column */}
                  {daySlots.map((slot) => {
                    // Approximate vertical offset based on startTime
                    const [startH, startM] = slot.startTime.split(':').map(Number);
                    const [endH, endM] = slot.endTime.split(':').map(Number);
                    const topOffset = (startH - 8 + startM / 60) * 64;
                    const durationHours = Math.max(0.5, endH - startH + (endM - startM) / 60);
                    const blockHeight = durationHours * 64;

                    if (slot.type === 'DEADLINE') {
                      return (
                        <div
                          key={slot.id}
                          style={{ top: `${topOffset}px` }}
                          className="absolute left-1 right-1 h-6 bg-accent-terracotta text-canvas-paper px-2 flex items-center justify-between text-xs font-semibold z-20"
                        >
                          <span className="truncate">{slot.title}</span>
                          <span>{slot.startTime}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={slot.id}
                        style={{
                          top: `${topOffset}px`,
                          height: `${blockHeight}px`,
                        }}
                        className={`absolute left-1 right-1 p-2 flex flex-col justify-between text-xs transition-colors duration-150 z-10 border ${
                          slot.type === 'FOCUS'
                            ? 'bg-canvas-paper border-ink-primary text-ink-primary'
                            : 'bg-surface-dim/70 border-border-hairline text-ink-secondary'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold truncate">{slot.title}</span>
                          <span className="text-[11px] text-ink-muted">{slot.category}</span>
                        </div>
                        <span className="font-mono text-[10px] text-ink-muted self-end">
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grounding Photographic Plate */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-2xl">
        <div className="max-w-7xl mx-auto border border-border-hairline">
          <img
            src="/assets/calendar-workspace.jpg"
            alt="Quiet minimalist workspace seen in natural warm daylight"
            className="w-full h-80 object-cover"
          />
          <div className="p-space-xs bg-surface-cream/60 flex justify-between items-center font-label-md text-label-md text-ink-muted">
            <span>Plate 06 — Diurnal Calendar Rhythm &amp; Focus Window Anchor</span>
            <span className="font-mono uppercase">Temporal Truth</span>
          </div>
        </div>
      </section>
    </div>
  );
};
