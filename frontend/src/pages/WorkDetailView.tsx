import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SubNavigation } from '../components/layout/SubNavigation';
import { Button } from '../components/ui/Button';
import {
  useWorkItem,
  useWorkUnits,
  useWorkExplanation,
  useUpdateWorkItem,
  useDeleteWorkItem,
  useActiveSessionTracking,
} from '../services/apiHooks';
import type { WorkUnit } from '../services/apiTypes';

export const WorkDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: item, isLoading, isError, refetch } = useWorkItem(id);
  const { data: units = [], createUnit, updateUnit } = useWorkUnits(id);
  const { data: explanation } = useWorkExplanation(id);

  const updateItemMutation = useUpdateWorkItem();
  const deleteItemMutation = useDeleteWorkItem();
  const { startSession, logManualTime } = useActiveSessionTracking();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskHours, setNewSubtaskHours] = useState('1.0');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Edit Dossier Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('project');
  const [editDeadline, setEditDeadline] = useState('');
  const [editEffort, setEditEffort] = useState('2.0');
  const [editImportance, setEditImportance] = useState('1.0');
  const [editIsHard, setEditIsHard] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditModal = () => {
    if (!item) return;
    setEditTitle(item.title || '');
    setEditDescription(item.description || '');
    setEditCategory((item.category || 'project').toLowerCase());
    setEditDeadline(item.deadlineUtc ? item.deadlineUtc.slice(0, 16) : '');
    setEditEffort(String(item.estimatedEffortHours || 2.0));
    setEditImportance(String(item.importance_weight ?? 1.0));
    setEditIsHard(item.isHardDeadline ?? true);
    setEditError(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !item) return;

    setIsSavingEdit(true);
    setEditError(null);
    try {
      const payload: any = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        category: editCategory.toLowerCase(),
        importance_weight: Math.min(3.0, Math.max(0.5, parseFloat(editImportance) || 1.0)),
        total_estimated_hours: Math.max(0.1, parseFloat(editEffort) || 1.0),
        is_hard_deadline: editIsHard,
      };

      if (editDeadline) {
        payload.deadline_utc = new Date(editDeadline).toISOString();
      }

      await updateItemMutation.mutateAsync({
        id: item.id,
        payload,
      });

      setShowEditModal(false);
      setToastMessage('Work dossier successfully updated in database.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update work dossier. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-surface flex items-center justify-center">
        <div className="text-ink-secondary font-label-md animate-pulse">
          Loading work dossier...
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="w-full min-h-screen bg-surface flex flex-col items-center justify-center gap-space-sm p-margin">
        <span className="material-symbols-outlined text-[48px] text-ink-muted">error_outline</span>
        <h2 className="font-headline-lg text-headline-lg text-ink-primary">
          Commitment Not Found
        </h2>
        <p className="font-body-md text-body-md text-ink-secondary">
          The requested work dossier does not exist in the active ledger or may have been archived.
        </p>
        <div className="flex gap-space-sm mt-space-sm">
          <button
            onClick={() => refetch()}
            className="px-space-md py-2 bg-surface-cream text-ink-primary font-label-md border border-border-hairline"
          >
            Retry Fetch
          </button>
          <Link
            to="/work"
            className="px-space-md py-2 bg-ink-primary text-canvas-paper font-label-md"
          >
            Return to Work Ledger
          </Link>
        </div>
      </div>
    );
  }

  const toggleUnitCompletion = async (unit: WorkUnit) => {
    try {
      await updateUnit({
        unitId: unit.id,
        payload: { is_completed: !unit.isCompleted },
      });
      setToastMessage(`Updated subtask "${unit.title}".`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setToastMessage(`Failed to update subtask: ${err?.message || 'Server error'}`);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !id) return;
    try {
      await createUnit({
        title: newSubtaskTitle.trim(),
        estimated_hours: parseFloat(newSubtaskHours) || 1.0,
      });
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
      setToastMessage('Subtask persisted to execution plan.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setToastMessage(`Failed to add subtask: ${err?.message || 'Server error'}`);
    }
  };

  const handleLogTime = async (incrementHours: number, label: string) => {
    try {
      const minutes = Math.round(incrementHours * 60);
      const now = new Date();
      const start = new Date(now.getTime() - minutes * 60 * 1000);

      await logManualTime({
        work_item_id: item.id,
        start_time: start.toISOString(),
        end_time: now.toISOString(),
        duration_minutes: minutes,
        notes: `Manual log: +${label}`,
      });

      setToastMessage(`Recorded +${label} to work item. Synchronized with database.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(`Failed to record time: ${err?.message || 'Server error'}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleCustomLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(customHours);
    if (!h || h <= 0) return;
    await handleLogTime(h, `${h}h custom entry`);
    setShowCustomModal(false);
    setCustomHours('');
  };

  const handleStartFocus = async () => {
    try {
      await startSession({
        work_item_id: item.id,
        notes: `Sprint: ${item.title}`,
      });
    } catch (err) {
      console.warn('Session start note:', err);
    }
    navigate('/today');
  };

  const handleMarkCompleted = async () => {
    try {
      await updateItemMutation.mutateAsync({
        id: item.id,
        payload: { status: isCompleted ? ('IN_PROGRESS' as any) : ('COMPLETED' as any) },
      });
      setToastMessage(isCompleted ? 'Work item reactivated in database.' : 'Work item marked as completed in database.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(`Failed to update status: ${err?.message || 'Server error'}`);
    }
  };

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await deleteItemMutation.mutateAsync(item.id);
        navigate('/work');
      } catch (err: any) {
        setToastMessage(`Failed to delete commitment: ${err?.message || 'Server error'}`);
      }
    }
  };

  const isCompleted = item.status?.toLowerCase() === 'completed';
  const deadlineStr = item.deadlineUtc
    ? new Date(item.deadlineUtc).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No deadline';

  return (
    <div className="w-full flex flex-col min-h-screen bg-surface">
      {/* Sub-Navigation Bar */}
      <SubNavigation
        items={[
          { label: 'Work Ledger', path: '/work' },
          { label: 'Priorities', path: '/priorities' },
          { label: 'Work Detail', path: `/work/${item.id}`, indicator: true },
        ]}
        statusText={`Dossier ${item.id.slice(0, 8)} · ${item.status.toUpperCase()}`}
      />

      {/* Minimal Context / Breadcrumbs Bar */}
      <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-sm">
        <div className="max-w-6xl flex items-center gap-space-xs font-label-md text-label-md text-ink-muted">
          <Link to="/work" className="hover:text-ink-primary transition-colors duration-150">
            Work
          </Link>
          <span>/</span>
          <span className="text-ink-secondary">{item.category}</span>
          <span>/</span>
          <span className="text-ink-primary font-medium">{item.title}</span>
        </div>
      </section>

      {/* Editorial Document Header & Primary Status Strip */}
      <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-lg">
        <div className="max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-md">
            <h1 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight max-w-3xl">
              {item.title}
            </h1>
            <div className="flex items-center gap-space-sm shrink-0">
              <button
                type="button"
                onClick={openEditModal}
                className="px-space-sm py-1 bg-surface-cream hover:bg-surface-tint border border-border-hairline text-ink-primary font-label-md text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Edit Dossier</span>
              </button>
              <div className="flex items-center gap-space-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.riskLevel === 'CRITICAL'
                      ? 'bg-status-alert'
                      : isCompleted
                      ? 'bg-ink-muted'
                      : 'bg-ink-primary'
                  }`}
                />
                <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                  {isCompleted ? 'COMPLETED' : item.riskLevel === 'CRITICAL' ? 'CRITICAL HORIZON' : 'ON TRACK · SAFE'}
                </span>
              </div>
            </div>
          </div>

          {/* Human Capacity & State Strip */}
          <div className="mt-space-lg bg-surface-cream px-space-md py-space-md grid grid-cols-2 md:grid-cols-4 gap-space-md border border-border-hairline">
            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                Logged Effort
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-ink-primary font-bold">
                  {(item.actualLoggedHours || 0).toFixed(1)}
                </span>
                <span className="font-body-md text-body-md text-ink-secondary">hrs</span>
              </div>
              <span className="font-label-md text-label-md text-ink-secondary">Recorded time entries</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                Remaining Work
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-ink-primary font-bold">
                  {(item.remainingEffortHours || 0).toFixed(1)}
                </span>
                <span className="font-body-md text-body-md text-ink-secondary">hrs</span>
              </div>
              <span className="font-label-md text-label-md text-ink-secondary">
                of {(item.estimatedEffortHours || 0).toFixed(1)}h nominal
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                Deadline
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-ink-primary text-sm font-semibold truncate">
                  {deadlineStr}
                </span>
              </div>
              <span className="font-label-md text-label-md text-ink-secondary">
                {item.isHardDeadline ? 'Strict hard cutoff' : 'Flexible deadline'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                Priority Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-ink-primary font-bold">
                  {(item.dynamicPriorityScore || 50).toFixed(1)}
                </span>
                <span className="font-body-md text-body-md text-ink-secondary">/ 100</span>
              </div>
              <span className="font-label-md text-label-md text-ink-secondary">
                Category: {item.category}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Editorial Split Layout */}
      <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-2xl">
        <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            {/* Section 1: Work Description & Scope */}
            <article className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                  Document Scope &amp; Details
                </span>
                <button
                  type="button"
                  onClick={openEditModal}
                  className="font-label-md text-xs text-accent-terracotta hover:underline cursor-pointer"
                >
                  Edit Scope
                </button>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-ink-primary">
                {item.title}
              </h2>
              <div className="font-body-lg text-body-lg text-ink-secondary flex flex-col gap-space-sm pt-space-xs">
                <p>
                  {item.description ||
                    'Commitment parsed and registered in active execution ledger. Work is scheduled against user focus availability.'}
                </p>
              </div>
            </article>

            {/* Section 2: Chronological Execution Plan */}
            <section className="flex flex-col gap-space-md">
              <div className="flex items-baseline justify-between">
                <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                  Execution Plan ({units.length} Subtasks)
                </span>
                <div className="flex items-center gap-space-sm">
                  <span className="font-label-md text-label-md text-ink-secondary">
                    {units.filter((u) => u.isCompleted).length} of {units.length} complete
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingSubtask(!isAddingSubtask)}
                    className="font-label-md text-xs text-accent-terracotta underline cursor-pointer"
                  >
                    {isAddingSubtask ? 'Cancel' : '+ Add Subtask'}
                  </button>
                </div>
              </div>

              {/* Inline Add Subtask Form */}
              {isAddingSubtask && (
                <form
                  onSubmit={handleAddSubtask}
                  className="p-space-sm bg-surface-cream border border-border-hairline flex flex-col gap-2"
                >
                  <span className="font-label-md text-xs text-ink-primary font-semibold">New Subtask:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Subtask deliverable description..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 bg-surface border border-border-hairline px-2 py-1 text-sm text-ink-primary focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="20"
                      value={newSubtaskHours}
                      onChange={(e) => setNewSubtaskHours(e.target.value)}
                      className="w-16 bg-surface border border-border-hairline px-2 py-1 text-sm text-ink-primary focus:outline-none"
                      title="Estimated hours"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-ink-primary text-canvas-paper text-xs font-label-md hover:bg-accent-terracotta transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              <div className="flex flex-col gap-2">
                {units.length === 0 ? (
                  <div className="p-space-md bg-surface-cream border border-border-hairline text-center text-ink-secondary text-sm">
                    No subtasks attached yet. Click "+ Add Subtask" to structure this commitment.
                  </div>
                ) : (
                  units.map((unit) => (
                    <div
                      key={unit.id}
                      onClick={() => toggleUnitCompletion(unit)}
                      role="checkbox"
                      aria-checked={unit.isCompleted}
                      tabIndex={0}
                      className={`py-space-md px-space-md flex items-start justify-between gap-space-md cursor-pointer transition-colors duration-150 border focus:outline-none ${
                        unit.isCompleted
                          ? 'bg-canvas-paper border-border-hairline opacity-75'
                          : 'bg-surface-cream border-border-hairline'
                      }`}
                    >
                      <div className="flex items-start gap-space-sm">
                        <span
                          className={`material-symbols-outlined text-[20px] mt-0.5 ${
                            unit.isCompleted ? 'text-ink-primary' : 'text-accent-terracotta'
                          }`}
                        >
                          {unit.isCompleted ? 'check_circle' : 'schedule'}
                        </span>
                        <div className="flex flex-col">
                          <span
                            className={`font-headline-md text-headline-md ${
                              unit.isCompleted
                                ? 'text-ink-primary line-through opacity-60'
                                : 'text-ink-primary'
                            }`}
                          >
                            {unit.title}
                          </span>
                          <span
                            className={`font-label-md text-label-md mt-1 ${
                              unit.isCompleted ? 'text-ink-muted' : 'text-accent-terracotta font-medium'
                            }`}
                          >
                            {unit.isCompleted ? 'Completed' : 'Pending focus'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-label-lg text-label-lg text-ink-primary block font-semibold">
                          {(unit.estimatedMinutes / 60).toFixed(1)}h
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Section 3: Time Logging & Recorded Sessions */}
            <section className="flex flex-col gap-space-md bg-canvas-paper p-space-md border border-border-hairline">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-xs">
                <div>
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest block">
                    Logged Intervals
                  </span>
                  <h3 className="font-headline-md text-headline-md text-ink-primary">
                    {(item.actualLoggedHours || 0).toFixed(1)} Hours Recorded
                  </h3>
                </div>

                <div className="flex items-center gap-space-xs">
                  <button
                    onClick={() => handleLogTime(0.5, '30m')}
                    className="px-space-sm py-1 bg-surface-cream hover:bg-surface-tint font-label-md text-label-md text-ink-primary transition-colors border border-border-hairline cursor-pointer"
                  >
                    +30m
                  </button>
                  <button
                    onClick={() => handleLogTime(1.0, '1.0h')}
                    className="px-space-sm py-1 bg-surface-cream hover:bg-surface-tint font-label-md text-label-md text-ink-primary transition-colors border border-border-hairline cursor-pointer"
                  >
                    +1.0h
                  </button>
                  <button
                    onClick={() => setShowCustomModal(true)}
                    className="px-space-sm py-1 bg-ink-primary text-canvas-paper hover:bg-accent-terracotta font-label-md text-label-md transition-colors cursor-pointer"
                  >
                    Custom Entry
                  </button>
                </div>
              </div>

              {/* Custom Time Modal */}
              {showCustomModal && (
                <form
                  onSubmit={handleCustomLogSubmit}
                  className="p-3 bg-surface-cream border border-border-hairline flex items-center gap-2"
                >
                  <span className="font-label-md text-xs text-ink-primary">Hours to log:</span>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    max="24"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    placeholder="e.g. 1.5"
                    className="w-24 bg-surface border border-border-hairline px-2 py-1 text-sm focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-ink-primary text-canvas-paper text-xs font-label-md"
                  >
                    Save Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="text-xs text-ink-muted hover:text-ink-primary"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {toastMessage && (
                <div
                  role="status"
                  aria-live="polite"
                  className="font-label-md text-label-md text-accent-terracotta pt-space-xs font-semibold animate-pulse"
                >
                  {toastMessage}
                </div>
              )}
            </section>
          </div>

          {/* Right Column (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-xl">
            {/* Primary Action Callout */}
            <div className="bg-surface-cream p-space-md flex flex-col gap-space-md border border-border-hairline">
              <div className="flex flex-col gap-1">
                <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                  Recommended Action
                </span>
                <h3 className="font-headline-md text-headline-md text-ink-primary">
                  Immediate Focus Window
                </h3>
                <p className="font-body-md text-body-md text-ink-secondary">
                  Entering deep work now locks progress directly against this commitment and keeps schedule balanced.
                </p>
              </div>

              <div className="flex flex-col gap-space-xs pt-space-xs">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartFocus}
                >
                  Focus This Work Now
                </Button>
                <div className="grid grid-cols-2 gap-space-xs pt-1">
                  <Link
                    to="/planning"
                    className="py-space-xs px-space-sm bg-surface hover:bg-surface-tint text-ink-primary font-label-md text-label-md text-center transition-colors border border-border-hairline"
                  >
                    Reschedule Plan
                  </Link>
                  <button
                    onClick={handleMarkCompleted}
                    className="py-space-xs px-space-sm bg-surface hover:bg-surface-tint text-ink-primary font-label-md text-label-md text-center transition-colors border border-border-hairline cursor-pointer"
                  >
                    {isCompleted ? 'Mark Active' : 'Mark Completed'}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Risk Explanation & Intelligence */}
            <div className="bg-canvas-paper p-space-md flex flex-col gap-space-sm border border-border-hairline">
              <div className="flex items-center justify-between pb-1 border-b border-border-hairline">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                    AI Risk Explanation
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-surface-cream text-accent-terracotta px-1 py-0.5 border border-border-hairline">
                  AI INTERPRETATION
                </span>
              </div>

              <p className="font-body-md text-body-md text-ink-primary font-medium">
                {explanation?.summary ||
                  `Evaluation for "${item.title}": Remaining effort is balanced against available calendar focus capacity.`}
              </p>

              {explanation?.contributing_factors && explanation.contributing_factors.length > 0 && (
                <div className="pt-1">
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider block mb-1">
                    Contributing Factors
                  </span>
                  <ul className="text-xs text-ink-secondary list-disc pl-4 space-y-1">
                    {explanation.contributing_factors.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {explanation?.mitigations && explanation.mitigations.length > 0 && (
                <div className="pt-1 bg-surface-cream p-2 border border-border-hairline">
                  <span className="font-label-md text-label-md text-ink-primary font-semibold block mb-1">
                    Suggested Mitigations
                  </span>
                  <ul className="text-xs text-ink-secondary list-disc pl-4 space-y-0.5">
                    {explanation.mitigations.map((mit, idx) => (
                      <li key={idx}>{mit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="pt-space-sm flex items-center justify-between font-label-md text-label-md text-ink-secondary">
              <button
                onClick={openEditModal}
                className="hover:text-ink-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Edit Details</span>
              </button>
              <button
                onClick={() => window.print()}
                className="hover:text-ink-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Work Brief</span>
              </button>
              <button
                onClick={handleArchive}
                className="hover:text-status-alert transition-colors flex items-center gap-1 cursor-pointer text-status-alert/80"
              >
                <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                <span>Delete Commitment</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Commitment Dossier Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/40 backdrop-blur-xs p-4">
          <div className="bg-canvas-paper border border-border-hairline max-w-xl w-full p-space-lg shadow-xl flex flex-col gap-space-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-space-xs border-b border-border-hairline">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 bg-accent-terracotta inline-block shrink-0" />
                <h3 className="font-headline-md text-headline-md text-ink-primary">
                  Edit Work Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-ink-muted hover:text-ink-primary font-mono text-sm cursor-pointer p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-accent-terracotta/10 border border-accent-terracotta/30 text-accent-terracotta font-body-md text-sm">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                  Work Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-surface border border-border-hairline px-3 py-1.5 font-headline-md text-ink-primary focus:outline-none focus:border-ink-primary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                  Description &amp; Scope
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Additional context or notes..."
                  className="bg-surface border border-border-hairline px-3 py-1.5 font-body-md text-ink-primary focus:outline-none focus:border-ink-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="bg-surface border border-border-hairline px-2 py-1.5 font-label-md text-ink-primary focus:outline-none cursor-pointer"
                  >
                    <option value="project">Project / Development</option>
                    <option value="academic">Academic / Coursework</option>
                    <option value="career">Career / Professional</option>
                    <option value="exam_prep">Exam Preparation</option>
                    <option value="personal">Personal Commitment</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                    Target Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="bg-surface border border-border-hairline px-2 py-1.5 font-label-md text-ink-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                    Total Estimated Effort (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="200"
                    value={editEffort}
                    onChange={(e) => setEditEffort(e.target.value)}
                    className="bg-surface border border-border-hairline px-2 py-1.5 font-label-md text-ink-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                    Importance Weight (0.5 – 3.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="3.0"
                    value={editImportance}
                    onChange={(e) => setEditImportance(e.target.value)}
                    className="bg-surface border border-border-hairline px-2 py-1.5 font-label-md text-ink-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-is-hard"
                  checked={editIsHard}
                  onChange={(e) => setEditIsHard(e.target.checked)}
                  className="accent-ink-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="edit-is-hard" className="font-label-md text-ink-primary cursor-pointer">
                  Strict Hard Deadline Cutoff
                </label>
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-sm border-t border-border-hairline mt-space-xs">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-space-md py-1.5 bg-surface text-ink-secondary hover:text-ink-primary font-label-md border border-border-hairline transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? 'Persisting Changes...' : 'Save Dossier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
