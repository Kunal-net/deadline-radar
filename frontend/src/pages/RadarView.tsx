import React, { useMemo } from 'react';
import { RadarHero } from '../components/radar/RadarHero';
import { CapacityBalancePlate } from '../components/radar/CapacityBalancePlate';
import { ApproachingDeadlinesList, DeadlineItem } from '../components/radar/ApproachingDeadlinesList';
import { FeasibilityIntake } from '../components/radar/FeasibilityIntake';
import { useAppStore } from '../store/useAppStore';
import { useDashboardSummary, useWorkItems } from '../services/apiHooks';
import { CapacityMetric, WorkItem } from '../services/apiTypes';

export const RadarView: React.FC = () => {
  const { startSession } = useAppStore();
  const { data: summary, isLoading: isLoadingSummary } = useDashboardSummary();
  const { data: workItems, isLoading: isLoadingWork } = useWorkItems();

  const activeWorkItems = useMemo<WorkItem[]>(() => {
    return (workItems || []).filter((w: WorkItem) => w.status !== 'COMPLETED');
  }, [workItems]);

  const defaultMetric: CapacityMetric = useMemo(() => {
    const avail = summary?.weekCapacityHours ?? 24;
    const work = summary?.weekWorkloadHours ?? activeWorkItems.reduce((acc: number, item: WorkItem) => acc + (item.remainingEffortHours ?? item.estimatedEffortHours ?? 0), 0);
    const buffer = avail - work;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);

    return {
      availableFocusHours: avail,
      committedWorkHours: work,
      netBufferHours: buffer,
      riskAssessment: summary?.capacityStatus || (buffer < 0 ? 'Overloaded' : buffer < 4 ? 'Tight' : 'Balanced'),
      weekNumber: weekNumber > 0 ? weekNumber : 1,
    };
  }, [summary, activeWorkItems]);

  const metric = summary?.capacityMetric || defaultMetric;

  const deadlineItems: DeadlineItem[] = useMemo(() => {
    return activeWorkItems
      .slice()
      .sort((a: WorkItem, b: WorkItem) => {
        const da = a.deadlineUtc ? new Date(a.deadlineUtc).getTime() : Infinity;
        const db = b.deadlineUtc ? new Date(b.deadlineUtc).getTime() : Infinity;
        return da - db;
      })
      .map((item: WorkItem) => {
        const deadlineDate = item.deadlineUtc ? new Date(item.deadlineUtc) : null;
        const now = new Date();
        const diffHours = deadlineDate ? (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60) : null;
        const diffDays = diffHours !== null ? Math.round(diffHours / 24) : null;

        let dueLabel = 'No deadline';
        if (diffHours !== null) {
          if (diffHours < 0) dueLabel = 'Overdue';
          else if (diffHours <= 24) dueLabel = 'Due today';
          else if (diffDays === 1) dueLabel = 'Due tomorrow';
          else dueLabel = `Due in ${diffDays} days`;
        }

        const dueFormatted = deadlineDate
          ? deadlineDate.toLocaleDateString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
          : 'Flexible timeframe';

        const isCritical = item.riskLevel === 'CRITICAL' || item.riskLevel === 'OVERDUE';
        const isWatch = item.riskLevel === 'WATCH' || item.riskLevel === 'AT_RISK';

        return {
          id: item.id,
          dueLabel,
          dueFormatted,
          dotColor: isCritical ? 'bg-accent-terracotta' : isWatch ? 'bg-ink-primary' : 'bg-ink-muted',
          title: item.title,
          description: item.description || `Active commitment under ${item.category}`,
          riskBadge: `Risk: ${item.riskLevel.replace('_', ' ')}`,
          riskBadgeColor: isCritical ? 'text-accent-terracotta' : isWatch ? 'text-ink-primary' : 'text-ink-muted',
          riskExplanation: item.isHardDeadline ? 'Strict hard deadline' : 'Flexible horizon target',
          remainingHours: `${(item.remainingEffortHours ?? item.estimatedEffortHours ?? 0).toFixed(1)} hrs`,
          againstLabel: `Allocation: ${item.category}`,
          actionLabel: 'Start Focus',
          actionPrimary: true,
          linkTo: `/work/${item.id}`,
        };
      });
  }, [activeWorkItems]);

  const handleStartFocus = (title: string, id: string) => {
    startSession(title, id);
  };

  if (isLoadingSummary && isLoadingWork) {
    return (
      <div className="w-full flex items-center justify-center py-space-2xl">
        <span className="font-label-lg text-label-lg text-ink-muted">Loading Radar telemetry...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {/* SECTION 1: EDITORIAL HERO & ASYMMETRIC VISUAL SPLIT */}
      <RadarHero metric={metric} commitmentsCount={activeWorkItems.length} />

      {/* SECTION 2: THE REALITY CHECK / HORIZON CAPACITY BALANCE */}
      <CapacityBalancePlate metric={metric} items={activeWorkItems} />

      {/* SECTION 3: EDITORIAL DEADLINE HORIZON (OPEN LIST) */}
      <ApproachingDeadlinesList items={deadlineItems} onStartFocus={handleStartFocus} />

      {/* SECTION 4: FEASIBILITY EVALUATION INTAKE */}
      <FeasibilityIntake availableBufferHours={metric.netBufferHours} />
    </div>
  );
};
