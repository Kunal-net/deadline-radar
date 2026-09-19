import React, { useState } from 'react';
import clsx from 'clsx';

export interface NaturalLanguageInputProps {
  label?: string;
  placeholder?: string;
  onSubmit?: (value: string) => void;
  helperText?: string;
  className?: string;
}

export const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
  label = 'Natural Language Intake',
  placeholder = 'e.g. Finish Machine Learning assignment by Friday 4:00 PM (3.5h effort)...',
  onSubmit,
  helperText = 'Extracts deadlines, effort requirements, and capacity fit automatically.',
  className,
}) => {
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputId = React.useId();
  const helperId = `${inputId}-helper`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    const query = value.trim();
    setFeedback(`Parsing commitment: "${query}"...`);

    if (onSubmit) {
      onSubmit(query);
    }

    setTimeout(() => {
      setValue('');
      setFeedback(`Commitment registered. Schedule balanced.`);
      setTimeout(() => setFeedback(null), 4000);
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className={clsx('w-full flex flex-col gap-space-xs', className)}>
      {label && (
        <div className="flex items-center gap-space-xs">
          <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block shrink-0" />
          <label
            htmlFor={inputId}
            className="font-label-md text-label-md font-medium text-ink-muted cursor-pointer"
          >
            {label}
          </label>
        </div>
      )}

      <div className="relative flex items-center border-b-2 border-ink-primary transition-colors focus-within:border-accent-terracotta">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-describedby={helperId}
          className="w-full bg-transparent py-space-sm pr-32 text-headline-md font-headline-md text-ink-primary placeholder:text-ink-muted/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="absolute right-0 text-ink-primary hover:text-accent-terracotta font-label-lg text-label-lg font-medium transition-colors disabled:opacity-30 disabled:hover:text-ink-primary"
        >
          Parse &amp; Anchor →
        </button>
      </div>

      <div id={helperId} className="flex items-center justify-between text-ink-muted font-body-md text-body-md pt-space-xs">
        <span>{feedback || helperText}</span>
        <span className="font-label-md text-label-md text-ink-muted hidden sm:inline">
          Press [Enter]
        </span>
      </div>
    </form>
  );
};
