import React from 'react';
import { Link } from 'react-router-dom';
import { CapacityMetric } from '../../services/apiTypes';

interface RadarHeroProps {
  metric: CapacityMetric;
  commitmentsCount?: number;
}

export const RadarHero: React.FC<RadarHeroProps> = ({ metric, commitmentsCount }) => {
  const riskTitle = metric.riskAssessment || (metric.netBufferHours < 0 ? 'Over capacity' : 'Balanced');
  const riskDescription =
    metric.netBufferHours < 0
      ? 'Commitments exceed available focus hours'
      : metric.netBufferHours < 2
      ? 'Tight schedule with minimal reserve'
      : 'Healthy buffer margin preserved';

  return (
    <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start max-w-screen-2xl mx-auto">
        {/* Left Editorial Anchor */}
        <div className="lg:col-span-7 flex flex-col justify-between pr-0 lg:pr-space-md">
          <div>
            <div className="inline-flex items-center gap-space-xs mb-space-md">
              <span className="w-2 h-2 rounded-full bg-accent-terracotta inline-block shrink-0" />
              <span className="font-label-md text-label-md uppercase tracking-widest text-ink-secondary">
                Radar Horizon • Week {metric.weekNumber}
              </span>
            </div>

            <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-ink-primary tracking-tight leading-none mb-space-md">
              Time is moving.
            </h1>

            <p className="font-body-xl text-body-xl text-ink-secondary max-w-xl mb-space-lg leading-relaxed">
              You have{' '}
              <span className="text-ink-primary font-semibold">
                {metric.availableFocusHours.toFixed(1)} hours
              </span>{' '}
              of available focus before the weekend.{' '}
              <span className="text-ink-primary font-semibold">
                {metric.committedWorkHours.toFixed(1)} hours
              </span>{' '}
              of work are committed {commitmentsCount !== undefined ? `across ${commitmentsCount} deadline${commitmentsCount === 1 ? '' : 's'}` : 'across active commitments'}.
            </p>
          </div>

          {/* Quick Summary Metrics Stripe */}
          <div className="bg-surface-container-low p-space-md mt-space-md flex flex-col sm:flex-row items-baseline justify-between gap-space-md">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md w-full items-baseline">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-ink-muted uppercase">
                  Available Time
                </span>
                <div className="flex items-baseline gap-space-xs mt-space-xs">
                  <span className="font-headline-lg text-headline-lg text-ink-primary">
                    {metric.availableFocusHours.toFixed(1)}
                    <span className="text-label-lg text-ink-muted ml-0.5">h</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-ink-muted uppercase">
                  Remaining Work
                </span>
                <div className="flex items-baseline gap-space-xs mt-space-xs">
                  <span className="font-headline-lg text-headline-lg text-ink-primary">
                    {metric.committedWorkHours.toFixed(1)}
                    <span className="text-label-lg text-ink-muted ml-0.5">h</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-ink-muted uppercase">
                  Net Buffer
                </span>
                <div className="flex items-baseline gap-space-xs mt-space-xs">
                  <span className="font-headline-lg text-headline-lg text-ink-primary">
                    {metric.netBufferHours >= 0 ? `+${metric.netBufferHours.toFixed(1)}` : metric.netBufferHours.toFixed(1)}
                    <span className="text-label-lg text-ink-muted ml-0.5">h</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end text-left sm:text-right">
                <span className="font-label-md text-label-md text-ink-muted uppercase">
                  Current Risk
                </span>
                <span className="font-label-lg text-label-lg font-semibold text-accent-terracotta mt-space-xs">
                  {riskTitle}
                </span>
                <span className="font-label-md text-label-md text-ink-secondary mt-0.5">
                  {riskDescription}
                </span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-space-md mt-space-lg">
            <Link
              to="/planning"
              className="inline-flex items-center justify-center bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-lg py-space-sm font-label-lg text-label-lg transition-colors duration-200"
            >
              Review Schedule
            </Link>
            <Link
              to="/work"
              className="inline-flex items-center gap-space-xs font-label-lg text-label-lg text-ink-secondary hover:text-ink-primary transition-colors group"
            >
              <span>View all tasks</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* Right Physical Anchor: Canonical Hourglass Object */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="relative w-full bg-surface-container overflow-hidden">
            <img
              src="/assets/hourglass-temporal.jpg"
              alt="Minimalist hourglass with fine desert sand trickling down through transparent glass resting on travertine marble in quiet natural morning light."
              className="w-full aspect-[4/5] object-cover object-center grayscale contrast-105 hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute bottom-0 inset-x-0 p-space-md bg-gradient-to-t from-ink-primary/80 via-ink-primary/30 to-transparent text-canvas-paper">
              <p className="font-label-md text-label-md uppercase tracking-wider text-canvas-paper/75">
                Temporal Anchor • Reality Metric
              </p>
              <p className="font-body-md text-body-md text-canvas-paper mt-0.5">
                Sand trickles at a constant rate regardless of urgency.
              </p>
            </div>
          </div>
          <div className="pt-space-xs flex justify-between items-center text-ink-muted font-label-md text-label-md">
            <span>HOURLY PACING • REALITY ANCHOR</span>
            <span>CALIBRATED TO THIS WEEK</span>
          </div>
        </div>
      </div>
    </section>
  );
};
