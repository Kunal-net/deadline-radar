import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const AddWorkView: React.FC = () => {
  const navigate = useNavigate();

  const [inputText, setInputText] = useState(
    'Finish Machine Learning assignment by Friday 4:00 PM, requires 3.5 hours of deep focus, dependent on lecture notes review'
  );

  const [confirmed, setConfirmed] = useState(false);
  const [activeTab, setActiveTab] = useState<'SYNTHESIZER' | 'DECOMPOSITION'>('SYNTHESIZER');
  const [subtasks, setSubtasks] = useState([
    { id: '1', title: 'Data preprocessing & baseline loss curves', duration: '60m', checked: true },
    { id: '2', title: 'Model retraining with ResNet backbone & validation', duration: '90m', checked: true },
    { id: '3', title: 'LaTeX write-up, confusion matrix & analysis tables', duration: '60m', checked: true },
  ]);

  // Parsing extraction logic based on the input text
  const parseTitle = () => {
    if (!inputText.trim()) return 'Awaiting plain language expression...';
    if (inputText.toLowerCase().includes('by')) {
      return inputText.split(/by/i)[0].trim();
    }
    return inputText.slice(0, 50);
  };

  const hasDeadline = /(?:by|due|on|before)\s+([a-zA-Z]+|\d+)/i.test(inputText);
  const hasEffort = /(?:\d+(?:\.\d+)?)\s*(?:hour|hr|h|min|minute)/i.test(inputText);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      navigate('/work');
    }, 600);
  };

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, checked: !st.checked } : st))
    );
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-surface">
      {/* Top Section: Asymmetrical Editorial Header */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-space-sm pb-space-md">
          <div className="flex flex-col gap-space-xs max-w-2xl">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 bg-accent-terracotta inline-block shrink-0" />
              <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                Natural Language Intake · Section 06
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight">
              Add Work
            </h1>
            <p className="font-body-lg text-body-lg text-ink-secondary pt-space-xs">
              Describe your commitment in plain language. Deadline Radar will extract deadlines,
              quantify required effort, and verify real-time capacity fit against your calendar truth.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-end">
            <span className="font-label-md text-label-md text-ink-muted">Parsing Engine</span>
            <span className="px-space-xs py-0.5 bg-surface-cream font-label-md text-label-md text-ink-primary font-mono border border-border-hairline">
              Deterministic v2.4
            </span>
          </div>
        </div>
      </section>

      {/* Main Editorial Split Layout */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-2xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Primary Intake Column (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Natural Language Input Area */}
            <div className="bg-canvas-paper p-space-md lg:p-space-lg border border-border-hairline">
              <div className="flex items-center justify-between pb-space-sm">
                <label
                  htmlFor="intake-input"
                  className="font-label-lg text-label-lg text-ink-primary uppercase tracking-wider flex items-center gap-space-xs"
                >
                  <span className="material-symbols-outlined text-[18px] text-accent-terracotta">
                    edit_note
                  </span>
                  <span>Unstructured Intent</span>
                  <span className="text-[10px] font-mono bg-surface-cream text-ink-muted px-1 py-0.5 ml-1 border border-border-hairline">
                    USER INPUT
                  </span>
                </label>
                <span className="font-label-md text-label-md text-ink-muted">
                  Auto-interpreting syntax
                </span>
              </div>

              <div className="relative py-space-xs">
                <textarea
                  id="intake-input"
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="What are you committing to?"
                  className="w-full bg-transparent font-headline-md text-headline-md text-ink-primary placeholder:text-ink-muted/50 focus:outline-none resize-none leading-relaxed transition-colors border-b border-border-hairline"
                />
                <div className="h-0.5 w-full bg-surface-tint mt-space-xs relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-accent-terracotta" />
                </div>
              </div>

              {/* Missing Information Detection Callouts */}
              {!hasDeadline && inputText.trim() && (
                <div className="mt-space-xs p-space-xs bg-surface-cream border border-accent-terracotta/40 text-accent-terracotta flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>Missing information: No explicit deadline detected. Suggesting default Friday horizon or add &quot;by [day]&quot;.</span>
                </div>
              )}
              {!hasEffort && inputText.trim() && (
                <div className="mt-space-xs p-space-xs bg-surface-cream border border-border-hairline text-ink-secondary flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px]">help_outline</span>
                  <span>Effort unspecified: Defaulting to 2.0h estimated focus block.</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-sm text-ink-muted">
                <div className="flex items-center gap-space-xs font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px] text-ink-muted">bolt</span>
                  <span>Extracts: Milestones, Duration, Schedule Windows, Blockers</span>
                </div>
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="font-label-md text-label-md text-ink-secondary hover:text-accent-terracotta transition-colors cursor-pointer"
                >
                  Reset Expression
                </button>
              </div>
            </div>

            {/* Real-Time Synthesized Output Block */}
            <div className="bg-surface-cream p-space-md lg:p-space-lg flex flex-col gap-space-md border border-border-hairline">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
                    <span className="font-label-lg text-label-lg uppercase tracking-wider text-ink-primary font-semibold">
                      Structural Synthesizer
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-canvas-paper text-accent-terracotta px-1 py-0.5 border border-border-hairline">
                    AI INTERPRETATION
                  </span>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1 bg-surface-tint p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('SYNTHESIZER')}
                    className={`px-2 py-0.5 text-xs font-label-md ${
                      activeTab === 'SYNTHESIZER'
                        ? 'bg-canvas-paper text-ink-primary font-semibold shadow-xs'
                        : 'text-ink-muted hover:text-ink-primary'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('DECOMPOSITION')}
                    className={`px-2 py-0.5 text-xs font-label-md ${
                      activeTab === 'DECOMPOSITION'
                        ? 'bg-canvas-paper text-ink-primary font-semibold shadow-xs'
                        : 'text-ink-muted hover:text-ink-primary'
                    }`}
                  >
                    Decomposition ({subtasks.length})
                  </button>
                </div>
              </div>

              {activeTab === 'SYNTHESIZER' ? (
                /* Structured Interpretation Breakdown */
                <div className="flex flex-col gap-space-md bg-canvas-paper p-space-md border border-border-hairline divide-y divide-border-hairline">
                  {/* Detected Title */}
                  <div className="flex flex-col md:flex-row md:items-baseline gap-space-xs md:gap-space-md pb-space-xs">
                    <span className="w-36 shrink-0 font-label-md text-label-md uppercase tracking-wide text-ink-muted">
                      Work Item
                    </span>
                    <div className="flex-1">
                      <span className="font-headline-md text-headline-md text-ink-primary block">
                        {parseTitle()}
                      </span>
                      <span className="font-body-md text-body-md text-ink-secondary mt-0.5 block">
                        Academic / Computational Deliverable
                      </span>
                    </div>
                  </div>

                  {/* Target Deadline */}
                  <div className="flex flex-col md:flex-row md:items-baseline gap-space-xs md:gap-space-md pt-space-xs pb-space-xs">
                    <span className="w-36 shrink-0 font-label-md text-label-md uppercase tracking-wide text-ink-muted">
                      Target Deadline
                    </span>
                    <div className="flex-1 flex flex-wrap items-center gap-space-sm">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[18px] text-ink-primary">
                          event_upcoming
                        </span>
                        <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                          Friday, Oct 20 · 16:00
                        </span>
                      </div>
                      <span className="px-space-xs py-0.5 bg-surface-cream font-label-md text-label-md text-accent-terracotta font-medium border border-border-hairline">
                        In 2.5 days
                      </span>
                    </div>
                  </div>

                  {/* Estimated Effort */}
                  <div className="flex flex-col md:flex-row md:items-baseline gap-space-xs md:gap-space-md pt-space-xs pb-space-xs">
                    <span className="w-36 shrink-0 font-label-md text-label-md uppercase tracking-wide text-ink-muted">
                      Estimated Effort
                    </span>
                    <div className="flex-1 flex items-center justify-between flex-wrap gap-space-xs">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[18px] text-ink-primary">
                          timer
                        </span>
                        <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                          3.5 Hours Deep Focus
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-ink-secondary font-label-md text-label-md">
                        <span className="w-1.5 h-1.5 bg-ink-primary inline-block" />
                        <span>Confidence: High (94%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Audit */}
                  <div className="flex flex-col md:flex-row md:items-baseline gap-space-xs md:gap-space-md pt-space-xs pb-space-xs">
                    <div className="w-36 shrink-0 flex flex-col">
                      <span className="font-label-md text-label-md uppercase tracking-wide text-ink-muted">
                        Capacity Audit
                      </span>
                      <span className="text-[10px] font-mono text-ink-muted">
                        SYSTEM DATA
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-space-xs">
                      <div className="p-space-xs bg-surface-container-low flex items-start gap-space-xs border border-border-hairline">
                        <span className="material-symbols-outlined text-[18px] text-accent-terracotta mt-0.5 shrink-0">
                          verified
                        </span>
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg text-ink-primary font-medium">
                            Fits Friday Morning Focus Window (09:30–13:00)
                          </span>
                          <span className="font-body-md text-body-md text-ink-secondary">
                            Leaves +1.0 hour safety margin prior to departmental seminar.
                          </span>
                        </div>
                      </div>

                      <div className="mt-space-xs flex flex-col gap-1">
                        <div className="flex justify-between font-label-md text-label-md text-ink-muted">
                          <span>Friday Block Allocation</span>
                          <span>3.5h / 4.5h available</span>
                        </div>
                        <div className="h-2 w-full bg-surface-dim flex overflow-hidden">
                          <div className="h-full bg-ink-primary" style={{ width: '77.7%' }} />
                          <div className="h-full bg-accent-terracotta/40" style={{ width: '22.3%' }} />
                        </div>
                        <div className="flex justify-between font-label-md text-label-md text-ink-muted">
                          <span className="text-ink-primary font-medium">■ 3.5h Work Session</span>
                          <span className="text-accent-terracotta">■ 1.0h Contingency</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dependency Chain */}
                  <div className="flex flex-col md:flex-row md:items-baseline gap-space-xs md:gap-space-md pt-space-xs">
                    <span className="w-36 shrink-0 font-label-md text-label-md uppercase tracking-wide text-ink-muted">
                      Dependency Chain
                    </span>
                    <div className="flex-1 flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px] text-ink-secondary">
                        account_tree
                      </span>
                      <span className="font-body-md text-body-md text-ink-primary">
                        Linked to{' '}
                        <strong className="font-semibold">Review Lecture Notes</strong> (Scheduled
                        Thursday Oct 19, 14:00)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Decomposition View */
                <div className="flex flex-col gap-space-xs bg-canvas-paper p-space-md border border-border-hairline">
                  <div className="flex items-center justify-between pb-space-xs border-b border-border-hairline mb-2">
                    <span className="font-label-md text-label-md text-ink-muted uppercase">
                      Decomposed Focus Units
                    </span>
                    <span className="font-mono text-xs text-ink-secondary">
                      Total: 3.5 hrs (210m)
                    </span>
                  </div>

                  {subtasks.map((st, index) => (
                    <div
                      key={st.id}
                      onClick={() => toggleSubtask(st.id)}
                      className="p-space-xs hover:bg-surface-cream transition-colors flex items-center justify-between border-b border-border-hairline/60 cursor-pointer"
                    >
                      <div className="flex items-center gap-space-xs">
                        <input
                          type="checkbox"
                          checked={st.checked}
                          onChange={() => {}}
                          className="accent-ink-primary cursor-pointer"
                        />
                        <span className="font-mono text-xs text-ink-muted">0{index + 1}.</span>
                        <span className={`font-body-md text-body-md text-ink-primary ${!st.checked ? 'line-through text-ink-muted' : ''}`}>
                          {st.title}
                        </span>
                      </div>
                      <span className="font-mono text-xs bg-surface-cream px-2 py-0.5 text-ink-secondary border border-border-hairline shrink-0">
                        {st.duration}
                      </span>
                    </div>
                  ))}
                  <p className="pt-space-xs font-label-md text-label-md text-ink-muted italic">
                    AI suggests breaking this deliverable into structured cognitive chunks to prevent overwhelm.
                  </p>
                </div>
              )}

              {/* Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-wrap items-center gap-space-sm">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleConfirm}
                    icon={<span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
                  >
                    {confirmed ? 'Scheduling Commitment...' : 'Confirm & Schedule Block'}
                  </Button>
                  <Button variant="outline" size="md" onClick={() => navigate('/work')}>
                    Edit Parameters
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/work')}
                  className="font-label-lg text-label-lg text-ink-secondary hover:text-ink-primary transition-colors py-space-xs"
                >
                  Cancel Intake
                </button>
              </div>
            </div>
          </div>

          {/* Supporting Side Panel (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Canonical Imagery Plate */}
            <div className="bg-canvas-paper p-space-md border border-border-hairline flex flex-col">
              <div className="w-full aspect-[4/3] overflow-hidden bg-surface-tint border border-border-hairline">
                <img
                  src="/assets/addwork-hands.jpg"
                  alt="Editorial overhead photograph of hands typing focused on laptop"
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="pt-space-sm flex items-start justify-between gap-space-xs">
                <span className="font-label-md text-label-md text-ink-muted">
                  Figure 06.1 — The Art of Intentional Pacing
                </span>
                <span className="font-label-md text-label-md text-accent-terracotta font-semibold">
                  Live Workspace
                </span>
              </div>
              <p className="font-body-md text-body-md text-ink-secondary pt-space-xs">
                &ldquo;Intentional intake preserves calendar integrity. Overcommitting in haste steals
                focus from active execution.&rdquo;
              </p>
            </div>

            {/* Recent Commitments Parsed Module */}
            <div className="bg-canvas-paper p-space-md border border-border-hairline flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-xs border-b border-border-hairline">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                    Audit Trail
                  </span>
                  <h3 className="font-headline-md text-headline-md text-ink-primary">
                    Recent Commitments Parsed
                  </h3>
                </div>
                <Link
                  to="/work"
                  className="font-label-md text-label-md text-accent-terracotta hover:underline"
                >
                  View Journal
                </Link>
              </div>

              <div className="flex flex-col divide-y divide-border-hairline">
                <div className="py-space-sm hover:bg-surface-cream px-space-xs transition-colors">
                  <div className="flex items-baseline justify-between gap-space-xs">
                    <span className="font-label-lg text-label-lg font-semibold text-ink-primary truncate">
                      Q3 Capital Allocation Memo
                    </span>
                    <span className="font-label-md text-label-md text-ink-muted shrink-0">
                      Today 18:00
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 font-body-md text-body-md text-ink-secondary">
                    <span>2.0 hrs deep work</span>
                    <span className="text-ink-primary font-medium text-[13px] bg-surface-tint px-1.5 py-0.5">
                      Sufficient Margin (+1.5h)
                    </span>
                  </div>
                </div>

                <div className="py-space-sm hover:bg-surface-cream px-space-xs transition-colors">
                  <div className="flex items-baseline justify-between gap-space-xs">
                    <span className="font-label-lg text-label-lg font-semibold text-ink-primary truncate">
                      Quarterly Client Synthesis Review
                    </span>
                    <span className="font-label-md text-label-md text-ink-muted shrink-0">
                      Tomorrow 11:30
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 font-body-md text-body-md text-ink-secondary">
                    <span>1.5 hrs review</span>
                    <span className="text-accent-terracotta font-medium text-[13px] bg-secondary-fixed/50 px-1.5 py-0.5">
                      Tight Window (0.2h)
                    </span>
                  </div>
                </div>

                <div className="py-space-sm hover:bg-surface-cream px-space-xs transition-colors">
                  <div className="flex items-baseline justify-between gap-space-xs">
                    <span className="font-label-lg text-label-lg font-semibold text-ink-primary truncate">
                      System Architecture Documentation
                    </span>
                    <span className="font-label-md text-label-md text-ink-muted shrink-0">
                      Oct 23 · 12:00
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 font-body-md text-body-md text-ink-secondary">
                    <span>4.0 hrs technical writing</span>
                    <span className="text-ink-primary font-medium text-[13px] bg-surface-tint px-1.5 py-0.5">
                      Protected Block Set
                    </span>
                  </div>
                </div>
              </div>

              {/* Saturation widget */}
              <div className="p-space-sm bg-surface-cream flex items-center justify-between gap-space-sm border border-border-hairline">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[20px] text-ink-primary">
                    pie_chart
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-ink-primary">
                      Week 42 Saturation
                    </span>
                    <span className="font-label-md text-label-md text-ink-secondary">
                      27.5 of 32.0 hours allocated
                    </span>
                  </div>
                </div>
                <span className="font-headline-md text-headline-md text-ink-primary">86%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
