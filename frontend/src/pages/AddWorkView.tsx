import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  useAIInterpretation,
  useAIDecomposition,
  useAIEffortEstimate,
  useCreateWorkItem,
  useWorkItems,
} from '../services/apiHooks';
import type { AIInterpretationResult } from '../services/apiTypes';

export const AddWorkView: React.FC = () => {
  const navigate = useNavigate();

  const [inputText, setInputText] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [activeTab, setActiveTab] = useState<'SYNTHESIZER' | 'DECOMPOSITION'>('SYNTHESIZER');
  
  // Real AI Mutations
  const interpretMutation = useAIInterpretation();
  const decomposeMutation = useAIDecomposition();
  const effortMutation = useAIEffortEstimate();
  const createMutation = useCreateWorkItem();
  const { data: recentWorkItems = [] } = useWorkItems();

  // Active AI interpretation state with clean initial state
  const [aiInterpretation, setAiInterpretation] = useState<AIInterpretationResult>({
    title: '',
    category: 'Project',
    deadline_utc: '',
    is_hard_deadline: false,
    estimated_hours: 0,
    constraints: [],
    suggested_subtasks: [],
    missing_information: [],
    confidence_score: 0.0,
  });

  const [subtasks, setSubtasks] = useState<{ id: string; title: string; duration: string; checked: boolean }[]>([]);

  // Parsing extraction logic
  const displayTitle = aiInterpretation?.title || (inputText.trim() ? inputText.split(/by/i)[0].trim() : 'Awaiting plain language expression...');
  const hasDeadline = !!aiInterpretation?.deadline_utc || /(?:by|due|on|before)\s+([a-zA-Z]+|\d+)/i.test(inputText);
  const hasEffort = (aiInterpretation?.estimated_hours ?? 0) > 0 || /(?:\d+(?:\.\d+)?)\s*(?:hour|hr|h|min|minute)/i.test(inputText);

  const handleInterpret = async () => {
    if (!inputText.trim()) return;
    try {
      const res = await interpretMutation.mutateAsync(inputText);
      setAiInterpretation(res);
    } catch {
      // Graceful fallback already provided by hook
    }
  };

  const handleDecompose = async () => {
    try {
      const res = await decomposeMutation.mutateAsync({
        title: displayTitle,
        category: aiInterpretation?.category,
        description: inputText,
      });
      if (res.suggested_units && res.suggested_units.length > 0) {
        setSubtasks(
          res.suggested_units.map((u, i) => ({
            id: String(i + 1),
            title: u.title,
            duration: `${Math.round(u.estimated_hours * 60)}m`,
            checked: true,
          }))
        );
      }
      setActiveTab('DECOMPOSITION');
    } catch {
      setActiveTab('DECOMPOSITION');
    }
  };

  const handleEstimateEffort = async () => {
    try {
      const res = await effortMutation.mutateAsync({
        title: displayTitle,
        category: aiInterpretation?.category || 'Academic',
        description: inputText,
      });
      setAiInterpretation((prev) => ({
        ...prev,
        estimated_hours: res.estimated_hours,
        confidence_score: res.confidence_score,
        constraints: [...(prev.constraints || []), res.reasoning],
      }));
    } catch {
      // Fallback
    }
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    setErrorMessage(null);
    try {
      const checkedUnits = subtasks
        .filter((st) => st.checked)
        .map((st) => {
          const minsMatch = st.duration.match(/(\d+)/);
          const mins = minsMatch ? parseInt(minsMatch[1], 10) : 60;
          return {
            title: st.title,
            estimated_hours: Math.max(0.1, Number((mins / 60).toFixed(2))),
          };
        });

      let deadline = aiInterpretation?.deadline_utc;
      if (!deadline || isNaN(new Date(deadline).getTime())) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 2);
        deadline = targetDate.toISOString();
      }

      const rawCat = (aiInterpretation?.category || 'academic').toLowerCase();
      const cat = rawCat.includes('proj')
        ? 'project'
        : rawCat.includes('exam')
        ? 'exam_prep'
        : rawCat.includes('career')
        ? 'career'
        : rawCat.includes('personal')
        ? 'personal'
        : 'academic';

      await createMutation.mutateAsync({
        title: displayTitle,
        category: cat.toUpperCase() as any,
        estimatedEffortHours: aiInterpretation?.estimated_hours || 3.5,
        remainingEffortHours: aiInterpretation?.estimated_hours || 3.5,
        actualLoggedHours: 0,
        deadlineUtc: deadline,
        isHardDeadline: aiInterpretation?.is_hard_deadline ?? true,
        riskLevel: 'SAFE',
        initial_units: checkedUnits.length > 0 ? checkedUnits : undefined,
      });

      setConfirmed(true);
      setTimeout(() => {
        navigate('/work');
      }, 300);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to persist work item. Please verify details and retry.');
    }
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
                <div className="flex items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={handleInterpret}
                    disabled={interpretMutation.isPending}
                    className="px-space-xs py-0.5 bg-surface-cream hover:bg-surface-tint font-label-md text-label-md text-ink-primary border border-border-hairline transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                    <span>{interpretMutation.isPending ? 'Synthesizing...' : 'Interpret Intent'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="font-label-md text-label-md text-ink-secondary hover:text-accent-terracotta transition-colors cursor-pointer px-1"
                  >
                    Reset
                  </button>
                </div>
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
                        {displayTitle}
                      </span>
                      <span className="font-body-md text-body-md text-ink-secondary mt-0.5 block">
                        {aiInterpretation.category || 'General Deliverable'}
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
                          {aiInterpretation.deadline_utc || 'Flexible horizon target'}
                        </span>
                      </div>
                      <span className="px-space-xs py-0.5 bg-surface-cream font-label-md text-label-md text-accent-terracotta font-medium border border-border-hairline">
                        Estimated Target
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
                          {aiInterpretation.estimated_hours > 0
                            ? `${aiInterpretation.estimated_hours.toFixed(1)} Hours Deep Focus`
                            : 'Awaiting estimation'}
                        </span>
                        <button
                          type="button"
                          onClick={handleEstimateEffort}
                          disabled={effortMutation.isPending}
                          className="ml-2 text-xs font-mono text-ink-secondary hover:text-ink-primary underline cursor-pointer"
                        >
                          {effortMutation.isPending ? 'Estimating...' : 'Recalibrate Effort'}
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-ink-secondary font-label-md text-label-md">
                        <span className="w-1.5 h-1.5 bg-ink-primary inline-block" />
                        <span>
                          {aiInterpretation.confidence_score > 0
                            ? `Confidence: ${Math.round(aiInterpretation.confidence_score * 100)}%`
                            : 'Pending intake'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Model Assumptions & Provenance Notice */}
                  {aiInterpretation.constraints && aiInterpretation.constraints.length > 0 && (
                    <div className="pt-space-xs pb-space-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md uppercase tracking-wide text-ink-muted">
                          AI Model Assumptions &amp; Constraints
                        </span>
                        <span className="text-[10px] font-mono text-ink-muted">
                          REQUIRES CONFIRMATION
                        </span>
                      </div>
                      <ul className="text-xs text-ink-secondary list-disc pl-4 space-y-0.5">
                        {aiInterpretation.constraints.map((asm: string, idx: number) => (
                          <li key={idx}>{asm}</li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-ink-muted pt-1 italic">
                        Heuristic projection based on syntax. Never saved as truth without your confirmation.
                      </p>
                    </div>
                  )}

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
                            {aiInterpretation.estimated_hours > 0
                              ? `Requires ${aiInterpretation.estimated_hours.toFixed(1)}h focus allocation`
                              : 'Awaiting intent to evaluate capacity requirements'}
                          </span>
                          <span className="font-body-md text-body-md text-ink-secondary">
                            {aiInterpretation.deadline_utc
                              ? `Target deadline: ${aiInterpretation.deadline_utc}`
                              : 'Protects personal boundaries and deliberate offline buffers.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Decomposition View */
                <div className="flex flex-col gap-space-xs bg-canvas-paper p-space-md border border-border-hairline">
                  <div className="flex items-center justify-between pb-space-xs border-b border-border-hairline mb-2">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-ink-muted uppercase">
                        Decomposed Focus Units
                      </span>
                      <span className="text-[10px] font-mono bg-surface-cream text-ink-secondary px-1 py-0.5 border border-border-hairline">
                        AI DECOMPOSITION
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDecompose}
                      disabled={decomposeMutation.isPending}
                      className="px-2 py-0.5 bg-surface-cream hover:bg-surface-tint font-label-md text-label-md text-ink-primary border border-border-hairline transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">splitscreen</span>
                      <span>{decomposeMutation.isPending ? 'Decomposing...' : 'Auto-Decompose with AI'}</span>
                    </button>
                  </div>

                  {subtasks.length === 0 ? (
                    <div className="py-space-md text-center text-ink-muted font-body-md text-sm">
                      No subtasks decomposed yet. Type your commitment intent above and click &quot;Auto-Decompose with AI&quot;.
                    </div>
                  ) : (
                    subtasks.map((st, index) => (
                      <div
                        key={st.id}
                        className="p-space-xs hover:bg-surface-cream transition-colors flex items-center justify-between border-b border-border-hairline/60"
                      >
                        <div className="flex items-center gap-space-xs flex-1">
                          <input
                            id={`subtask-check-${st.id}`}
                            type="checkbox"
                            checked={st.checked}
                            onChange={() => toggleSubtask(st.id)}
                            aria-label={`Include subtask: ${st.title}`}
                            className="accent-ink-primary cursor-pointer w-4 h-4 rounded-none focus-visible:ring-1 focus-visible:ring-ink-primary"
                          />
                          <label
                            htmlFor={`subtask-check-${st.id}`}
                            className="flex items-center gap-space-xs cursor-pointer flex-1"
                          >
                            <span className="font-mono text-xs text-ink-muted select-none">0{index + 1}.</span>
                            <span className={`font-body-md text-body-md text-ink-primary ${!st.checked ? 'line-through text-ink-muted' : ''}`}>
                              {st.title}
                            </span>
                          </label>
                        </div>
                        <span className="font-mono text-xs bg-surface-cream px-2 py-0.5 text-ink-secondary border border-border-hairline shrink-0 select-none">
                          {st.duration}
                        </span>
                      </div>
                    ))
                  )}
                  <p className="pt-space-xs font-label-md text-label-md text-ink-muted italic">
                    AI suggests breaking this deliverable into structured cognitive chunks to prevent overwhelm.
                  </p>
                </div>
              )}


              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-accent-terracotta/10 border border-accent-terracotta/30 text-accent-terracotta font-body-md text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-wrap items-center gap-space-sm">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleConfirm}
                    disabled={createMutation.isPending || confirmed}
                    icon={<span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
                  >
                    {createMutation.isPending || confirmed ? 'Scheduling Commitment...' : 'Confirm & Schedule Block'}
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
                {recentWorkItems.length === 0 ? (
                  <div className="py-space-md text-center flex flex-col items-center">
                    <span className="material-symbols-outlined text-[24px] text-ink-muted/50 mb-1">
                      inbox
                    </span>
                    <p className="font-body-md text-body-md text-ink-muted">
                      No commitments recorded yet.
                    </p>
                  </div>
                ) : (
                  recentWorkItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="py-space-sm hover:bg-surface-cream px-space-xs transition-colors"
                    >
                      <div className="flex items-baseline justify-between gap-space-xs">
                        <span className="font-label-lg text-label-lg font-semibold text-ink-primary truncate">
                          {item.title}
                        </span>
                        <span className="font-label-md text-label-md text-ink-muted shrink-0">
                          {item.deadlineUtc
                            ? new Date(item.deadlineUtc).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'No deadline'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 font-body-md text-body-md text-ink-secondary">
                        <span>{item.estimatedEffortHours || 0} hrs {item.category ? item.category.toLowerCase() : 'work'}</span>
                        <span className="text-ink-primary font-medium text-[13px] bg-surface-tint px-1.5 py-0.5">
                          {item.status === 'COMPLETED' ? 'Completed' : (item.riskLevel ? `${item.riskLevel} Risk` : 'Active')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Saturation widget */}
              <div className="p-space-sm bg-surface-cream flex items-center justify-between gap-space-sm border border-border-hairline">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[20px] text-ink-primary">
                    pie_chart
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-ink-primary">
                      Current Workload
                    </span>
                    <span className="font-label-md text-label-md text-ink-secondary">
                      {recentWorkItems.filter(i => i.status !== 'COMPLETED').reduce((acc, i) => acc + (i.estimatedEffortHours || 0), 0).toFixed(1)} hrs committed
                    </span>
                  </div>
                </div>
                <span className="font-headline-md text-headline-md text-ink-primary">
                  {recentWorkItems.length > 0
                    ? `${Math.min(100, Math.round((recentWorkItems.filter(i => i.status !== 'COMPLETED').reduce((acc, i) => acc + (i.estimatedEffortHours || 0), 0) / 35) * 100))}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
