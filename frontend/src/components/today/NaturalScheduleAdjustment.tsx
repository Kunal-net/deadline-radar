import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const NaturalScheduleAdjustment: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [statusState, setStatusState] = useState<'idle' | 'parsing' | 'committed'>('idle');
  const [committedText, setCommittedText] = useState('');
  const timerRef = useRef<number | null>(null);

  const setTodayAdjustmentNote = useAppStore((state) => state.setTodayAdjustmentNote);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.trim().length > 5) {
      setStatusState('parsing');
    } else {
      setStatusState('idle');
    }
  };

  const handleConfirm = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setCommittedText(text);
    setStatusState('committed');
    setInputValue('');
    setTodayAdjustmentNote(text);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setStatusState('idle');
    }, 4500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <section
      aria-label="Natural Schedule Adjustment"
      className="w-full py-space-2xl px-margin-mobile md:px-margin-tablet lg:px-margin"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-space-sm pb-space-xl">
        {/* Header Label */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="naturalAdjustmentInput"
            className="font-label-lg text-label-lg uppercase tracking-wider text-ink-primary flex items-center gap-space-xs cursor-pointer"
          >
            <span
              className="w-2 h-2 bg-accent-terracotta inline-block shrink-0"
              aria-hidden="true"
            />
            Need to adjust today?
          </label>
          <span className="font-label-md text-label-md text-ink-muted">
            Quick Schedule Update
          </span>
        </div>

        {/* Input & Action Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm pt-space-xs">
          <div className="relative flex-1">
            <input
              id="naturalAdjustmentInput"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Shift deep work block to afternoon, protect evening buffer..."
              className="w-full bg-surface-cream border border-border-hairline px-space-md py-space-sm font-body-md text-body-md text-ink-primary placeholder:text-ink-muted/60 focus:outline-none focus:border-ink-primary transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-lg py-space-sm font-label-lg text-label-lg flex items-center justify-center gap-space-xs transition-colors duration-150 shrink-0"
          >
            <span>Update</span>
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              arrow_forward
            </span>
          </button>
        </div>

        {/* Dynamic Parsing & Commitment Feedback */}
        <div
          id="parsingFeedback"
          role="status"
          aria-live="polite"
          className="flex items-center justify-between text-ink-muted font-body-md text-body-md pt-space-xs min-h-[24px]"
        >
          {statusState === 'committed' ? (
            <>
              <span className="flex items-center gap-space-xs text-ink-primary">
                <span
                  className="material-symbols-outlined text-[16px] text-status-alert"
                  aria-hidden="true"
                >
                  check
                </span>
                Committed: &ldquo;{committedText}&rdquo;. Schedule balanced.
              </span>
              <span className="font-label-md text-label-md text-ink-muted">Saved</span>
            </>
          ) : statusState === 'parsing' ? (
            <>
              <span className="flex items-center gap-space-xs text-ink-primary font-medium">
                <span
                  className="w-2 h-2 bg-accent-terracotta inline-block shrink-0"
                  aria-hidden="true"
                />
                Parsed Intent: Adjusting commitments · Remaining focus adjusted
              </span>
              <button
                type="button"
                onClick={handleConfirm}
                className="font-label-md text-label-md text-accent-terracotta hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Confirm Change →
              </button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-space-xs text-ink-secondary text-label-md">
                <span
                  className="material-symbols-outlined text-[16px] text-ink-muted"
                  aria-hidden="true"
                >
                  schedule
                </span>
                Automatically recomputes your focus envelopes without guilt.
              </span>
              <span className="font-label-md text-label-md text-ink-muted hidden sm:inline">
                Press [Enter] to submit
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
