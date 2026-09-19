import React from 'react';
import { NaturalLanguageInput } from '../components/ui/NaturalLanguageInput';

export const AddWorkView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-4xl mx-auto flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 bg-accent-terracotta inline-block" />
            <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
              Work Intake &amp; AI Decomposition
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary">
            Add Work
          </h1>
          <p className="font-body-lg text-body-lg text-ink-secondary">
            Describe your commitment in plain language. Deadline Radar extracts milestones, quantifies required effort, and tests capacity feasibility against your calendar truth.
          </p>
        </div>

        <div className="bg-surface-cream p-space-md lg:p-space-lg">
          <NaturalLanguageInput
            label="Unstructured Intent"
            placeholder="Finish Machine Learning assignment by Friday 4:00 PM, requires 3.5 hours of deep focus..."
            helperText="Extracts: Milestones, Duration, Schedule Envelopes, Blockers"
          />
        </div>
      </div>
    </div>
  );
};
