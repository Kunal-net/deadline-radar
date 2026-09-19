import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface Boundary {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  hours: number;
  selected: boolean;
}

export const OnboardingView: React.FC = () => {
  const navigate = useNavigate();
  const initialCapacity = useAppStore((state) => state.weeklyCapacityHours);
  const initialMultiplier = useAppStore((state) => state.velocityMultiplier);
  const initialBoundaries = useAppStore((state) => state.selectedBoundaries);
  const updateCalibration = useAppStore((state) => state.updateCalibration);

  const [capacityHours, setCapacityHours] = useState(initialCapacity);
  const [velocityMultiplier, setVelocityMultiplier] = useState(initialMultiplier);
  const [submitting, setSubmitting] = useState(false);

  const [boundaries, setBoundaries] = useState<Boundary[]>([
    {
      id: 'sleep',
      icon: 'dark_mode',
      title: 'Sleep baseline',
      subtitle: '8 hours nightly buffer',
      hours: 56,
      selected: initialBoundaries.includes('sleep'),
    },
    {
      id: 'exercise',
      icon: 'fitness_center',
      title: 'Exercise / Health',
      subtitle: '1.5 hours daily physical',
      hours: 10.5,
      selected: initialBoundaries.includes('exercise'),
    },
    {
      id: 'sanctuary',
      icon: 'cottage',
      title: 'Evening Sanctuary',
      subtitle: 'No pings after 18:30',
      hours: 24.5,
      selected: initialBoundaries.includes('sanctuary'),
    },
    {
      id: 'family',
      icon: 'diversity_1',
      title: 'Family & Social',
      subtitle: 'Strictly offline weekends',
      hours: 32,
      selected: initialBoundaries.includes('family'),
    },
  ]);

  const toggleBoundary = (id: string) => {
    setBoundaries((prev) =>
      prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b))
    );
  };

  const totalWeek = 168; // 24 * 7
  const lifeReserved = boundaries
    .filter((b) => b.selected)
    .reduce((sum, b) => sum + b.hours, 0);

  const freeDiscretionary = Math.max(0, totalWeek - capacityHours - lifeReserved);
  const focusPercent = (capacityHours / totalWeek) * 100;
  const lifePercent = (lifeReserved / totalWeek) * 100;
  const marginPercent = Math.max(0, 100 - focusPercent - lifePercent);
  const dailyFocus = (capacityHours / 5).toFixed(1);

  const handleComplete = () => {
    setSubmitting(true);
    const selectedIds = boundaries.filter((b) => b.selected).map((b) => b.id);
    updateCalibration(capacityHours, velocityMultiplier, selectedIds);
    setTimeout(() => {
      navigate('/today');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-ink-primary antialiased flex flex-col justify-center items-center">
      <main className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 lg:py-24">
        {/* Header Step Indicator */}
        <div className="flex items-center justify-between pb-8">
          <div className="flex items-center gap-3">
            <span className="inline-block w-1.5 h-1.5 bg-accent-terracotta shrink-0" />
            <span className="font-label-md text-ink-secondary text-label-md">
              Phase 02 · Calibration
            </span>
          </div>
          <span className="font-label-md text-ink-muted text-label-md">
            Step 2 of 3 · Calibrate Your Baseline
          </span>
        </div>

        {/* Editorial Hero Title */}
        <div className="space-y-4 max-w-3xl pb-16">
          <h1 className="font-display-hero text-display-hero text-ink-primary tracking-tight">
            Tell us how you <span className="italic font-normal text-secondary">actually</span> work.
          </h1>
          <p className="font-body-xl text-body-xl text-ink-secondary leading-relaxed">
            Deadline Radar personalizes estimates and protects your margin based on your natural
            diurnal rhythm and cognitive stamina.
          </p>
        </div>

        {/* Main Bento Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Calibration Engine (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            {/* 01. Weekly Focus Capacity */}
            <div className="bg-surface-cream p-8 md:p-10 rounded-none flex flex-col gap-6 border border-border-hairline relative overflow-hidden">
              <div className="flex items-baseline justify-between">
                <span className="font-label-lg text-label-lg text-ink-secondary">
                  01 / Cognitive Bandwidth
                </span>
                <span className="font-label-md text-label-md text-accent-terracotta font-semibold">
                  Optimal Range
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-headline-md text-headline-md text-ink-primary">
                  Weekly Focus Capacity
                </h2>
                <p className="font-body-md text-body-md text-ink-secondary">
                  Pure undistracted problem-solving. Recommended: 3.5 to 4.5 hours of deep
                  cognitive effort per day.
                </p>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-numeric-hero text-numeric-hero text-ink-primary font-medium tracking-tighter">
                      {capacityHours.toFixed(1)}
                    </span>
                    <span className="font-headline-lg text-headline-lg text-ink-muted">
                      hrs / wk
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-lg text-label-lg text-ink-primary block font-semibold">
                      ~{dailyFocus} hrs/day
                    </span>
                    <span className="font-label-md text-label-md text-ink-muted">
                      5-day standard
                    </span>
                  </div>
                </div>

                <div className="relative w-full pt-2">
                  <input
                    type="range"
                    min="8"
                    max="35"
                    step="0.5"
                    value={capacityHours}
                    onChange={(e) => setCapacityHours(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-surface-dim appearance-none cursor-pointer accent-ink-primary focus:outline-none"
                  />
                  <div className="flex justify-between text-label-md font-label-md text-ink-muted pt-2">
                    <span>8.0h (Protective)</span>
                    <span>18.5h (Golden Mean)</span>
                    <span>35.0h (Sprint)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 02. Protected Life Boundaries */}
            <div className="bg-surface-container-low p-8 md:p-10 rounded-none flex flex-col gap-6 border border-border-hairline">
              <div className="flex items-baseline justify-between">
                <span className="font-label-lg text-label-lg text-ink-secondary">
                  02 / Non-Negotiables
                </span>
                <span className="font-label-md text-label-md text-ink-muted">
                  Selected{' '}
                  <span className="font-semibold text-ink-primary">
                    {boundaries.filter((b) => b.selected).length}
                  </span>{' '}
                  of {boundaries.length}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-headline-md text-headline-md text-ink-primary">
                  Protected Life Boundaries
                </h2>
                <p className="font-body-md text-body-md text-ink-secondary">
                  Radar blocks these zones entirely from project projection calculations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {boundaries.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBoundary(b.id)}
                    className={`text-left p-4 flex flex-col gap-2 transition-all duration-200 cursor-pointer border ${
                      b.selected
                        ? 'bg-surface border-ink-primary'
                        : 'bg-surface-cream/50 border-border-hairline'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`material-symbols-outlined text-xl ${
                          b.selected ? 'text-ink-primary' : 'text-ink-muted'
                        }`}
                      >
                        {b.icon}
                      </span>
                      <span
                        className={`inline-block w-1.5 h-1.5 shrink-0 ${
                          b.selected ? 'bg-accent-terracotta' : 'bg-surface-dim'
                        }`}
                      />
                    </div>
                    <div>
                      <div
                        className={`font-headline-md text-body-lg font-semibold ${
                          b.selected ? 'text-ink-primary' : 'text-ink-secondary'
                        }`}
                      >
                        {b.title}
                      </div>
                      <div
                        className={`font-body-md text-label-md ${
                          b.selected ? 'text-ink-secondary' : 'text-ink-muted'
                        }`}
                      >
                        {b.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 03. Current Velocity Calibration */}
            <div className="bg-surface-cream p-8 md:p-10 rounded-none flex flex-col gap-6 border border-border-hairline">
              <div className="flex items-baseline justify-between">
                <span className="font-label-lg text-label-lg text-ink-secondary">
                  03 / Reality Bias Factor
                </span>
                <span className="font-label-md text-label-md text-ink-secondary">
                  Self-Reported
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-headline-md text-headline-md text-ink-primary">
                  Current Velocity Calibration
                </h2>
                <p className="font-body-md text-body-md text-ink-secondary">
                  How your actual execution time routinely compares to your initial mental models.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label
                  className={`flex items-start gap-4 p-4 border transition-colors cursor-pointer ${
                    velocityMultiplier === 1.2
                      ? 'bg-surface border-ink-primary'
                      : 'bg-surface/60 border-border-hairline'
                  }`}
                >
                  <input
                    type="radio"
                    name="velocity"
                    value={1.2}
                    checked={velocityMultiplier === 1.2}
                    onChange={() => setVelocityMultiplier(1.2)}
                    className="mt-1 accent-ink-primary"
                  />
                  <div className="flex flex-col">
                    <span className="font-headline-md text-body-lg font-semibold text-ink-primary">
                      I usually underestimate tasks by ~20%
                    </span>
                    <span className="font-body-md text-body-md text-ink-secondary">
                      Radar applies an automated 1.2× safety contingency padding on incoming milestones.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-4 border transition-colors cursor-pointer ${
                    velocityMultiplier === 1.0
                      ? 'bg-surface border-ink-primary'
                      : 'bg-surface/60 border-border-hairline'
                  }`}
                >
                  <input
                    type="radio"
                    name="velocity"
                    value={1.0}
                    checked={velocityMultiplier === 1.0}
                    onChange={() => setVelocityMultiplier(1.0)}
                    className="mt-1 accent-ink-primary"
                  />
                  <div className="flex flex-col">
                    <span className="font-headline-md text-body-lg font-semibold text-ink-primary">
                      My estimates are mostly accurate
                    </span>
                    <span className="font-body-md text-body-md text-ink-secondary">
                      Direct 1:1 scheduling fidelity without default buffer expansion.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-4 border transition-colors cursor-pointer ${
                    velocityMultiplier === 1.35
                      ? 'bg-surface border-ink-primary'
                      : 'bg-surface/60 border-border-hairline'
                  }`}
                >
                  <input
                    type="radio"
                    name="velocity"
                    value={1.35}
                    checked={velocityMultiplier === 1.35}
                    onChange={() => setVelocityMultiplier(1.35)}
                    className="mt-1 accent-ink-primary"
                  />
                  <div className="flex flex-col">
                    <span className="font-headline-md text-body-lg font-semibold text-ink-primary">
                      I take longer on backend / coding tasks
                    </span>
                    <span className="font-body-md text-body-md text-ink-secondary">
                      Applies progressive ramp multipliers on complex technical and debugging phases.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Living Diurnal Rhythm Plate (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-8">
            {/* Live Projection Plate */}
            <div className="bg-ink-primary text-canvas-paper p-8 rounded-none border border-border-hairline flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-surface-dim uppercase tracking-widest">
                    Active Model
                  </span>
                  <span className="font-label-md text-label-md px-2 py-0.5 bg-accent-terracotta text-canvas-paper font-medium">
                    REALISTIC FIT
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="font-label-lg text-label-lg text-surface-tint block">
                    Diurnal Allocation
                  </span>
                  <div className="font-headline-xl text-headline-xl tracking-tight text-canvas-paper">
                    {freeDiscretionary.toFixed(1)} hrs
                  </div>
                  <p className="font-body-md text-body-md text-primary-fixed-dim">
                    Retained weekly for living, resting, thinking, and unscheduled drift.
                  </p>
                </div>

                {/* Proportional Capacity Visualizer */}
                <div className="pt-4 space-y-3">
                  <div className="flex justify-between font-label-md text-label-md text-surface-dim">
                    <span>Cognitive ({capacityHours.toFixed(1)}h)</span>
                    <span>Rest &amp; Life ({lifeReserved.toFixed(1)}h)</span>
                    <span>Margin ({freeDiscretionary.toFixed(1)}h)</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-high flex overflow-hidden">
                    <div
                      className="bg-accent-terracotta h-full transition-all duration-300"
                      style={{ width: `${focusPercent}%` }}
                    />
                    <div
                      className="bg-surface-dim h-full transition-all duration-300"
                      style={{ width: `${lifePercent}%` }}
                    />
                    <div
                      className="bg-surface-tint opacity-40 h-full transition-all duration-300"
                      style={{ width: `${marginPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="w-1.5 h-1.5 inline-block shrink-0 bg-accent-terracotta" />
                    <span className="font-label-md text-label-md text-surface-dim">
                      Focus strain: Low stress baseline
                    </span>
                  </div>
                </div>
              </div>

              {/* Editorial Photography Accent */}
              <div className="pt-8 mt-8 border-t border-white/10">
                <div className="relative overflow-hidden w-full h-44 mb-3">
                  <img
                    src="/assets/onboarding-desk.jpg"
                    alt="Minimalist architectural desk with an analog hourglass"
                    className="w-full h-full object-cover grayscale contrast-125 opacity-85"
                  />
                </div>
                <p className="font-label-md text-label-md text-surface-dim italic">
                  “We overestimate what we can compress into twenty-four hours, and systematically
                  ignore our biology.”
                </p>
              </div>
            </div>

            {/* Action Panel */}
            <div className="bg-surface-cream p-8 rounded-none border border-border-hairline flex flex-col gap-4">
              <button
                type="button"
                onClick={handleComplete}
                className="w-full bg-ink-primary hover:bg-accent-terracotta text-canvas-paper font-label-lg text-label-lg py-4 px-6 flex items-center justify-center gap-3 transition-colors duration-200 cursor-pointer"
              >
                <span>
                  {submitting ? 'Configuring Radar...' : 'Complete Calibration & Open Radar'}
                </span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <Link
                to="/today"
                className="text-center font-label-md text-label-md text-ink-muted hover:text-ink-primary transition-colors duration-150 py-1"
              >
                Skip for now, use default 18.5h baseline
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
