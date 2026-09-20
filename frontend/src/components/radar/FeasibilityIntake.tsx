import React, { useState } from 'react';
import { useAIInterpretation } from '../../services/apiHooks';

interface FeasibilityIntakeProps {
  availableBufferHours?: number;
}

export const FeasibilityIntake: React.FC<FeasibilityIntakeProps> = ({
  availableBufferHours = 4.0,
}) => {
  const [query, setQuery] = useState('');
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isFeasible, setIsFeasible] = useState<boolean | null>(null);
  const interpretMutation = useAIInterpretation();

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setResultMessage(null);

    let requestedHours = 3.0;
    let parsedTitle = trimmed;

    try {
      const aiResult = await interpretMutation.mutateAsync(trimmed);
      if (aiResult.estimated_hours && aiResult.estimated_hours > 0) {
        requestedHours = aiResult.estimated_hours;
      }
      if (aiResult.title) {
        parsedTitle = aiResult.title;
      }
    } catch {
      // Deterministic fallback regex if offline or API unavailable
      const match = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|h)/i);
      if (match) requestedHours = parseFloat(match[1]);
    }

    const remaining = availableBufferHours - requestedHours;
    if (remaining >= 0) {
      setIsFeasible(true);
      setResultMessage(
        `Feasible ("${parsedTitle}"): Absorbs ${requestedHours.toFixed(1)}h of available focus buffer. Safe remaining horizon reserve: +${remaining.toFixed(1)}h.`
      );
    } else {
      setIsFeasible(false);
      setResultMessage(
        `Capacity Deficit ("${parsedTitle}"): Requires ${requestedHours.toFixed(1)}h, exceeding current buffer by ${Math.abs(remaining).toFixed(1)}h. Requires rescheduling lower-priority commitments.`
      );
    }
  };

  const isEvaluating = interpretMutation.isPending;

  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-2xl">
      <div className="max-w-screen-xl mx-auto pt-space-lg border-t border-border-hairline">
        <div className="max-w-2xl">
          <label
            htmlFor="work-quick-add"
            className="font-label-md text-label-md text-ink-muted uppercase tracking-wider block mb-space-xs"
          >
            Check Deadline Feasibility
          </label>

          <form onSubmit={handleEvaluate} className="relative">
            <input
              id="work-quick-add"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isEvaluating}
              placeholder="e.g. Take on 4-hour freelance project due Monday..."
              className="w-full bg-transparent border-b-2 border-ink-primary py-space-sm text-headline-md font-headline-md text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent-terracotta transition-colors pr-36"
            />
            <button
              type="submit"
              disabled={isEvaluating || !query.trim()}
              className="absolute right-0 bottom-3 text-ink-primary hover:text-accent-terracotta font-label-lg text-label-lg font-semibold uppercase tracking-wider transition-colors disabled:opacity-40"
            >
              {isEvaluating ? 'Evaluating...' : 'Parse & Anchor →'}
            </button>
          </form>

          {resultMessage ? (
            <div
              className={`mt-space-sm p-space-sm border ${
                isFeasible
                  ? 'bg-surface-cream border-border-hairline text-ink-primary'
                  : 'bg-surface-container border-accent-terracotta/40 text-accent-terracotta'
              } flex items-start gap-space-xs transition-all`}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                {isFeasible ? 'check_circle' : 'warning'}
              </span>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold">
                  Deterministic Feasibility Assessment
                </span>
                <span className="font-body-md text-body-md mt-0.5">{resultMessage}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-space-md mt-space-xs text-ink-secondary font-label-md text-label-md">
              <span>Tests if your available focus buffers can safely accommodate new work without risk.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
